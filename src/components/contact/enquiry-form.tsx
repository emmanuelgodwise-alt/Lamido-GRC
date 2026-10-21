"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Loader2, Lock, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, card, field, fieldError, fieldHint, fieldLabel } from "@/lib/styles";
import { serviceDivisions } from "@/lib/divisions";
import { sectors } from "@/lib/sectors";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { submitEnquiry } from "@/lib/enquiry-submit";

/**
 * Enquiry / consultation-request form — Stage 4.
 *
 * States handled (project brief): idle, field errors, sending, success
 * (with reference ID), network failure, backend failure, rate-limited,
 * offline, and "backend not configured". Duplicate submits are disabled
 * while a request is pending. On failure the user's input is retained.
 * The service worker never caches this submission (cross-origin, no-store).
 */

type FormStatus =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success"; referenceId: string }
  | { kind: "error"; message: string; retryable: boolean };

interface FieldState {
  name: string;
  email: string;
  organization: string;
  role: string;
  country: string;
  region: string;
  sector: string;
  division: string;
  subject: string;
  message: string;
  consent: boolean;
  website: string; // honeypot — humans never see or fill it
}

const EMPTY_FORM: FieldState = {
  name: "",
  email: "",
  organization: "",
  role: "",
  country: "",
  region: "",
  sector: "",
  division: "",
  subject: "",
  message: "",
  consent: false,
  website: "",
};

const inputId = (name: string) => `enquiry-${name}`;

function FieldWrap({
  label,
  htmlFor,
  required,
  optional,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
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
          <span className="font-normal text-ink/65"> (optional)</span>
        )}
      </label>
      <div className="mt-1.5">
        {children}
      </div>
      {hint && !error && <p className={fieldHint}>{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} className={fieldError}>
          {error}
        </p>
      )}
    </div>
  );
}

