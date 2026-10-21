/**
 * Enquiry workflow status metadata.
 *
 * Values match the database CHECK constraint exactly (see
 * supabase/migrations/20261021000001_enquiries.sql). Statuses are reversible
 * by design; there is no delete workflow.
 */
export const ENQUIRY_STATUSES = [
  "new",
  "in_review",
  "contacted",
  "closed",
] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export function isEnquiryStatus(value: unknown): value is EnquiryStatus {
  return (
    typeof value === "string" &&
    (ENQUIRY_STATUSES as readonly string[]).includes(value)
  );
}

export const statusLabels: Record<EnquiryStatus, string> = {
  new: "New",
  in_review: "In review",
  contacted: "Contacted",
  closed: "Closed",
};

/**
 * Badge treatment per status. Every badge includes the text label — status is
 * never conveyed by color alone (accessibility requirement).
 */
export const statusBadgeClasses: Record<EnquiryStatus, string> = {
  new: "bg-navy/[0.08] text-navy border-navy/25",
  in_review: "bg-gold/[0.14] text-gold-deep border-gold/40",
  contacted: "bg-[#e7f0e9] text-[#2c5c38] border-[#4e8b5f]/40",
  closed: "bg-offwhite text-ink/55 border-line",
};
