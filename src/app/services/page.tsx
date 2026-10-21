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
  alternates: { canonical: "/services" },
};

const divisionIcons: Record<string, LucideIcon> = {
  "regional-representation-institutional-liaison": Landmark,
  "market-entry-business-development": Compass,
  "strategic-partnerships-investment-facilitation": Handshake,
  "project-trade-procurement-support": Container,
  "international-development-regional-programmes": Globe,
};

/**
 * Services overview: the five divisions, each linking to its detail page.
 * All detail content is generated from the typed configuration in
 * src/lib/divisions.ts and src/lib/division-details.ts.
 */
export default function ServicesPage() {
  return (
    <>
      <section className={cn(sectionSpacing, "bg-offwhite")}>
        <div className={container}>
          <SectionHeading
            level={1}
            eyebrow="Services"
            title="Five professional divisions."
            intro="Services are organized under five divisions so every engagement has a clear owner, scope, and standard of work. Each division page sets out its purpose, the challenges it addresses, and what an engagement covers."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {serviceDivisions.map((division) => {
              const Icon = divisionIcons[division.id];
              return (
                <article key={division.id} className={cn(card, "flex flex-col p-6 sm:p-7")}>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-semibold text-gold-ink">
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
                  <ul className="mt-5 grid gap-1.5">
                    {division.subservices.slice(0, 4).map((subservice) => (
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
                    {division.subservices.length > 4 && (
                      <li className="pl-[18px] text-[13px] italic text-ink/65">
                        + {division.subservices.length - 4} more subservices
                      </li>
                    )}
                  </ul>
                  <div className="mt-6 flex-1" />
                  <Link
                    href={`/services/${division.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-gold-ink"
                  >
                    View division
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link href="/contact" className={btn("primary")}>
              Request a Consultation
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
