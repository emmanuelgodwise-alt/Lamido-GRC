import type { Metadata } from "next";
import { CalendarCheck, ClipboardList, FileSignature } from "lucide-react";
import { cn } from "@/lib/utils";
import { card, container, sectionSpacing } from "@/lib/styles";
import { SectionHeading } from "@/components/section-heading";
import { EnquiryForm } from "@/components/contact/enquiry-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a consultation with Lamido, Lamido & Co. Tell us what you want to achieve in Northern Nigeria and we will respond to confirm scope and next steps.",
  alternates: { canonical: "/contact" },
};

const steps = [
  {
    icon: ClipboardList,
    title: "Share your objective",
    text: "Send your enquiry through the form below — your organization, your objective in Northern Nigeria, and the support you think you need.",
  },
  {
    icon: CalendarCheck,
    title: "We confirm scope",
    text: "We review every enquiry, respond to confirm what is being asked, and set out honestly whether and how we can help.",
  },
  {
    icon: FileSignature,
    title: "Consultation, then mandate",
    text: "If there is a fit, we hold a consultation and — where both sides agree — document the engagement in a written mandate.",
  },
];

const prepare = [
  "A short overview of your organization and where you operate from",
  "Your objective in Northern Nigeria, in however many sentences it takes",
  "The sector and service division you believe fits — or “not sure yet”",
  "Any timeline, constraints, or sensitivities we should know about",
];

export default function ContactPage() {
  return (
    <>
      {/* How to engage */}
      <section className={cn(sectionSpacing, "bg-offwhite")}>
        <div className={container}>
          <SectionHeading
            level={1}
            eyebrow="Contact"
            title="Start with a conversation."
            intro="Every engagement with Lamido, Lamido & Co. begins the same way: a clear, no-obligation exchange about your objectives in Northern Nigeria."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className={cn(card, "p-6")}>
                <div className="flex items-center justify-between">
                  <step.icon className="h-6 w-6 text-gold" aria-hidden />
                  <span aria-hidden className="font-display text-sm font-semibold text-ink/65">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold text-navy">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">
                  {step.text}
                </p>
              </article>
            ))}
          </div>

          <div className={cn(card, "mx-auto mt-10 max-w-3xl p-6 sm:p-7")}>
            <h2 className="font-display text-lg font-semibold text-navy">
              What to prepare
            </h2>
            <ul className="mt-4 grid gap-2.5">
              {prepare.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[14px] leading-relaxed text-ink/75"
                >
                  <span
                    aria-hidden
                    className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-ink/65">
              Official contact details — email, telephone, and address — will
              be published on this page once confirmed by the company.
            </p>
          </div>
        </div>
      </section>

      {/* Enquiry form */}
      <section className={sectionSpacing}>
        <div className={cn(container, "max-w-3xl")}>
          <EnquiryForm />
        </div>
      </section>
    </>
  );
}
