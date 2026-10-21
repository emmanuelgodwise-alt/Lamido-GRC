"use client";

/**
 * Enquiry detail view: full record, status change (reversible, audit-logged
 * by the DB trigger), private internal notes, and the activity timeline.
 * Notes are admin-only data — never exposed through the public site, the
 * service worker, or CSV export of the public columns.
 */
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, History, Loader2, Save, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, card, field } from "@/lib/styles";
import type {
  EnquiryEventRecord,
  EnquiryRecord,
} from "@/lib/admin/queries";
import { MAX_NOTES_LENGTH } from "@/lib/admin/queries";
import {
  ENQUIRY_STATUSES,
  statusLabels,
  type EnquiryStatus,
} from "@/lib/admin/status";
import { StatusBadge } from "@/components/admin/enquiry-list";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

export function EnquiryDetail({
  enquiry,
  events,
  onClose,
  onStatusChange,
  onNotesSave,
}: {
  enquiry: EnquiryRecord;
  events: EnquiryEventRecord[];
  onClose: () => void;
  onStatusChange: (id: string, status: EnquiryStatus) => Promise<void>;
  onNotesSave: (id: string, notes: string) => Promise<void>;
}) {
  const [statusBusy, setStatusBusy] = useState(false);
  const [notes, setNotes] = useState(enquiry.admin_notes ?? "");
  const [notesBusy, setNotesBusy] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [enquiry.id]);

  // Keep the editor in sync when the record is refreshed.
  useEffect(() => {
    setNotes(enquiry.admin_notes ?? "");
    setNotesSaved(false);
  }, [enquiry.id, enquiry.admin_notes]);

  const saveNotes = async () => {
    if (notesBusy) return;
    setNotesBusy(true);
    try {
      await onNotesSave(enquiry.id, notes);
      setNotesSaved(true);
    } finally {
      setNotesBusy(false);
    }
  };

  const rows: Array<[string, string]> = [
    ["Submitted (UTC)", formatDate(enquiry.submitted_at)],
    ["Name", enquiry.name],
    ["Email", enquiry.email],
    ["Organization", enquiry.organization],
    ["Role / title", enquiry.role ?? "—"],
    ["Country", enquiry.country],
    ["State / region", enquiry.region ?? "—"],
    ["Sector", enquiry.sector],
    ["Service division", enquiry.division],
    ["Subject", enquiry.subject],
    ["Consent recorded", formatDate(enquiry.consent_at)],
    ["Last updated (UTC)", formatDate(enquiry.updated_at)],
  ];

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-2 text-sm font-medium text-ink/65 transition-colors hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to all enquiries
      </button>

      <div className={cn(card, "mt-4 p-6 sm:p-8")}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="font-mono text-xl font-semibold text-navy"
            >
              {enquiry.reference_id}
            </h2>
            <p className="mt-1 text-sm text-ink/65">
              Enquiry record — private, internal view
            </p>
          </div>
          <StatusBadge status={enquiry.status} />
        </div>

        {/* Status change */}
        <div className="mt-6 rounded-lg border border-line bg-offwhite p-4">
          <label
            htmlFor="status-change"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/65"
          >
            Workflow status (changes are logged)
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <select
              id="status-change"
              className={cn(field, "sm:max-w-xs")}
              value={enquiry.status}
              disabled={statusBusy}
              onChange={async (event) => {
                const next = event.target.value as EnquiryStatus;
                setStatusBusy(true);
                try {
                  await onStatusChange(enquiry.id, next);
                } finally {
                  setStatusBusy(false);
                }
              }}
            >
              {ENQUIRY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
            {statusBusy && (
              <span className="inline-flex items-center gap-2 text-sm text-ink/65">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </span>
            )}
          </div>
        </div>

        {/* Enquiry fields */}
        <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/65">
                {label}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink/85">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Message */}
        <div className="mt-6">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/65">
            Project / business objective
          </h3>
          <p className="mt-2 whitespace-pre-wrap rounded-lg border border-line bg-offwhite p-4 text-sm leading-relaxed text-ink/85">
            {enquiry.message}
          </p>
        </div>

        {/* Internal notes */}
        <div className="mt-8 border-t border-line pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold" aria-hidden />
            <h3 className="font-display text-base font-semibold text-navy">
              Internal notes
            </h3>
            <span className="text-xs text-ink/65">
              visible to authorized administrators only
            </span>
          </div>
          <label htmlFor="admin-notes" className="sr-only">
            Internal notes
          </label>
          <textarea
            id="admin-notes"
            rows={5}
            maxLength={MAX_NOTES_LENGTH}
            className={cn(field, "mt-3 resize-y")}
            placeholder="Add context, follow-ups, or next steps for the team…"
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              setNotesSaved(false);
            }}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-ink/65">
              {notes.length}/{MAX_NOTES_LENGTH} characters
            </p>
            <div className="flex items-center gap-3">
              {notesSaved && (
                <span role="status" className="text-sm font-medium text-[#2c5c38]">
                  Notes saved.
                </span>
              )}
              <button
                type="button"
                onClick={saveNotes}
                disabled={notesBusy}
                className={btn("primary", "min-h-10 px-5 py-2 text-sm")}
              >
                {notesBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" aria-hidden />
                    Save notes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Activity timeline */}
        <div className="mt-8 border-t border-line pt-6">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-gold" aria-hidden />
            <h3 className="font-display text-base font-semibold text-navy">
              Activity
            </h3>
          </div>
          {events.length === 0 ? (
            <p className="mt-3 text-sm text-ink/65">
              No status changes recorded yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="flex flex-wrap items-baseline gap-x-2 text-sm"
                >
                  <span className="text-ink/65">{formatDate(event.created_at)}</span>
                  <span className="font-medium text-ink/80">
                    {event.detail ?? event.action}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
