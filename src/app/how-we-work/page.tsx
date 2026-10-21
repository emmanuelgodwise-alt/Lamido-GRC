import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, card, container, sectionSpacing } from "@/lib/styles";
import {
  engagementSteps,
  workingPractices,
  regulatedServicesNote,
} from "@/lib/engagement";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "How We Work",
  description:
    "The Lamido, Lamido & Co. engagement cycle — Discover, Assess, Connect, Coordinate, Report — and the working standards behind it: documentation, partner verification, transparent engagement, confidentiality, and follow-through.",
  alternates: { canonical: "/how-we-work" },
};

export default function HowWeWorkPage() {
  return (
    <>
      {/* Cycle */}
      <section className={cn(sectionSpacing, "bg-navy")}>
        <div className={container}>
          <SectionHeading
            eyebrow="How we work"
            title="A clear cycle, run under a written mandate."
            intro="Every engagement — whichever division it sits in — follows the same disciplined cycle, so you always know where things stand and what happens next."
            tone="dark"
          />

          <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {engagementSteps.map((step, index) => (
              <li
                key={step.title}
                className="relative rounded-lg border border-white/10 bg-white/[0.04] p-5"
              >
                <span className="font-display text-3xl font-semibold text-gold/35">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/65">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Working standards */}
      <section className={sectionSpacing}>
        <div className={container}>
          <SectionHeading
            eyebrow="Standards"
            title="How engagements are run."
            intro="The cycle is only half the story. Five working standards hold every mandate together."
            align="left"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {workingPractices.map((practice, index) => (
              <article key={practice.title} className={cn(card, "p-6")}>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/[0.06] font-display text-sm font-semibold text-navy">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-[16px] font-semibold text-navy">
                    {practice.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">
                  {practice.description}
                </p>
              </article>
            ))}
            <article
              className={cn(
                card,
                "flex flex-col justify-center border-gold/40 bg-gold/[0.06] p-6"
              )}
            >
              <FileCheck2 className="h-6 w-6 text-gold" aria-hidden />
              <h3 className="mt-3 font-display text-[16px] font-semibold text-navy">
                Regulated services
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                {regulatedServicesNote}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={cn(sectionSpacing, "bg-offwhite")}>
        <div className={cn(container, "text-center")}>
          <SectionHeading
            eyebrow="Next step"
            title="Put the cycle to work."
            intro="Bring us your objective in Northern Nigeria. We will assess it honestly and tell you whether — and how — we can help."
          />
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/contact" className={btn("primary")}>
              Request a Consultation
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/services" className={btn("outline")}>
              Explore the five divisions
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
