import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { container, sectionSpacing } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "How Lamido, Lamido & Co. collects, uses, stores, and protects the information you submit through this website and its enquiry form.",
  alternates: { canonical: "/privacy" },
};

/**
 * Working draft privacy notice. Bracketed [Owner/legal review] notes mark
 * wording that the company and its legal counsel must review and confirm
 * before this notice is treated as final.
 */

const sections: readonly { title: string; body: readonly React.ReactNode[] }[] = [
  {
    title: "1. Who we are",
    body: [
      <>
        Lamido, Lamido & Co. (“we”, “us”, “our”) is a global resource company
        providing regional representation, business development, and
        institutional liaison services in Northern Nigeria. This notice
        explains what personal information this website collects, why, and how
        it is handled. [Owner/legal review: insert company registration
        details and registered address once confirmed for publication.]
      </>,
    ],
  },
  {
    title: "2. What we collect",
    body: [
      <>
        We collect only the information you choose to submit through the
        enquiry form on this website: your name, work email address,
        organization, role or title (optional), country, the Northern
        Nigerian state(s) or region relevant to your enquiry (optional), your
        sector and service division of interest, your enquiry subject and
        message, and the time you gave consent.
      </>,
      <>
        We do not knowingly collect sensitive personal data, identity
        documents, payment information, or credentials through this website.
        The website does not use advertising trackers or third-party
        analytics by default.
      </>,
    ],
  },
  {
    title: "3. Why we collect it",
    body: [
      <>
        Your information is used only to: (a) respond to your enquiry and
        confirm scope; (b) hold a consultation you request; and (c) document
        any resulting engagement in a written mandate. We do not sell, rent,
        or trade personal information, and we do not add you to marketing
        lists through this website.
      </>,
    ],
  },
  {
    title: "4. Who can access it",
    body: [
      <>
        Enquiry information is stored in a secured database and is accessible
        only to authorized administrators of Lamido, Lamido & Co. Where an
        engagement requires it, relevant information may be shared with
        professional partners engaged under confidentiality, or as required by
        applicable law. [Owner/legal review: confirm the disclosure wording
        with counsel.]
      </>,
    ],
  },
  {
    title: "5. How it is protected",
    body: [
      <>
        Access to enquiry records is restricted by authentication and
        database-level security policies, and all traffic to and from this
        website is encrypted in transit. Submissions pass through a secured
        server-side function that validates every field before storage. No
        system can be guaranteed to be perfectly secure, and we cannot
        guarantee absolute security.
      </>,
      <>
        To protect the enquiry system from spam and abuse, a one-way hashed
        (irreversible) version of your IP address is stored for a maximum of
        7 days, solely for rate limiting. It cannot be used to identify you.
      </>,
      <>
        We do not promise email notifications. Until an email provider is
        deliberately configured by the company, enquiries are reviewed by
        authorized administrators in the internal dashboard.
      </>,
    ],
  },
  {
    title: "6. How long we keep it",
    body: [
      <>
        Enquiry records are retained only as long as needed to handle your
        enquiry and any resulting engagement, and for a reasonable period
        afterwards. [Owner/legal review: insert the company’s retention
        period — for example “24 months after last contact” — once decided.]
      </>,
    ],
  },
  {
    title: "7. Your choices and rights",
    body: [
      <>
        You may ask us to access, correct, or delete the personal information
        we hold about you, or withdraw consent to further contact, at any
        time. [Owner/legal review: insert the official contact email address
        and any additional rights wording required under applicable law.]
      </>,
    ],
  },
  {
    title: "8. Changes to this notice",
    body: [
      <>
        If this notice changes, the revised version will be published on this
        page. Material changes affecting how your information is handled will
        be described clearly.
      </>,
    ],
  },
  {
    title: "9. Contact",
    body: [
      <>
        Questions about this notice or your information can be sent to
        [Owner: official contact email to be inserted once confirmed]. We aim
        to respond to privacy questions promptly.
      </>,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <section className={cn(sectionSpacing, "bg-offwhite")}>
      <div className={cn(container, "max-w-3xl")}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-ink">
          Legal
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
          Privacy Notice
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink/75">
          This notice explains what information this website collects, why,
          and how it is handled. It is written in plain language on purpose.
        </p>
        <p className="mt-4 rounded-lg border border-gold/40 bg-gold/[0.07] p-4 text-[13px] leading-relaxed text-ink/80">
          [Owner/legal review: this notice is a working draft prepared for
          review by the company and its legal counsel before publication.
          Bracketed notes throughout mark decisions the company must confirm.
          It has not been reviewed by a lawyer.]
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
