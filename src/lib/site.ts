/**
 * Site-wide configuration for Lamido, Lamido & Co.
 *
 * Brand strings in this file are guarded by tests (tests/brand.test.ts).
 * The official spelling is exactly "Lamido, Lamido & Co." — never "Lanmido".
 */
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
  /** Canonical public URL (no trailing slash). TODO(owner): set to the production domain when confirmed. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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
