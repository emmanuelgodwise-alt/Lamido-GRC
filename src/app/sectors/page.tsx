import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, card, container, sectionSpacing } from "@/lib/styles";
import { sectors } from "@/lib/sectors";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Sectors We Support",
  description:
    "Areas of service support across Northern Nigeria: agriculture and agro-processing; mining, solid minerals and industry; energy, renewables and infrastructure; healthcare, education and technology; and trade, logistics and manufacturing.",
  alternates: { canonical: "/sectors" },
};

export default function SectorsPage() {
  return (
    <>
      <section className={cn(sectionSpacing, "bg-offwhite")}>
        <div className={container}>
          <SectionHeading
            level={1}
            eyebrow="Sectors"
            title="Sectors we support."
            intro="The sectors below are areas of interest and service support — where our representation, research, partnership, and coordination capabilities can be applied. They are presented as support we can provide, not as claims of proven expertise, completed projects, or existing relationships."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {sectors.map((sector) => (
              <article key={sector.id} className={cn(card, "flex flex-col p-6 sm:p-7")}>
                <h2 className="font-display text-lg font-semibold leading-snug text-navy sm:text-xl">
                  {sector.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">
                  {sector.summary}
                </p>
                <h3 className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/65">
                  Examples of support
                </h3>
                <ul className="mt-3 grid flex-1 gap-2">
                  {sector.support.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2.5 text-[13px] leading-relaxed text-ink/75"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-gold-ink"
                >
                  Discuss this sector
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/services" className={btn("outline")}>
              Explore our five service divisions
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
