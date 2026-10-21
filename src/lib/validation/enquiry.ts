/**
 * Enquiry validation — the single source of truth for enquiry rules.
 *
 * DELIBERATELY DEPENDENCY-FREE and free of app aliases (no "@/..." imports):
 * this module is executed in THREE places —
 *   1. the browser (usability validation),
 *   2. the Supabase Edge Function `create-enquiry` (security validation,
 *      imported relatively and bundled by the Supabase CLI), and
 *   3. unit tests.
 * The server NEVER trusts the client: it runs its own execution of these
 * rules plus origin, rate-limit, and size checks on top.
 *
 * The allowed sector/division values mirror src/lib/divisions.ts and
 * src/lib/sectors.ts; tests/enquiry.test.ts asserts they stay in sync.
 */

export const ENQUIRY_LIMITS = {
  name: 120,
  email: 200,
  organization: 200,
  role: 120,
  country: 100,
  region: 160,
  sector: 64,
  division: 64,
  subject: 160,
  message: 5000,
} as const;

export const ALLOWED_SECTOR_VALUES = [
  "agriculture",
  "mining",
  "energy",
  "healthcare-education-technology",
  "trade-logistics-manufacturing",
  "other",
  "not-sure-yet",
] as const;

export const ALLOWED_DIVISION_VALUES = [
  "regional-representation-institutional-liaison",
  "market-entry-business-development",
  "strategic-partnerships-investment-facilitation",
  "project-trade-procurement-support",
  "international-development-regional-programmes",
  "not-sure-yet",
] as const;

/** Minimum plausible human completion time for the form (milliseconds). */
export const MIN_COMPLETION_MS = 2000;

/** Keys a client may send. Anything else is rejected (mass-assignment guard). */
const ALLOWED_KEYS = [
  "name",
  "email",
  "organization",
  "role",
  "country",
  "region",
  "sector",
  "division",
  "subject",
  "message",
  "consent",
  "website", // honeypot
  "elapsedMs",
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface NormalizedEnquiry {
  name: string;
  email: string;
  organization: string;
  role: string | null;
  country: string;
  region: string | null;
  sector: string;
  division: string;
  subject: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; value: NormalizedEnquiry }
  | { ok: false; errors: Record<string, string> };

/** Collapse internal whitespace and trim. */
function clean(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function validateEnquiry(input: unknown): ValidationResult {
  const errors: Record<string, string> = {};

  if (typeof input !== "object" || input === null) {
    return { ok: false, errors: { form: "Malformed submission." } };
  }
  const raw = input as Record<string, unknown>;

  // Reject any unexpected top-level field (mass-assignment guard).
  for (const key of Object.keys(raw)) {
    if (!(ALLOWED_KEYS as readonly string[]).includes(key)) {
      return { ok: false, errors: { form: "Unexpected field in submission." } };
    }
  }

  const str = (key: keyof typeof ENQUIRY_LIMITS): string =>
    typeof raw[key] === "string" ? clean(raw[key]) : "";

  const name = str("name");
  const email = str("email").toLowerCase();
  const organization = str("organization");
  const roleRaw = str("role");
  const country = str("country");
  const regionRaw = str("region");
  const sector = str("sector");
  const division = str("division");
  const subject = str("subject");
  const message = raw.message;
  const messageText =
    typeof message === "string" ? message.replace(/\r\n/g, "\n").trim() : "";

  if (name.length < 1 || name.length > ENQUIRY_LIMITS.name) {
    errors.name = "Please enter your full name (up to 120 characters).";
  }
  if (!EMAIL_PATTERN.test(email) || email.length > ENQUIRY_LIMITS.email) {
    errors.email = "Please enter a valid work email address.";
  }
  if (
    organization.length < 1 ||
    organization.length > ENQUIRY_LIMITS.organization
  ) {
    errors.organization =
      "Please enter your organization (up to 200 characters).";
  }
  if (roleRaw.length > ENQUIRY_LIMITS.role) {
    errors.role = "Role/title is limited to 120 characters.";
  }
  if (country.length < 1 || country.length > ENQUIRY_LIMITS.country) {
    errors.country = "Please enter your country (up to 100 characters).";
  }
  if (regionRaw.length > ENQUIRY_LIMITS.region) {
    errors.region = "State/region is limited to 160 characters.";
  }
  if (!(ALLOWED_SECTOR_VALUES as readonly string[]).includes(sector)) {
    errors.sector = "Please select a valid sector.";
  }
  if (!(ALLOWED_DIVISION_VALUES as readonly string[]).includes(division)) {
    errors.division = "Please select a valid service division.";
  }
  if (subject.length < 1 || subject.length > ENQUIRY_LIMITS.subject) {
    errors.subject = "Please enter an enquiry subject (up to 160 characters).";
  }
  if (messageText.length < 1 || messageText.length > ENQUIRY_LIMITS.message) {
    errors.message = "Please describe your objective (up to 5000 characters).";
  }
  if (raw.consent !== true) {
    errors.consent = "Please confirm you consent to the Privacy Notice.";
  }

  // Honeypot: must be absent or empty. Generic message — never tip off bots.
  if (typeof raw.website === "string" && raw.website.trim() !== "") {
    return { ok: false, errors: { form: "Submission rejected." } };
  }

  // Minimum completion time (client-elapsed; the server adds rate limiting).
  const elapsed = typeof raw.elapsedMs === "number" ? raw.elapsedMs : 0;
  if (elapsed < MIN_COMPLETION_MS) {
    return { ok: false, errors: { form: "Submission rejected." } };
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      email,
      organization,
      role: roleRaw === "" ? null : roleRaw,
      country,
      region: regionRaw === "" ? null : regionRaw,
      sector,
      division,
      subject,
      message: messageText,
    },
  };
}
