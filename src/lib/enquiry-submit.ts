/**
 * Enquiry submission client — the single path from the form to the
 * `create-enquiry` Supabase Edge Function.
 *
 * Extracted as a module so every outcome (success, invalid, rate-limited,
 * network failure, backend failure, not-configured, offline) is unit-tested
 * with an injected fetch — no fake success is ever returned.
 *
 * The Authorization header carries ONLY the public anon key (by design).
 * The service-role key never appears anywhere in this module or its callers.
 */
import { validateEnquiry } from "@/lib/validation/enquiry";

export type SubmitOutcome =
  | { kind: "not-configured" }
  | { kind: "offline" }
  | { kind: "invalid"; errors: Record<string, string> }
  | { kind: "success"; referenceId: string }
  | { kind: "rate-limited" }
  | { kind: "origin-blocked" }
  | { kind: "network-error" }
  | { kind: "server-error" };

/** Raw form state shape — validated inside before anything is sent. */
export interface EnquirySubmissionInput {
  name: string;
  email: string;
  organization: string;
  role: string;
  country: string;
  region: string;
  sector: string;
  division: string;
  subject: string;
  message: string;
  consent: boolean;
  website: string; // honeypot — must be empty
  elapsedMs: number;
}

function endpoint(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return `${url}/functions/v1/create-enquiry`;
}

/** Injectable fetch shape (looser than typeof fetch — friendlier to tests). */
export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export async function submitEnquiry(
  payload: EnquirySubmissionInput,
  fetchImpl: FetchLike = (input, init) => fetch(input, init),
  online: boolean = typeof navigator === "undefined" ? true : navigator.onLine,
): Promise<SubmitOutcome> {
  const url = endpoint();
  if (!url) return { kind: "not-configured" };
  if (!online) return { kind: "offline" };

  const validation = validateEnquiry(payload);
  if (!validation.ok) return { kind: "invalid", errors: validation.errors };

  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Public-by-design value; the service-role key never reaches the browser.
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        organization: payload.organization,
        role: payload.role ?? "",
        country: payload.country,
        region: payload.region ?? "",
        sector: payload.sector,
        division: payload.division,
        subject: payload.subject,
        message: payload.message,
        consent: payload.consent,
        website: payload.website,
        elapsedMs: payload.elapsedMs,
      }),
    });
  } catch {
    return { kind: "network-error" };
  }

  if (response.ok) {
    try {
      const data = (await response.json()) as { referenceId?: string };
      if (data.referenceId) return { kind: "success", referenceId: data.referenceId };
    } catch {
      // fall through to server error
    }
    return { kind: "server-error" };
  }

  if (response.status === 429) return { kind: "rate-limited" };
  if (response.status === 403) return { kind: "origin-blocked" };

  if (response.status === 400) {
    try {
      const data = (await response.json()) as { errors?: Record<string, string> };
      if (data.errors) return { kind: "invalid", errors: data.errors };
    } catch {
      // fall through
    }
  }

  return { kind: "server-error" };
}