export function EnquiryForm() {
  const [form, setForm] = useState<FieldState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  const mountedAt = useRef<number>(Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const configured = useMemo(() => isSupabaseConfigured(), []);

  useEffect(() => {
    // Move focus to the confirmation heading after a successful submit.
    if (status.kind === "success") {
      headingRef.current?.focus();
    }
  }, [status.kind]);

  const set = <K extends keyof FieldState>(key: K, value: FieldState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus({ kind: "idle" });
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Duplicate-submit guard: nothing is sent while a request is pending.
    if (status.kind === "sending") return;

    setErrors({});
    setStatus({ kind: "sending" });

    const outcome = await submitEnquiry({
      ...form,
      elapsedMs: Date.now() - mountedAt.current,
    });

    switch (outcome.kind) {
      case "success": {
        setStatus({ kind: "success", referenceId: outcome.referenceId });
        setForm(EMPTY_FORM);
        mountedAt.current = Date.now();
        return;
      }
      case "invalid": {
        setErrors(outcome.errors);
        setStatus({ kind: "idle" });
        const firstKey = Object.keys(outcome.errors).find((key) => key !== "form");
        if (firstKey) document.getElementById(inputId(firstKey))?.focus();
        return;
      }
      case "offline": {
        setStatus({
          kind: "error",
          message:
            "You appear to be offline. Please reconnect and submit again — nothing was sent.",
          retryable: true,
        });
        return;
      }
      case "rate-limited": {
        setStatus({
          kind: "error",
          message:
            "Too many enquiries have been submitted from this connection recently. Please try again later.",
          retryable: false,
        });
        return;
      }
      case "origin-blocked": {
        setStatus({
          kind: "error",
          message:
            "This site is not currently authorized to submit enquiries. The site administrator has been made aware.",
          retryable: false,
        });
        return;
      }
      case "network-error": {
        setStatus({
          kind: "error",
          message:
            "A network problem prevented the submission. Please check your connection and try again — your input has been kept.",
          retryable: true,
        });
        return;
      }
      case "not-configured":
      case "server-error": {
        setStatus({
          kind: "error",
          message:
            "The enquiry could not be submitted. Please try again in a moment — your input has been kept.",
          retryable: true,
        });
        return;
      }
    }
  };

  // ---------------------------------------------------------------------
  // Not configured: honest state, no fake success, nothing sent.
  // ---------------------------------------------------------------------
  if (!configured) {
    return (
      <div className={cn(card, "p-6 sm:p-8")}>
        <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">
          Request a Consultation
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          Tell us about your organization and what you want to achieve in
          Northern Nigeria.
        </p>
        <div
          className="mt-6 flex items-start gap-3 rounded-lg border border-line bg-offwhite p-4"
          role="note"
        >
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-ink/40" aria-hidden />
          <p className="text-sm leading-relaxed text-ink/70">
            The secure online enquiry form is being connected to the
            company&apos;s enquiry system and is not yet available. No
            information entered on this page is sent or stored. Please check
            back shortly.
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // Success: confirmation + reference ID (form cleared).
  // ---------------------------------------------------------------------
  if (status.kind === "success") {
    return (
      <div className={cn(card, "p-6 sm:p-8")} aria-live="polite">
        <CheckCircle2 className="h-10 w-10 text-gold" aria-hidden />
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-4 font-display text-2xl font-semibold text-navy"
        >
          Enquiry received.
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
          Thank you — your enquiry has been submitted securely and will be
          reviewed by an authorized member of the team. Please keep the
          reference below for any follow-up.
        </p>
        <p className="mt-5 rounded-lg border border-gold/40 bg-gold/[0.07] px-4 py-3 font-mono text-base font-semibold tracking-wide text-navy">
          {status.referenceId}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink/65">
          Submit another enquiry at any time — or explore{" "}
          <Link
            href="/services"
            className="font-semibold text-navy underline underline-offset-2 hover:text-gold-ink"
          >
            our five divisions
          </Link>{" "}
          while you wait.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus({ kind: "idle" });
            mountedAt.current = Date.now();
          }}
          className={cn(btn("outline"), "mt-6")}
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  const sending = status.kind === "sending";

  return (
    <div className={cn(card, "p-6 sm:p-8")}>
      <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">
        Request a Consultation
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/70">
        Tell us about your organization and what you want to achieve in
        Northern Nigeria. Fields marked * are required.
      </p>

      {status.kind === "error" && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/[0.06] p-4"
        >
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
            aria-hidden
          />
          <p className="text-sm leading-relaxed text-ink/80">
            {status.message}
          </p>
        </div>
      )}
      {errors.form && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-destructive/40 bg-destructive/[0.06] p-4 text-sm leading-relaxed text-ink/80"
        >
          {errors.form}
        </div>
      )}

      <form ref={formRef} className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={submit} noValidate>
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
            value={form.website}
            onChange={(event) => set("website", event.target.value)}
          />
        </div>

        <FieldWrap
          label="Full name"
          htmlFor={inputId("name")}
          required
          error={errors.name}
          className="sm:col-span-2"
        >
          <input
            id={inputId("name")}
            name="name"
            type="text"
            autoComplete="name"
            maxLength={120}
            className={field}
            value={form.name}
            onChange={(event) => set("name", event.target.value)}
            aria-invalid={Boolean(errors.name) || undefined}
            aria-describedby={errors.name ? `${inputId("name")}-error` : undefined}
          />
        </FieldWrap>

        <FieldWrap
          label="Work email"
          htmlFor={inputId("email")}
          required
          error={errors.email}
        >
          <input
            id={inputId("email")}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={200}
            className={field}
            value={form.email}
            onChange={(event) => set("email", event.target.value)}
            aria-invalid={Boolean(errors.email) || undefined}
            aria-describedby={errors.email ? `${inputId("email")}-error` : undefined}
          />
        </FieldWrap>

        <FieldWrap
          label="Country"
          htmlFor={inputId("country")}
          required
          error={errors.country}
        >
          <input
            id={inputId("country")}
            name="country"
            type="text"
            autoComplete="country-name"
            maxLength={100}
            className={field}
            value={form.country}
            onChange={(event) => set("country", event.target.value)}
            aria-invalid={Boolean(errors.country) || undefined}
            aria-describedby={errors.country ? `${inputId("country")}-error` : undefined}
          />
        </FieldWrap>

        <FieldWrap
          label="Organization / company / institution"
          htmlFor={inputId("organization")}
          required
          error={errors.organization}
          className="sm:col-span-2"
        >
          <input
            id={inputId("organization")}
            name="organization"
            type="text"
            autoComplete="organization"
            maxLength={200}
            className={field}
            value={form.organization}
            onChange={(event) => set("organization", event.target.value)}
            aria-invalid={Boolean(errors.organization) || undefined}
            aria-describedby={errors.organization ? `${inputId("organization")}-error` : undefined}
          />
        </FieldWrap>

        <FieldWrap
          label="Role / title"
          htmlFor={inputId("role")}
          optional
          error={errors.role}
        >
          <input
            id={inputId("role")}
            name="role"
            type="text"
            autoComplete="organization-title"
            maxLength={120}
            className={field}
            value={form.role}
            onChange={(event) => set("role", event.target.value)}
          />
        </FieldWrap>

        <FieldWrap
          label="Relevant Northern Nigerian state(s) / region"
          htmlFor={inputId("region")}
          optional
          hint="Free text — for example “Kano”, “North-West”, or “Not sure yet”."
          error={errors.region}
        >
          <input
            id={inputId("region")}
            name="region"
            type="text"
            maxLength={160}
            className={field}
            value={form.region}
            onChange={(event) => set("region", event.target.value)}
          />
        </FieldWrap>

        <FieldWrap
          label="Sector"
          htmlFor={inputId("sector")}
          required
          error={errors.sector}
        >
          <select
            id={inputId("sector")}
            name="sector"
            className={cn(field, "pr-8")}
            value={form.sector}
            onChange={(event) => set("sector", event.target.value)}
            aria-invalid={Boolean(errors.sector) || undefined}
            aria-describedby={errors.sector ? `${inputId("sector")}-error` : undefined}
          >
            <option value="">Select a sector…</option>
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
          error={errors.division}
        >
          <select
            id={inputId("division")}
            name="division"
            className={cn(field, "pr-8")}
            value={form.division}
            onChange={(event) => set("division", event.target.value)}
            aria-invalid={Boolean(errors.division) || undefined}
            aria-describedby={errors.division ? `${inputId("division")}-error` : undefined}
          >
            <option value="">Select a division…</option>
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
          error={errors.subject}
          className="sm:col-span-2"
        >
          <input
            id={inputId("subject")}
            name="subject"
            type="text"
            maxLength={160}
            className={field}
            value={form.subject}
            onChange={(event) => set("subject", event.target.value)}
            aria-invalid={Boolean(errors.subject) || undefined}
            aria-describedby={errors.subject ? `${inputId("subject")}-error` : undefined}
          />
        </FieldWrap>

        <FieldWrap
          label="Project / business objective or message"
          htmlFor={inputId("message")}
          required
          hint="What do you want to achieve, and what support do you think you need? There is no need to write a formal proposal at this stage."
          error={errors.message}
          className="sm:col-span-2"
        >
          <textarea
            id={inputId("message")}
            name="message"
            rows={6}
            maxLength={5000}
            className={cn(field, "min-h-32 resize-y")}
            value={form.message}
            onChange={(event) => set("message", event.target.value)}
            aria-invalid={Boolean(errors.message) || undefined}
            aria-describedby={errors.message ? `${inputId("message")}-error` : undefined}
          />
        </FieldWrap>

        <div className="sm:col-span-2">
          <label
            htmlFor={inputId("consent")}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-4",
              errors.consent
                ? "border-destructive/50 bg-destructive/[0.05]"
                : "border-line bg-offwhite",
            )}
          >
            <input
              id={inputId("consent")}
              name="consent"
              type="checkbox"
              className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-navy"
              checked={form.consent}
              onChange={(event) => set("consent", event.target.checked)}
              aria-invalid={Boolean(errors.consent) || undefined}
            />
            <span className="text-[13px] leading-relaxed text-ink/75">
              I consent to Lamido, Lamido &amp; Co. storing and processing the
              information I submit in order to respond to my enquiry, as
              described in the{" "}
              <Link
                href="/privacy"
                className="font-semibold text-navy underline underline-offset-2 hover:text-gold-ink"
              >
                Privacy Notice
              </Link>
              . <span className="text-destructive">*</span>
            </span>
          </label>
          {errors.consent && (
            <p className={fieldError} id={`${inputId("consent")}-error`}>
              {errors.consent}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={sending}
            className={cn(
              btn("primary"),
              sending && "cursor-wait opacity-70",
            )}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Submitting…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden />
                Submit enquiry
              </>
            )}
          </button>
          <p className={cn(fieldHint, "mt-3 max-w-md")}>
            Submissions are protected against abuse and reviewed only by
            authorized administrators. Nothing is sent while the button is
            disabled.
          </p>
        </div>
      </form>
    </div>
  );
}
