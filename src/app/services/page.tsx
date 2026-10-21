import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Container, Globe, Handshake, Landmark, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, card, container, sectionSpacing } from "@/lib/styles";
import { serviceDivisions } from "@/lib/divisions";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Five professional divisions: regional representation, market entry, strategic partnerships, project and procurement support, and international development programmes.",
};

const divisionIcons: Record<string, LucideIcon> = {
  "regional-representation-institutional-liaison": Landmark,
  "market-entry-business-development": Compass,
  "strategic-partnerships-investment-facilitation": Handshake,
  "project-trade-procurement-support": Container,
  "international-development-regional-programmes": Globe,
};

/**
 * Services overview: the five divisions with their included subservices.
 * Full detail pages (engagement flows, deliverables, client types) are a
 * Stage 2 deliverable per the development plan.
 */
export default function ServicesPage() {
  return (
    <section className={cn(sectionSpacing, "bg-offwhite")}>
      <div className={container}>
        <SectionHeading
          eyebrow="Services"
          title="Five professional divisions."
          intro="Services are organized under five divisions so every engagement has a clear owner, scope, and standard of work. Division detail pages are being prepared."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {serviceDivisions.map((division) => {
            const Icon = divisionIcons[division.id];
            return (
              <article
                key={division.id}
                id={division.id}
                className={cn(card, "scroll-mt-28 p-6 sm:p-7")}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold text-gold">
                    Division {division.number}
                  </span>
                  {Icon && (
                    <Icon className="h-5 w-5 text-navy/35" aria-hidden />
                  )}
                </div>
                <h2 className="mt-3 font-display text-xl font-semibold leading-snug text-navy">
                  {division.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">
                  {division.summary}
                </p>
                <h3 className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/45">
                  Included subservices
                </h3>
                <ul className="mt-3 grid gap-1.5">
                  {division.subservices.map((subservice) => (
                    <li
                      key={subservice}
                      className="flex gap-2.5 text-[13px] leading-relaxed text-ink/75"
                    >
                      <span
                        aria-hidden
                        className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold"
                      />
                      {subservice}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-ink/50">
          Full division detail pages — engagement flows, deliverables, and
          typical client types — arrive in the next build stage.
        </p>

        <div className="mt-8 text-center">
          <Link href="/contact" className={btn("primary")}>
            Request a Consultation
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
