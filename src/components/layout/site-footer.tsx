import Link from "next/link";
import { site } from "@/lib/site";
import { serviceDivisions } from "@/lib/divisions";
import { cn } from "@/lib/utils";
import { btn, container } from "@/lib/styles";
import { InstallButton } from "@/components/pwa/install-button";

const companyLinks = [
  { href: "/about", label: "About the Company" },
  { href: "/services", label: "Services" },
  { href: "/sectors", label: "Sectors We Support" },
  { href: "/how-we-work", label: "How We Work" },
  { href: "/contact", label: "Contact" },
];

/**
 * Complete site footer. The full official logo sits on an off-white plate so
 * the original navy-and-gold artwork is preserved intact on the navy surface.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-navy-deep text-white">
      <div className={cn(container, "py-14 lg:py-16")}>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.35fr_0.85fr_1fr_1.15fr]">
          {/* Brand */}
          <div>
            <div className="inline-flex rounded-lg bg-offwhite p-4">
              <img
                src="/brand/logo-full-transparent.png"
                alt={`${site.name} logo`}
                width={160}
                height={119}
                className="w-36 sm:w-40"
              />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
              {site.positioning}
            </p>
          </div>

          {/* Company */}
          <nav aria-label="Company">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Company
            </h2>
            <ul className="mt-4 space-y-1">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-9 items-center text-sm text-white/75 transition-colors hover:text-gold-soft"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Service divisions */}
          <nav aria-label="Service divisions">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Services
            </h2>
            <ul className="mt-4 space-y-1">
              {serviceDivisions.map((division) => (
                <li key={division.id}>
                  <Link
                    href={`/services#${division.id}`}
                    className="inline-flex min-h-9 items-start gap-2 text-sm text-white/75 transition-colors hover:text-gold-soft"
                  >
                    <span className="mt-0.5 font-display text-[11px] font-semibold text-gold">
                      {division.number}
                    </span>
                    <span>{division.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Get started */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Get Started
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Tell us what you want to achieve in Northern Nigeria. Every
              engagement begins with a clear, written mandate.
            </p>
            <div className="mt-5 flex flex-col items-start gap-3">
              <Link href="/contact" className={btn("gold", "px-5 py-2.5")}>
                Request a Consultation
              </Link>
              <InstallButton variant="footer" />
            </div>
            <p className="mt-5 text-xs leading-relaxed text-white/45">
              Official contact details will be published on the Contact page
              once confirmed by the company.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div
          className={cn(
            container,
            "flex flex-col gap-2.5 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between"
          )}
        >
          <p>
            &copy; {year} {site.name} &mdash; {site.descriptor}. All rights
            reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/privacy"
              className="transition-colors hover:text-gold-soft"
            >
              Privacy Notice
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-gold-soft"
            >
              Terms of Use
            </Link>
            <span aria-hidden className="text-white/25">
              |
            </span>
            <span>Progressive Web App</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
