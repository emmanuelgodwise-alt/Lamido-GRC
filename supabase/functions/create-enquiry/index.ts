// ============================================================================
// Lamido, Lamido & Co. — Edge Function: create-enquiry
// ----------------------------------------------------------------------------
// The ONLY writer of public enquiry rows. Runs on Supabase Edge Runtime
// (Deno). Security model (project brief, Stage 3/4):
//   * Clients may never write enquiries directly — RLS has no insert policy;
//     this function inserts with the service role, which bypasses RLS.
//   * The service-role key exists ONLY as a Supabase function secret. It is
//     never in the repository, the browser, NEXT_PUBLIC_*, or logs.
//   * Every payload is validated server-side (shared validation module),
//     size-capped, origin-checked, honeypot- and rate-limit-protected.
//   * Responses are safe and non-sensitive; errors never leak internals.
//
// Deploy (owner — see docs/enquiry-live-test.md):
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... RATE_LIMIT_SECRET=... \
//     ALLOWED_ORIGINS=https://your-domain
//   supabase functions deploy create-enquiry
// ============================================================================

import { createClient } from "npm:@supabase/supabase-js@2";
import { validateEnquiry } from "../../../src/lib/validation/enquiry.ts";

const MAX_BODY_BYTES = 32 * 1024; // hard cap — well above the largest valid form
const RATE_LIMIT_PER_HOUR = Number(Deno.env.get("RATE_LIMIT_PER_HOUR") ?? 5);
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_ROW_RETENTION_DAYS = 7; // hashed IP records are pruned after this

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RATE_LIMIT_SECRET =
  Deno.env.get("RATE_LIMIT_SECRET") ?? SERVICE_ROLE_KEY; // pepper for IP hashing
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

function jsonResponse(status: number, body: Record<string, unknown>, origin: string | null): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...CORS_HEADERS,
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify(body), { status, headers });
}

function originAllowed(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.length === 0) {
    // No allow-list configured (development). Production MUST set
    // ALLOWED_ORIGINS — documented in docs/enquiry-live-test.md.
    return true;
  }
  return ALLOWED_ORIGINS.includes(origin);
}

/** HMAC-SHA256 of the caller IP with the server-side pepper. Raw IPs are
 *  never stored (project brief: keyed hash only, pruned after retention). */
async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(RATE_LIMIT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(ip));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function callerIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function makeReferenceId(): string {
  const now = new Date();
  const date = [
    String(now.getUTCFullYear()).slice(2),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
  ].join("");
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no ambiguous glyphs
  let random = "";
  for (let i = 0; i < 6; i += 1) {
    random += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `LLC-${date}-${random}`;
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("Origin");

  // CORS preflight
  if (request.method === "OPTIONS") {
    return originAllowed(origin)
      ? new Response(null, { status: 204, headers: { ...CORS_HEADERS, "Access-Control-Allow-Origin": origin! } })
      : new Response(null, { status: 403 });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { ok: false, error: "method_not_allowed" }, origin);
  }
  if (!originAllowed(origin)) {
    return jsonResponse(403, { ok: false, error: "origin_not_allowed" }, origin);
  }

  // Body size cap before parsing.
  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return jsonResponse(413, { ok: false, error: "payload_too_large" }, origin);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse(400, { ok: false, error: "invalid_json" }, origin);
  }

  // Shared validation (server-side execution — the client copy is for UX only).
  // The module enforces required fields, lengths, allowed values, consent,
  // the honeypot, and the minimum completion time.
  const normalized = validateEnquiry(payload);
  if (!normalized.ok) {
    // Field-level messages are our own validation strings — safe to return.
    // Honeypot/timing rejections already carry only generic messages.
    return jsonResponse(400, { ok: false, errors: normalized.errors }, origin);
  }

  const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Rate limiting by keyed IP hash (never the raw IP).
  try {
    const ipHash = await hashIp(callerIp(request));
    const windowStart = new Date(Date.now() - RATE_WINDOW_MS).toISOString();

    const { count } = await db
      .from("enquiry_rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", windowStart);

    if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
      return jsonResponse(429, { ok: false, error: "rate_limited" }, origin);
    }
    await db.from("enquiry_rate_limits").insert({ ip_hash: ipHash });

    // Opportunistic pruning of expired hash records.
    const retentionCutoff = new Date(
      Date.now() - RATE_ROW_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    await db
      .from("enquiry_rate_limits")
      .delete()
      .lt("created_at", retentionCutoff);
  } catch {
    // Fail closed on rate-limit infrastructure errors.
    return jsonResponse(500, { ok: false, error: "server_error" }, origin);
  }

  // Insert with retry on reference-id collision (unique constraint).
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const referenceId = makeReferenceId();
    const { error } = await db.from("enquiries").insert({
      reference_id: referenceId,
      ...normalized.value,
      consent_at: new Date().toISOString(), // server timestamp — never client-supplied
      // status/admin fields intentionally omitted: DB defaults apply.
    });
    if (!error) {
      return jsonResponse(200, { ok: true, referenceId }, origin);
    }
    if (error.code === "23505") continue; // duplicate reference id — retry
    console.error("create-enquiry insert failed:", error.code); // code only — no payload data
    return jsonResponse(500, { ok: false, error: "server_error" }, origin);
  }

  return jsonResponse(500, { ok: false, error: "server_error" }, origin);
});
