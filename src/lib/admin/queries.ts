/**
 * Admin data layer — thin, typed wrappers around supabase-js.
 *
 * SECURITY: every query runs through the browser client with the caller's
 * session, so database RLS is the real authority. If the signed-in user is
 * not an authorized admin, these queries return nothing (fail closed) —
 * the UI state machine in the dashboard is UX only, never the boundary.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/admin/status";

export interface EnquiryRecord {
  id: string;
  reference_id: string;
  submitted_at: string;
  name: string;
  email: string;
  organization: string;
  role: string | null;
  country: string;
  region: string | null;
  sector: string;
  division: string;
  subject: string;
  message: string;
  consent_at: string;
  status: EnquiryStatus;
  admin_notes: string | null;
  assigned_to: string | null;
  updated_at: string;
}

export interface EnquiryEventRecord {
  id: number;
  enquiry_id: string;
  actor: string | null;
  action: string;
  detail: string | null;
  created_at: string;
}

export type StatusFilter = EnquiryStatus | "all";

export interface EnquiryPage {
  rows: EnquiryRecord[];
  total: number;
}

export const PAGE_SIZE = 10;
export const MAX_CSV_ROWS = 500;

/** Is the current authenticated user an authorized admin? (DB function.) */
export async function checkAdmin(
  db: SupabaseClient,
): Promise<boolean> {
  const { data, error } = await db.rpc("is_admin");
  if (error) {
    console.error("admin check failed:", error.code ?? "unknown"); // code only
    return false; // fail closed
  }
  return data === true;
}

/** Summary counts for the four workflow statuses. */
export async function fetchCounts(
  db: SupabaseClient,
): Promise<Record<EnquiryStatus, number>> {
  const counts = { new: 0, in_review: 0, contacted: 0, closed: 0 } as Record<
    EnquiryStatus,
    number
  >;
  await Promise.all(
    ENQUIRY_STATUSES.map(async (status) => {
      const { count } = await db
        .from("enquiries")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      counts[status] = count ?? 0;
    }),
  );
  return counts;
}

/** Strip characters that would break the `.or()` filter syntax. */
function sanitizeSearch(term: string): string {
  return term.replace(/[,()%]/g, " ").replace(/\s+/g, " ").trim();
}

function listQuery(
  db: SupabaseClient,
  status: StatusFilter,
  search: string,
  rangeFrom: number,
  rangeTo: number,
  select: string = "*",
) {
  let query = db
    .from("enquiries")
    .select(select, { count: "exact" })
    .order("submitted_at", { ascending: false })
    .range(rangeFrom, rangeTo);
  if (status !== "all") query = query.eq("status", status);
  const term = sanitizeSearch(search);
  if (term) {
    const safe = term.replace(/,/g, ""); // double-guard the .or() argument
    query = query.or(
      `reference_id.ilike.%${safe}%,name.ilike.%${safe}%,email.ilike.%${safe}%,organization.ilike.%${safe}%,subject.ilike.%${safe}%`,
    );
  }
  return query;
}

/** One page of enquiries under the current filters. */
export async function fetchPage(
  db: SupabaseClient,
  status: StatusFilter,
  search: string,
  page: number,
  pageSize: number = PAGE_SIZE,
): Promise<EnquiryPage> {
  const from = Math.max(0, page) * pageSize;
  const { data, error, count } = await listQuery(
    db,
    status,
    search,
    from,
    from + pageSize - 1,
  );
  if (error) throw new Error(error.code ?? "query_failed");
  return { rows: (data ?? []) as unknown as EnquiryRecord[], total: count ?? 0 };
}

/** Up to MAX_CSV_ROWS enquiries under the current filters (for export). */
export async function fetchForExport(
  db: SupabaseClient,
  status: StatusFilter,
  search: string,
  maxRows: number = MAX_CSV_ROWS,
): Promise<EnquiryRecord[]> {
  const columns =
    "id, reference_id, submitted_at, name, email, organization, role, " +
    "country, region, sector, division, subject, message, consent_at, " +
    "status, updated_at";
  const { data, error } = await listQuery(
    db,
    status,
    search,
    0,
    maxRows - 1,
    columns,
  );
  if (error) throw new Error(error.code ?? "query_failed");
  return (data ?? []) as unknown as EnquiryRecord[];
}

/** A single enquiry with its activity events. */
export async function fetchDetail(
  db: SupabaseClient,
  id: string,
): Promise<{ enquiry: EnquiryRecord; events: EnquiryEventRecord[] } | null> {
  const { data, error } = await db
    .from("enquiries")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const { data: events } = await db
    .from("enquiry_events")
    .select("id, enquiry_id, actor, action, detail, created_at")
    .eq("enquiry_id", id)
    .order("created_at", { ascending: false });
  return {
    enquiry: data as EnquiryRecord,
    events: (events ?? []) as EnquiryEventRecord[],
  };
}

/** Reversible status change — the DB trigger records the audit event. */
export async function updateStatus(
  db: SupabaseClient,
  id: string,
  status: EnquiryStatus,
): Promise<void> {
  const { error } = await db.from("enquiries").update({ status }).eq("id", id);
  if (error) throw new Error(error.code ?? "update_failed");
}

/** Internal notes are admin-only data; length matches the DB constraint. */
export const MAX_NOTES_LENGTH = 10000;

export async function updateNotes(
  db: SupabaseClient,
  id: string,
  notes: string,
): Promise<void> {
  const trimmed = notes.trim().slice(0, MAX_NOTES_LENGTH);
  const { error } = await db
    .from("enquiries")
    .update({ admin_notes: trimmed === "" ? null : trimmed })
    .eq("id", id);
  if (error) throw new Error(error.code ?? "update_failed");
}
