import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, FileCheck2, Globe2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, card, container, sectionSpacing } from "@/lib/styles";
import { site } from "@/lib/site";
import { serviceDivisions } from "@/lib/divisions";
import { principles, regulatedServicesNote } from "@/lib/engagement";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "About",
  description:
    "Lamido, Lamido & Co. is a global resource company representing foreign organizations, corporations, and public institutions in Northern Nigeria — a contracted regional representative and practical coordination partner operating under written mandate.",
  alternates: { canonical: "/about" },
};

const definingTraits = [
  {
    icon: FileCheck2,
    title: "Mandate-based",
    text: "Every engagement is defined by a written mandate that sets out scope, authority, and accountability before work begins.",
  },
  {
    icon: Globe2,
    title: "Regionally rooted, internationally minded",
    text: "We work from within Northern Nigeria, for organizations that operate to international standards of documentation and accountability.",
  },
  {
    icon: ShieldCheck,
    title: "Discreet by default",
    text: "Representation often involves commercially sensitive objectives. Confidentiality and careful information handling are built into how we work.",
  },
  {
    icon: Compass,
    title: "Practical, not advisory-only",
    text: "We are a coordination partner that opens doors, manages follow-through, and reports honestly — not merely a report writer.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Positioning */}
      <section className={cn(sectionSpacing, "bg-offwhite")}>
        <div className={container}>
          <SectionHeading
            eyebrow="About"
            title="A regional representative built on mandate and accountability."
            intro="Lamido, Lamido & Co. is a global resource company specializing in representing foreign organizations, corporations, companies, and governments in Northern Nigeria."
          />

          <div className="mx-auto mt-10 max-w-3xl space-y-5 text-[15px] leading-relaxed text-ink/80">
            <p>
              Organizations with serious interests in Northern Nigeria face a
              familiar problem: the region rewards presence, preparation, and
              relationships — and punishes distance. {site.name} exists to
              close that gap. We serve as a contracted regional
              representative and practical coordination partner for foreign
              organizations, corporations, companies, and public
              institutions, helping them build credible presence and
              well-coordinated engagement in the region.
            </p>
            <p>
              We are deliberately positioned as a representative and
              coordination partner — not merely a consultant and not an
              informal middleman. All services are delivered according to each
              client&apos;s written mandate and the applicable rules of the
              institutions and processes involved. {site.positioning}
            </p>
            <p className="rounded-lg border border-line bg-white p-4 text-sm text-ink/70">
              {site.name} is an independent, private company. It does not
              hold diplomatic status, and nothing on this website should be
              read as a claim of government endorsement, official authority,
              or any existing client relationship unless the company has
              supplied verified evidence for it.
            </p>
          </div>
        </div>
      </section>

      {/* What defines us */}
      <section className={sectionSpacing}>
        <div className={container}>
          <SectionHeading
            eyebrow="How we are built"
            title="What defines the firm."
            intro="Four commitments shape every engagement, regardless of division or sector."
            align="left"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {definingTraits.map((trait) => (
              <article key={trait.title} className={cn(card, "p-6")}>
                <trait.icon className="h-6 w-6 text-gold" aria-hidden />
                <h3 className="mt-4 font-display text-lg font-semibold text-navy">
                  {trait.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">
                  {trait.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Five divisions */}
      <section className={cn(sectionSpacing, "bg-navy")}>
        <div className={container}>
          <SectionHeading
            eyebrow="Services"
            title="Representation, organized into five divisions."
            intro="Every engagement sits inside one of five professional divisions, each with a clear owner, scope, and standard of work."
            tone="dark"
          />
          <ul className="mt-12 space-y-3">
            {serviceDivisions.map((division) => (
              <li key={division.id}>
                <Link
                  href={`/services/${division.id}`}
                  className="group flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:border-gold/40 hover:bg-white/[0.07] sm:gap-6"
                >
                  <span className="font-display text-sm font-semibold text-gold">
                    {division.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[15px] font-semibold leading-snug text-white sm:text-base">
                      {division.name}
                    </span>
                    <span className="mt-1 hidden max-w-2xl text-[13px] leading-relaxed text-white/60 sm:block">
                      {division.summary}
                    </span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-white/40 transition-colors group-hover:text-gold"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Responsible representation */}
      <section className={sectionSpacing}>
        <div className={container}>
          <SectionHeading
            eyebrow="Governance"
            title="Responsible representation."
            intro="Representation is a position of trust. These are the standards every engagement is held to."
            align="left"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle) => (
              <article key={principle.title} className={cn(card, "p-5")}>
                <h3 className="font-display text-[15px] font-semibold text-navy">
                  {principle.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink/70">
                  {principle.description}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-3xl rounded-lg border border-gold/30 bg-gold/[0.07] p-4 text-sm leading-relaxed text-ink/80">
            {regulatedServicesNote}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className={cn(sectionSpacing, "bg-offwhite")}>
        <div className={cn(container, "text-center")}>
          <SectionHeading
            eyebrow="Next step"
            title="Start with a conversation."
            intro="Tell us what you want to achieve in Northern Nigeria. Every engagement begins with a clear, written mandate."
          />
          <div className="mt-8">
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
