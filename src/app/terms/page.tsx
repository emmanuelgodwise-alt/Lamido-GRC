import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { container, sectionSpacing } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms that apply to your use of the Lamido, Lamido & Co. website, including the limits of the information published on it.",
  alternates: { canonical: "/terms" },
};

/**
 * Working draft terms of use. Bracketed [Owner/legal review] notes mark
 * wording that the company and its legal counsel must review and confirm
 * before these terms are treated as final.
 */

const sections: readonly { title: string; body: readonly React.ReactNode[] }[] = [
  {
    title: "1. Acceptance of these terms",
    body: [
      <>
        By accessing this website you agree to these Terms of Use. If you do
        not agree, please do not use the website. [Owner/legal review:
        confirm the governing law and jurisdiction once decided — see
        section 8.]
      </>,
    ],
  },
  {
    title: "2. Information, not advice",
    body: [
      <>
        The content of this website is general information about Lamido,
        Lamido &amp; Co. and the services its divisions can provide. It is
        not legal, financial, investment, tax, or other professional advice,
        and it must not be relied on as a substitute for qualified advice on
        any specific matter.
      </>,
    ],
  },
  {
    title: "3. No guaranteed outcomes",
    body: [
      <>
        Nothing on this website promises or implies any guaranteed contract,
        tender award, government approval, investment return, or business
        outcome. All services are delivered under written mandates, and all
        commercial decisions and their risks remain with the client.
      </>,
    ],
  },
  {
    title: "4. No implied status or affiliation",
    body: [
      <>
        Lamido, Lamido &amp; Co. is an independent private company. It does
        not hold diplomatic status, and nothing on this website implies
        government endorsement, official authority, or any existing client,
        partner, or institutional relationship unless the company has
        published verified evidence for it.
      </>,
    ],
  },
  {
    title: "5. Intellectual property",
    body: [
      <>
        The name “Lamido, Lamido &amp; Co.”, the company emblem, and the
        design and text of this website are protected. You may view and
        print pages for your own reference. Any other reproduction or use
        requires the company&apos;s prior written permission.
      </>,
    ],
  },
  {
    title: "6. Third-party links",
    body: [
      <>
        This website may link to third-party websites for reference. Those
        websites are not operated by us, and we are not responsible for their
        content or their handling of your information.
      </>,
    ],
  },
  {
    title: "7. Limitation of liability",
    body: [
      <>
        To the fullest extent permitted by applicable law, Lamido, Lamido
        &amp; Co. accepts no liability for loss arising from use of, or
        reliance on, this website or its content. [Owner/legal review:
        confirm the liability wording with counsel.]
      </>,
    ],
  },
  {
    title: "8. Governing law",
    body: [
      <>
        These terms are governed by the laws of
        [Owner/legal review: insert governing law and jurisdiction once
        decided]. Disputes are subject to the exclusive jurisdiction of the
        courts of that jurisdiction.
      </>,
    ],
  },
  {
    title: "9. Changes",
    body: [
      <>
        The company may update these terms from time to time. The current
        version is always the one published on this page.
      </>,
    ],
  },
  {
    title: "10. Contact",
    body: [
      <>
        Questions about these terms can be sent to [Owner: official contact
        email to be inserted once confirmed].
      </>,
    ],
  },
];

export default function TermsPage() {
  return (
    <section className={cn(sectionSpacing, "bg-offwhite")}>
      <div className={cn(container, "max-w-3xl")}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
          Legal
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
          Terms of Use
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink/75">
          These terms apply to your use of this website. They are written in
          plain language on purpose.
        </p>
        <p className="mt-4 rounded-lg border border-gold/40 bg-gold/[0.07] p-4 text-[13px] leading-relaxed text-ink/80">
          [Owner/legal review: these terms are a working draft prepared for
          review by the company and its legal counsel before publication.
          Bracketed notes throughout mark decisions the company must confirm.
          They have not been reviewed by a lawyer.]
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-xl font-semibold text-navy">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-[14px] leading-relaxed text-ink/75"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
