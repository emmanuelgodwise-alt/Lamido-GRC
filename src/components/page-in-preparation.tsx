import Link from "next/link";
import { ArrowRight, CheckCircle2, Construction } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, container, sectionSpacing } from "@/lib/styles";
import { eyebrow } from "@/lib/styles";

/**
 * Shared, tasteful "content in preparation" layout for routes whose full
 * content belongs to a later build stage. Keeps every CTA and navigation
 * link functional — no dead ends.
 */
export function PageInPreparation({
  eyebrow: eyebrowText,
  title,
  lead,
  planned,
  note,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  planned: readonly string[];
  note?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={cn(sectionSpacing, "bg-offwhite")}>
      <div className={container}>
        <div className="mx-auto max-w-3xl">
          <p className={eyebrow}>{eyebrowText}</p>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
            {title}
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-ink/70">{lead}</p>

          {children}

          <div className="mt-10 rounded-xl border border-line bg-white p-6 sm:p-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">
              Planned for this page
            </h2>
            <ul className="mt-4 space-y-2.5">
              {planned.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-ink/80"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 flex items-start gap-2.5 rounded-lg border border-gold/30 bg-gold/5 p-4 text-sm leading-relaxed text-ink/80">
            <Construction className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
            {note ??
              "This page's full content is scheduled for the next build stage of the development plan."}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className={btn("primary")}>
              Request a Consultation
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/" className={btn("outline")}>
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
