"use client";

/**
 * Accessible, responsive enquiry list.
 * Desktop: a real table; phones: stacked cards. The reference cell is a
 * button in both layouts so everything is keyboard operable. Pagination is
 * bounded so the page stays efficient.
 */
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { card, field } from "@/lib/styles";
import type { EnquiryRecord, StatusFilter } from "@/lib/admin/queries";
import {
  ENQUIRY_STATUSES,
  statusBadgeClasses,
  statusLabels,
} from "@/lib/admin/status";

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

export function EnquiryList({
  rows,
  total,
  page,
  pageSize,
  statusFilter,
  search,
  loading,
  onPageChange,
  onStatusFilterChange,
  onSearchChange,
  onOpen,
}: {
  rows: EnquiryRecord[];
  total: number;
  page: number;
  pageSize: number;
  statusFilter: StatusFilter;
  search: string;
  loading: boolean;
  onPageChange: (page: number) => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  onSearchChange: (term: string) => void;
  onOpen: (id: string) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);

  return (
    <div className="mt-6">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35"
            aria-hidden
          />
          <input
            type="search"
            className={cn(field, "pl-10")}
            placeholder="Search reference, name, email, organization, subject…"
            aria-label="Search enquiries"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            className={cn(field, "sm:w-48")}
            value={statusFilter}
            onChange={(event) =>
              onStatusFilterChange(event.target.value as StatusFilter)
            }
          >
            <option value="all">All statuses</option>
            {ENQUIRY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty / loading / error states */}
      {loading && rows.length === 0 && (
        <p className="mt-8 text-center text-sm text-ink/65" role="status">
          Loading enquiries…
        </p>
      )}
      {!loading && rows.length === 0 && (
        <div className={cn(card, "mt-8 p-10 text-center")}>
          <p className="font-display text-lg font-semibold text-navy">
            No enquiries to show
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/65">
            {statusFilter !== "all" || search
              ? "No enquiries match the current filters — try clearing them."
              : "New enquiries submitted through the website will appear here."}
          </p>
        </div>
      )}

      {/* Desktop table */}
      {rows.length > 0 && (
        <div className={cn(card, "mt-6 hidden overflow-hidden md:block")}>
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Enquiries, newest first. Select a reference to open its details.
            </caption>
            <thead>
              <tr className="border-b border-line bg-offwhite text-[11px] uppercase tracking-wider text-ink/65">
                <th scope="col" className="px-4 py-3 font-semibold">Reference</th>
                <th scope="col" className="px-4 py-3 font-semibold">Submitted</th>
                <th scope="col" className="px-4 py-3 font-semibold">Contact</th>
                <th scope="col" className="px-4 py-3 font-semibold">Subject</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onOpen(row.id)}
                      className="font-mono text-[13px] font-semibold text-navy underline-offset-4 hover:text-gold-ink hover:underline"
                    >
                      {row.reference_id}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink/70">
                    {formatDate(row.submitted_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="block font-medium text-ink">{row.name}</span>
                    <span className="block text-xs text-ink/65">
                      {row.organization} · {row.country}
                    </span>
                  </td>
                  <td className="max-w-56 truncate px-4 py-3 text-ink/75">
                    {row.subject}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile stacked cards */}
      {rows.length > 0 && (
        <ul className="mt-6 space-y-3 md:hidden">
          {rows.map((row) => (
            <li key={row.id} className={cn(card, "p-4")}>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onOpen(row.id)}
                  className="font-mono text-[13px] font-semibold text-navy underline-offset-4 hover:text-gold-ink hover:underline"
                >
                  {row.reference_id}
                </button>
                <StatusBadge status={row.status} />
              </div>
              <p className="mt-2 text-sm font-medium text-ink">
                {row.name} · {row.organization}
              </p>
              <p className="mt-0.5 truncate text-sm text-ink/70">{row.subject}</p>
              <p className="mt-1.5 text-xs text-ink/65">
                {formatDate(row.submitted_at)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <nav
          aria-label="Enquiry pages"
          className="mt-6 flex items-center justify-between"
        >
          <button
            type="button"
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-4 text-sm font-medium transition-colors",
              page === 0
                ? "cursor-not-allowed text-ink/30"
                : "text-navy hover:bg-offwhite",
            )}
            disabled={page === 0}
            onClick={() => onPageChange(Math.max(0, page - 1))}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Previous
          </button>
          <p aria-live="polite" className="text-sm text-ink/65">
            {from}–{to} of {total}
          </p>
          <button
            type="button"
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-4 text-sm font-medium transition-colors",
              page + 1 >= pageCount
                ? "cursor-not-allowed text-ink/30"
                : "text-navy hover:bg-offwhite",
            )}
            disabled={page + 1 >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            Next
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </nav>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: EnquiryRecord["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        statusBadgeClasses[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
