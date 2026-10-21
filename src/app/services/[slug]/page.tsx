import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, card, container, sectionSpacing } from "@/lib/styles";
import { serviceDivisions } from "@/lib/divisions";
import { divisionDetails } from "@/lib/division-details";
import { SectionHeading } from "@/components/section-heading";

interface DivisionPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return serviceDivisions.map((division) => ({ slug: division.id }));
}

export async function generateMetadata({
  params,
}: DivisionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const division = serviceDivisions.find((d) => d.id === slug);
  if (!division) return {};
  return {
    title: division.name,
    description: division.summary,
    alternates: { canonical: `/services/${division.id}` },
  };
}

export default async function DivisionPage({ params }: DivisionPageProps) {
  const { slug } = await params;
  const index = serviceDivisions.findIndex((d) => d.id === slug);
  if (index === -1) notFound();

  const division = serviceDivisions[index];
  const detail = divisionDetails[division.id];
  const previous = serviceDivisions[(index + serviceDivisions.length - 1) % serviceDivisions.length];
  const next = serviceDivisions[(index + 1) % serviceDivisions.length];

  return (
    <>
      {/* Division header */}
      <section className="border-b border-line bg-offwhite">
        <div className={cn(container, "py-12 sm:py-16 lg:py-20")}>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All services
          </Link>
          <p className="mt-8 font-display text-sm font-semibold uppercase tracking-[0.24em] text-gold">
            Division {division.number}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl lg:text-[44px] lg:leading-[1.15]">
            {division.name}
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink/75 sm:text-base">
            {division.summary}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/contact" className={btn("primary")}>
              Request a Consultation
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <span className="text-sm text-ink/55">
              Delivered under a written mandate.
            </span>
          </div>
        </div>
      </section>

      {/* Purpose + challenges */}
      <section className={sectionSpacing}>
        <div className={cn(container, "grid gap-12 lg:grid-cols-2 lg:gap-16")}>
          <div>
            <h2 className="font-display text-2xl font-semibold text-navy">
              Purpose
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink/80">
              {detail.purpose}
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-navy">
              Challenges we help address
            </h2>
            <ul className="mt-4 space-y-3">
              {detail.problems.map((problem) => (
                <li
                  key={problem}
                  className="flex gap-3 text-[14px] leading-relaxed text-ink/75"
                >
                  <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                  {problem}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Subservices */}
      <section className={cn(sectionSpacing, "bg-offwhite")}>
        <div className={container}>
          <SectionHeading
            eyebrow="Scope"
            title="Included subservices"
            intro="What this division covers. Related subservices are delivered within the division, under the same mandate."
          />
          <ul className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
            {division.subservices.map((subservice) => (
              <li
                key={subservice}
                className={cn(card, "flex items-start gap-3 p-4 text-[14px] font-medium leading-relaxed text-ink/85")}
              >
                <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gold" aria-hidden />
                {subservice}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Engagement flow */}
      <section className={sectionSpacing}>
        <div className={container}>
          <SectionHeading
            eyebrow="Method"
            title="Typical engagement flow"
            intro="How a mandate in this division usually runs, from first conversation to reporting."
            align="left"
          />
          <ol className="mt-10">
            {detail.engagementFlow.map((step, stepIndex) => (
              <li key={step.title} className="relative flex gap-5 pb-8 last:pb-0 sm:gap-7">
                {stepIndex < detail.engagementFlow.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-[17px] top-9 h-[calc(100%-28px)] w-px bg-line sm:left-[19px]"
                  />
                )}
                <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-white font-display text-sm font-semibold text-navy">
                  {stepIndex + 1}
                </span>
                <div className="pt-1">
                  <h3 className="font-display text-[16px] font-semibold text-navy">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-ink/70">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Clients + deliverables */}
      <section className={cn(sectionSpacing, "bg-offwhite")}>
        <div className={cn(container, "grid gap-12 lg:grid-cols-2 lg:gap-16")}>
          <div>
            <h2 className="font-display text-2xl font-semibold text-navy">
              Who this division serves
            </h2>
            <ul className="mt-5 space-y-3">
              {detail.clientTypes.map((clientType) => (
                <li
                  key={clientType}
                  className="rounded-lg border border-line bg-white px-4 py-3 text-[14px] leading-relaxed text-ink/80"
                >
                  {clientType}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-ink/50">
              Presented as typical client profiles — not as claimed existing
              clients or completed engagements.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-navy">
              What you can expect
            </h2>
            <ul className="mt-5 space-y-3">
              {detail.deliverables.map((deliverable) => (
                <li
                  key={deliverable}
                  className="flex gap-3 rounded-lg border border-line bg-white px-4 py-3 text-[14px] leading-relaxed text-ink/80"
                >
                  <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gold" aria-hidden />
                  {deliverable}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Boundaries */}
      <section className={sectionSpacing}>
        <div className={cn(container, "max-w-3xl")}>
          <div className="rounded-lg border border-gold/30 bg-gold/[0.06] p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-navy">
              Boundaries of this division
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/75">
              {detail.boundaries}
            </p>
          </div>
        </div>
      </section>

      {/* Prev / next */}
      <nav aria-label="Divisions" className="border-t border-line bg-offwhite">
        <div className={cn(container, "flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between")}>
          <Link
            href={`/services/${previous.id}`}
            className="group inline-flex items-center gap-2 text-sm text-ink/60 transition-colors hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span>
              <span className="block text-xs uppercase tracking-wider text-ink/40">Previous</span>
              <span className="font-medium">{previous.shortName}</span>
            </span>
          </Link>
          <Link
            href={`/services/${next.id}`}
            className="group inline-flex items-center gap-2 text-right text-sm text-ink/60 transition-colors hover:text-navy sm:flex-row-reverse"
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
            <span>
              <span className="block text-xs uppercase tracking-wider text-ink/40">Next</span>
              <span className="font-medium">{next.shortName}</span>
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
}
