/**
 * Site-wide configuration for Lamido, Lamido & Co.
 *
 * Brand strings in this file are guarded by tests (tests/brand.test.ts).
 * The official spelling is exactly "Lamido, Lamido & Co." — never "Lanmido".
 */
/**
 * Canonical public URL resolution (no trailing slash):
 *  1. NEXT_PUBLIC_SITE_URL — the owner's confirmed production domain (explicit).
 *  2. VERCEL_PROJECT_PRODUCTION_URL — auto-provided on Vercel production builds.
 *  3. VERCEL_URL — auto-provided on Vercel preview builds.
 *  4. http://localhost:3000 — local development only (never a shipped build:
 *     production builds run on Vercel, where 2 or 3 is always present).
 *
 * This prevents environment-specific localhost URLs from ever being baked
 * into a deployed build's canonical tags, sitemap, robots, or JSON-LD.
 */
/** Loose env shape so tests can inject partial environments. */
export type SiteEnv = Record<string, string | undefined>;

export function resolveSiteUrl(env: SiteEnv = process.env): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel =
    env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/+/, "").replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Lamido, Lamido & Co.",
  shortName: "Lamido & Co.",
  descriptor: "Global Resource Company",
  tagline:
    "Your Trusted Regional Representative and Strategic Partner in Northern Nigeria.",
  positioning:
    "We represent your interests and help you build your presence in Northern Nigeria.",
  description:
    "Lamido, Lamido & Co. is a global resource company representing foreign organizations, corporations, and public institutions in Northern Nigeria — regional representation, market entry, strategic partnerships, procurement support, and development programme coordination under written mandate.",
  /** Canonical public URL — see resolveSiteUrl(). TODO(owner): set NEXT_PUBLIC_SITE_URL to the confirmed production domain. */
  url: resolveSiteUrl(),
  /** TODO(owner): publish the official contact email once confirmed. Left blank — never fabricated. */
  contactEmail: "",
} as const;

export type NavLink = { href: string; label: string };

/** Primary navigation — concise by design (per the project brief). */
export const navLinks: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/sectors", label: "Sectors" },
  { href: "/how-we-work", label: "How We Work" },
  { href: "/contact", label: "Contact" },
];
