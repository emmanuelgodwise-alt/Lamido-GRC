"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, card, field, fieldHint, fieldLabel } from "@/lib/styles";
import { serviceDivisions } from "@/lib/divisions";
import { sectors } from "@/lib/sectors";

/**
 * Enquiry / consultation-request form.
 *
 * Stage 2 (current): the complete form shell — every field from the project
 * brief, accessible labels, selects for the five divisions and sectors, the
 * consent checkbox, and the honeypot markup. Submission is intentionally
 * disabled with an honest notice until the secure enquiry backend is
 * connected (Stage 4). No dead controls that appear functional.
 */

const inputId = (name: string) => `enquiry-${name}`;

function FieldWrap({
  label,
  htmlFor,
  required,
  optional,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={fieldLabel}>
        {label}
        {required ? (
          <span className="text-destructive"> *</span>
        ) : (
          <span className="font-normal text-ink/45"> (optional)</span>
        )}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className={fieldHint}>{hint}</p>}
    </div>
  );
}

export function EnquiryForm() {
  return (
    <div className={cn(card, "p-6 sm:p-8")}>
      <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">
        Request a Consultation
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/70">
        Tell us about your organization and what you want to achieve in
        Northern Nigeria. Fields marked * are required.
      </p>

      <form
        className="mt-8 grid gap-5 sm:grid-cols-2"
        onSubmit={(event) => event.preventDefault()}
      >
        {/* Anti-spam honeypot — hidden from humans, visible to bots. */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor={inputId("company-website")}>
            Company website (leave blank)
          </label>
          <input
            id={inputId("company-website")}
            name="company_website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <FieldWrap
          label="Full name"
          htmlFor={inputId("name")}
          required
          className="sm:col-span-2"
        >
          <input
            id={inputId("name")}
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={120}
            className={field}
          />
        </FieldWrap>

        <FieldWrap label="Work email" htmlFor={inputId("email")} required>
          <input
            id={inputId("email")}
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
            className={field}
          />
        </FieldWrap>

        <FieldWrap label="Country" htmlFor={inputId("country")} required>
          <input
            id={inputId("country")}
            name="country"
            type="text"
            required
            autoComplete="country-name"
            maxLength={100}
            className={field}
          />
        </FieldWrap>

        <FieldWrap
          label="Organization / company / institution"
          htmlFor={inputId("organization")}
          required
          className="sm:col-span-2"
        >
          <input
            id={inputId("organization")}
            name="organization"
            type="text"
            required
            autoComplete="organization"
            maxLength={200}
            className={field}
          />
        </FieldWrap>

        <FieldWrap label="Role / title" htmlFor={inputId("role")} optional>
          <input
            id={inputId("role")}
            name="role"
            type="text"
            autoComplete="organization-title"
            maxLength={120}
            className={field}
          />
        </FieldWrap>

        <FieldWrap
          label="Relevant Northern Nigerian state(s) / region"
          htmlFor={inputId("region")}
          optional
          hint="Free text — for example “Kano”, “North-West”, or “Not sure yet”."
        >
          <input
            id={inputId("region")}
            name="region"
            type="text"
            maxLength={160}
            className={field}
          />
        </FieldWrap>

        <FieldWrap label="Sector" htmlFor={inputId("sector")} required>
          <select
            id={inputId("sector")}
            name="sector"
            required
            defaultValue=""
            className={cn(field, "pr-8")}
          >
            <option value="" disabled>
              Select a sector…
            </option>
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
            <option value="other">Other / not listed</option>
            <option value="not-sure-yet">Not sure yet</option>
          </select>
        </FieldWrap>

        <FieldWrap
          label="Service division"
          htmlFor={inputId("division")}
          required
        >
          <select
            id={inputId("division")}
            name="division"
            required
            defaultValue=""
            className={cn(field, "pr-8")}
          >
            <option value="" disabled>
              Select a division…
            </option>
            {serviceDivisions.map((division) => (
              <option key={division.id} value={division.id}>
                {division.number} — {division.name}
              </option>
            ))}
            <option value="not-sure-yet">Not sure yet</option>
          </select>
        </FieldWrap>

        <FieldWrap
          label="Enquiry subject"
          htmlFor={inputId("subject")}
          required
          className="sm:col-span-2"
        >
          <input
            id={inputId("subject")}
            name="subject"
            type="text"
            required
            maxLength={160}
            className={field}
          />
        </FieldWrap>

        <FieldWrap
          label="Project / business objective or message"
          htmlFor={inputId("message")}
          required
          hint="What do you want to achieve, and what support do you think you need? There is no need to write a formal proposal at this stage."
          className="sm:col-span-2"
        >
          <textarea
            id={inputId("message")}
            name="message"
            required
            rows={6}
            maxLength={5000}
            className={cn(field, "min-h-32 resize-y")}
          />
        </FieldWrap>

        <div className="sm:col-span-2">
          <label
            htmlFor={inputId("consent")}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-offwhite p-4"
          >
            <input
              id={inputId("consent")}
              name="consent"
              type="checkbox"
              required
              className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-navy"
            />
            <span className="text-[13px] leading-relaxed text-ink/75">
              I consent to {`${"Lamido, Lamido & Co."}`} storing and processing
              the information I submit in order to respond to my enquiry, as
              described in the{" "}
              <Link
                href="/privacy"
                className="font-semibold text-navy underline underline-offset-2 hover:text-gold-deep"
              >
                Privacy Notice
              </Link>
              . <span className="text-destructive">*</span>
            </span>
          </label>
        </div>

        <div className="sm:col-span-2">
          <button type="submit" disabled className={cn(btn("primary"), "cursor-not-allowed opacity-50")}>
            <Lock className="h-4 w-4" aria-hidden />
            Submit enquiry
          </button>
          <p className={cn(fieldHint, "mt-3 max-w-md")}>
            This form is being connected to our secure enquiry handling system
            and will be activated shortly. No information you type here is
            sent or stored until it is active.
          </p>
        </div>
      </form>
    </div>
  );
}
