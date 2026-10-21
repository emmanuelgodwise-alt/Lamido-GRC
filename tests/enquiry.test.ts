import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import {
  validateEnquiry,
  ALLOWED_SECTOR_VALUES,
  ALLOWED_DIVISION_VALUES,
} from "../src/lib/validation/enquiry";
import { submitEnquiry } from "../src/lib/enquiry-submit";
import { serviceDivisions } from "../src/lib/divisions";
import { sectors } from "../src/lib/sectors";

/**
 * Stage 4 tests — enquiry validation, submission outcomes, and secret-leak
 * guards. All network paths use an injected fetch; nothing here touches a
 * real backend, and no test asserts a fake success.
 */

const VALID_FORM = {
  name: "  Amina   Yusuf ",
  email: "Amina.Yusuf@Example-Org.COM",
  organization: "Example Org Ltd",
  role: "Director",
  country: "Germany",
  region: "Kano",
  sector: "agriculture",
  division: "market-entry-business-development",
  subject: "Agro-processing entry question",
  message: "We are exploring a processing partnership and need regional support.",
  consent: true,
  website: "",
  elapsedMs: 30_000,
};

// ---------------------------------------------------------------------------
// validateEnquiry — the shared rulebook
// ---------------------------------------------------------------------------
describe("validateEnquiry", () => {
  test("valid submission passes and is normalized", () => {
    const result = validateEnquiry(VALID_FORM);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Amina Yusuf"); // whitespace collapsed + trimmed
      expect(result.value.email).toBe("amina.yusuf@example-org.com"); // lowercased
      expect(result.value.role).toBe("Director");
    }
  });

  test("invalid email is rejected", () => {
    const result = validateEnquiry({ ...VALID_FORM, email: "not-an-email" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBeDefined();
  });

  test("missing consent is rejected", () => {
    const result = validateEnquiry({ ...VALID_FORM, consent: false });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.consent).toBeDefined();
  });

  test("overlong input is rejected", () => {
    const result = validateEnquiry({ ...VALID_FORM, subject: "x".repeat(161) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.subject).toBeDefined();
  });

  test("overlong message is rejected", () => {
    const result = validateEnquiry({ ...VALID_FORM, message: "x".repeat(5001) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.message).toBeDefined();
  });

  test("honeypot filled is rejected with a generic message", () => {
    const result = validateEnquiry({ ...VALID_FORM, website: "http://spam.example" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.form).toBeDefined();
      expect(JSON.stringify(result.errors)).not.toContain("honeypot");
    }
  });

  test("submission faster than the minimum completion time is rejected", () => {
    const result = validateEnquiry({ ...VALID_FORM, elapsedMs: 100 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.form).toBeDefined();
  });

  test("unexpected fields are rejected (mass-assignment guard)", () => {
    const result = validateEnquiry({ ...VALID_FORM, status: "closed", admin_notes: "pwn" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.form).toBeDefined();
  });

  test("non-object input is rejected", () => {
    expect(validateEnquiry(null).ok).toBe(false);
    expect(validateEnquiry("hello").ok).toBe(false);
  });

  test("invalid sector/division values are rejected", () => {
    expect(validateEnquiry({ ...VALID_FORM, sector: "aerospace" }).ok).toBe(false);
    expect(validateEnquiry({ ...VALID_FORM, division: "misc" }).ok).toBe(false);
  });

  test("allowed values stay in sync with the typed configs", () => {
    expect([...ALLOWED_SECTOR_VALUES] as string[]).toEqual([
      ...sectors.map((sector) => sector.id),
      "other",
      "not-sure-yet",
    ]);
    expect([...ALLOWED_DIVISION_VALUES] as string[]).toEqual([
      ...serviceDivisions.map((division) => division.id),
      "not-sure-yet",
    ]);
  });
});

// ---------------------------------------------------------------------------
// submitEnquiry — every network outcome with an injected fetch
// ---------------------------------------------------------------------------
describe("submitEnquiry", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalEnv.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
      originalEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  const jsonResponse = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  test("valid submission returns success with the reference ID", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const outcome = await submitEnquiry(
      { ...VALID_FORM },
      async (url, init) => {
        calls.push({ url: url as string, init });
        return jsonResponse(200, { ok: true, referenceId: "LLC-261021-ABC123" });
      },
      true,
    );
    expect(outcome).toEqual({ kind: "success", referenceId: "LLC-261021-ABC123" });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://test-project.supabase.co/functions/v1/create-enquiry");
  });

  test("request body carries only allowed fields and no secrets", async () => {
    let captured: Record<string, unknown> = {};
    let capturedAuth = "";
    await submitEnquiry(
      { ...VALID_FORM },
      async (_url, init) => {
        captured = JSON.parse(String(init?.body));
        capturedAuth = (init?.headers as Record<string, string>).Authorization;
        return jsonResponse(200, { ok: true, referenceId: "LLC-261021-XYZ789" });
      },
      true,
    );
    expect(Object.keys(captured).sort()).toEqual(
      [
        "name", "email", "organization", "role", "country", "region",
        "sector", "division", "subject", "message", "consent", "website",
        "elapsedMs",
      ].sort(),
    );
    expect(capturedAuth).toBe("Bearer test-anon-key"); // public value only
    expect(JSON.stringify(captured)).not.toContain("service");
  });

  test("invalid form never reaches the network", async () => {
    let called = 0;
    const outcome = await submitEnquiry(
      { ...VALID_FORM, email: "broken" },
      async () => {
        called += 1;
        return jsonResponse(200, {});
      },
      true,
    );
    expect(called).toBe(0);
    expect(outcome.kind).toBe("invalid");
  });

  test("backend field rejection (400) maps to invalid", async () => {
    const outcome = await submitEnquiry(
      { ...VALID_FORM },
      async () => jsonResponse(400, { ok: false, errors: { email: "Please enter a valid work email address." } }),
      true,
    );
    expect(outcome).toEqual({
      kind: "invalid",
      errors: { email: "Please enter a valid work email address." },
    });
  });

  test("rate limiting (429) is reported honestly", async () => {
    const outcome = await submitEnquiry(
      { ...VALID_FORM },
      async () => jsonResponse(429, { ok: false, error: "rate_limited" }),
      true,
    );
    expect(outcome.kind).toBe("rate-limited");
  });

  test("origin block (403) is reported honestly", async () => {
    const outcome = await submitEnquiry(
      { ...VALID_FORM },
      async () => jsonResponse(403, { ok: false, error: "origin_not_allowed" }),
      true,
    );
    expect(outcome.kind).toBe("origin-blocked");
  });

  test("network failure returns network-error — never a fake success", async () => {
    const outcome = await submitEnquiry(
      { ...VALID_FORM },
      async () => {
        throw new TypeError("Failed to fetch");
      },
      true,
    );
    expect(outcome.kind).toBe("network-error");
  });

  test("server failure (500) returns server-error", async () => {
    const outcome = await submitEnquiry(
      { ...VALID_FORM },
      async () => jsonResponse(500, { ok: false, error: "server_error" }),
      true,
    );
    expect(outcome.kind).toBe("server-error");
  });

  test("offline state is detected before any request", async () => {
    let called = 0;
    const outcome = await submitEnquiry(
      { ...VALID_FORM },
      async () => {
        called += 1;
        return jsonResponse(200, {});
      },
      false,
    );
    expect(called).toBe(0);
    expect(outcome.kind).toBe("offline");
  });

  test("missing configuration is reported, not faked", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const outcome = await submitEnquiry(
      { ...VALID_FORM },
      async () => jsonResponse(200, { ok: true }),
      true,
    );
    expect(outcome.kind).toBe("not-configured");
  });
});

// ---------------------------------------------------------------------------
// Secret-leak guards — the browser path must never mention service keys
// ---------------------------------------------------------------------------
describe("secret-leak guards", () => {
  test("client submission code contains no service-role usage", async () => {
    // Scan for the identifiers/env names that would constitute actual usage —
    // prose comments explaining that the key never enters the client are fine.
    const usagePatterns = ["SERVICE_ROLE", "service_role", "serviceRole"];
    for (const path of [
      "src/lib/enquiry-submit.ts",
      "src/lib/validation/enquiry.ts",
      "src/lib/supabase/client.ts",
      "src/components/contact/enquiry-form.tsx",
    ]) {
      const source = await Bun.file(path).text();
      for (const pattern of usagePatterns) {
        expect(source.includes(pattern)).toBe(false);
      }
    }
  });
});
