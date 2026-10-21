import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Container,
  FileCheck2,
  Globe,
  Handshake,
  HeartPulse,
  Landmark,
  MapPin,
  Mountain,
  ShieldCheck,
  Ship,
  Wheat,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, card, container, sectionSpacing } from "@/lib/styles";
import { site } from "@/lib/site";
import { serviceDivisions } from "@/lib/divisions";
import { sectors } from "@/lib/sectors";
import { engagementSteps, principles, regulatedServicesNote } from "@/lib/engagement";
import { SectionHeading } from "@/components/section-heading";

const divisionIcons: Record<string, LucideIcon> = {
  "regional-representation-institutional-liaison": Landmark,
  "market-entry-business-development": Compass,
  "strategic-partnerships-investment-facilitation": Handshake,
  "project-trade-procurement-support": Container,
  "international-development-regional-programmes": Globe,
};

const sectorIcons: Record<string, LucideIcon> = {
  agriculture: Wheat,
  mining: Mountain,
  energy: Zap,
  "healthcare-education-technology": HeartPulse,
  "trade-logistics-manufacturing": Ship,
};

const heroBadges = [
  "Written mandates",
  "Confidential by default",
  "Northern Nigeria focus",
];

const firmHighlights = [
  {
    icon: FileCheck2,
    title: "Written mandates",
    text: "Scope and authority are defined in writing before any engagement begins.",
  },
  {
    icon: ShieldCheck,
    title: "Confidential by default",
    text: "Discretion in every enquiry, introduction, and piece of correspondence.",
  },
  {
    icon: MapPin,
    title: "Northern Nigeria focus",
    text: "Regional knowledge, institutional relationships, and on-the-ground coordination.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-offwhite">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full border border-gold/25"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 top-24 h-40 w-40 rounded-full border border-gold/20"
        />
        <div className={cn(container, "relative py-16 sm:py-20 lg:py-28")}>
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <h1 className="font-display text-[30px] font-semibold leading-[1.18] text-navy sm:text-4xl sm:leading-[1.15] lg:text-[50px] lg:leading-[1.12]">
                Your Trusted Regional Representative and Strategic Partner in
                Northern Nigeria.
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink/75 sm:text-base">
                {site.name} represents foreign organizations, corporations, and
                public institutions in Northern Nigeria — building credible
                presence, opening the right doors, and coordinating engagement
                under clear written mandates.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/contact" className={btn("primary")}>
                  Request a Consultation
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link href="/services" className={btn("outline")}>
                  Explore Our Services
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-2.5">
                {heroBadges.map((badge) => (
                  <li
                    key={badge}
                    className="rounded-full border border-navy/15 bg-white px-3.5 py-1.5 text-xs font-medium text-navy/80"
                  >
                    {badge}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[430px]">
              <div className="relative flex aspect-square items-center justify-center rounded-full bg-white shadow-[0_28px_70px_-28px_rgba(11,46,89,0.35)] ring-1 ring-navy/5">
                <img
                  src="/brand/emblem-home.png"
                  alt={`${site.name} emblem — LL monogram and globe`}
                  width={620}
                  height={403}
                  className="w-[72%]"
                />
                <div
                  aria-hidden
                  className="absolute -bottom-3 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/50 to-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The firm                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className={cn(sectionSpacing, "bg-white")}>
        <div className={container}>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <SectionHeading
              align="left"
              eyebrow="The Firm"
              title="A contracted regional representative — not a middleman."
            />
            <div>
              <p className="text-[15px] leading-relaxed text-ink/75">
                {site.name} is a global resource company specializing in
                representing foreign organizations, corporations, companies,
                and governments in Northern Nigeria. We operate as a contracted
                regional representative and practical coordination partner —
                helping clients enter the region, engage the right
                institutions, and sustain a credible presence over time.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink/75">
                Services are delivered according to each client&apos;s written
                mandate and applicable rules. We do not claim diplomatic
                status, government endorsement, or official authority — our
                value is professional, accountable representation.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {firmHighlights.map((item) => (
                  <div key={item.title} className={cn(card, "p-5")}>
                    <item.icon
                      className="h-5 w-5 text-gold"
                      aria-hidden
                    />
                    <h3 className="mt-3 text-sm font-semibold text-navy">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink/65">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Five service divisions                                            */}
      {/* ---------------------------------------------------------------- */}
      <section id="divisions" className={cn(sectionSpacing, "bg-offwhite")}>
        <div className={container}>
          <SectionHeading
            eyebrow="Services"
            title="Five divisions. One accountable partner."
            intro="Every engagement runs through one of five professional divisions, each defined by a clear mandate and coordinated end-to-end."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {serviceDivisions.map((division) => {
              const Icon = divisionIcons[division.id];
              return (
                <Link
                  key={division.id}
                  href={`/services/${division.id}`}
                  className={cn(
                    card,
                    "group flex flex-col p-6 transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-[0_18px_44px_-18px_rgba(11,46,89,0.28)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-semibold text-gold-ink">
                      {division.number}
                    </span>
                    {Icon && (
                      <Icon
                        className="h-5 w-5 text-navy/35 transition-colors group-hover:text-gold"
                        aria-hidden
                      />
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-navy">
                    {division.name}
                  </h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink/70">
                    {division.summary}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy transition-all group-hover:gap-2.5 motion-reduce:transition-none">
                    Division overview
                    <ArrowRight className="h-4 w-4 text-gold" aria-hidden />
                  </span>
                </Link>
              );
            })}

            {/* CTA card completing the grid */}
            <div className="flex flex-col justify-between rounded-lg border border-navy bg-navy p-6 text-white">
              <div>
                <h3 className="font-display text-lg font-semibold leading-snug">
                  Not sure where to start?
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/70">
                  Tell us your objective — we will match it to the right
                  division and a realistic engagement path.
                </p>
              </div>
              <Link
                href="/contact"
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gold-soft transition-colors hover:text-gold"
              >
                Request a Consultation
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-ink/65">
            Detailed division pages are being prepared for the next build stage.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Sectors                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className={cn(sectionSpacing, "bg-white")}>
        <div className={container}>
          <SectionHeading
            eyebrow="Sectors"
            title="Sectors we can support."
            intro="Presented as areas of service support — not claims of completed projects or existing relationships."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sectors.map((sector) => {
              const Icon = sectorIcons[sector.id];
              return (
                <div key={sector.id} className={cn(card, "p-6")}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gold/10">
                    {Icon && <Icon className="h-5 w-5 text-gold" aria-hidden />}
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold leading-snug text-navy">
                    {sector.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">
                    {sector.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How we work                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className={cn(sectionSpacing, "bg-navy text-white")}>
        <div className={container}>
          <SectionHeading
            tone="dark"
            eyebrow="How We Work"
            title="A disciplined engagement cycle."
            intro="From first conversation to ongoing representation, every mandate follows the same five-step rhythm."
          />
          <ol className="mt-12 grid gap-9 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {engagementSteps.map((step, index) => (
              <li key={step.title}>
                <div className="flex items-center gap-3">
                  <span aria-hidden className="font-display text-2xl font-semibold text-gold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden
                    className="hidden h-px flex-1 bg-white/15 lg:block"
                  />
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-11 text-center">
            <Link href="/how-we-work" className={btn("ghost-light")}>
              See the full engagement approach
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Responsible representation principles                              */}
      {/* ---------------------------------------------------------------- */}
      <section className={cn(sectionSpacing, "bg-offwhite")}>
        <div className={container}>
          <SectionHeading
            eyebrow="Responsible Representation"
            title="How we hold ourselves accountable."
            intro="Credibility is the product. These principles govern every engagement, in writing."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle) => (
              <div key={principle.title} className={cn(card, "p-6")}>
                <h3 className="text-sm font-semibold text-navy">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-[13px] leading-relaxed text-ink/65">
            {regulatedServicesNote}
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Closing CTA                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white">
        <div className={cn(container, "pb-16 sm:pb-20 lg:pb-24")}>
          <div className="relative overflow-hidden rounded-2xl bg-navy px-6 py-12 text-center sm:px-12 lg:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 h-20 w-20 border-l-2 border-t-2 border-gold/60"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 h-20 w-20 border-b-2 border-r-2 border-gold/60"
            />
            <h2 className="mx-auto max-w-2xl font-display text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl">
              Discuss your objectives in Northern Nigeria.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
              Tell us what you want to achieve in the region. We will respond
              with a clear, honest view of how we can represent and support you
              — under written mandate.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/contact" className={btn("gold")}>
                Request a Consultation
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/services" className={btn("ghost-light")}>
                Explore Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
