/**
 * Safe CSV export for the admin dashboard.
 *
 * Spreadsheet formula-injection protection (project brief, Stage 5): any
 * cell whose value begins with `=`, `+`, `-`, `@`, a tab, or a carriage
 * return is prefixed with a single quote so spreadsheet applications treat
 * it as text, never as a formula. RFC 4180 quoting is applied on top.
 */
export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | null | undefined;
}

const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

function escapeCell(input: string | null | undefined): string {
  const cell = input ?? "";
  const dangerous = FORMULA_PREFIXES.some((prefix) => cell.startsWith(prefix));
  const guarded = dangerous ? `'${cell}` : cell;
  if (/[",\n\r]/.test(guarded)) {
    return `"${guarded.replace(/"/g, '""')}"`;
  }
  return guarded;
}

/** Build a CSV document from rows + column definitions. */
export function buildCsv<T>(
  rows: readonly T[],
  columns: readonly CsvColumn<T>[],
): string {
  const header = columns.map((column) => escapeCell(column.header)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => escapeCell(column.value(row))).join(","),
  );
  return [header, ...body].join("\r\n");
}

/**
 * Timestamped, timezone-explicit filename, e.g.
 * `lamido-enquiries-2026-10-21T14-05-UTC.csv`.
 */
export function csvFilename(prefix = "lamido-enquiries"): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp = [
    now.getUTCFullYear(),
    pad(now.getUTCMonth() + 1),
    pad(now.getUTCDate()),
  ].join("-");
  const time = [
    pad(now.getUTCHours()),
    pad(now.getUTCMinutes()),
    pad(now.getSeconds()),
  ].join("-");
  return `${prefix}-${stamp}T${time}-UTC.csv`;
}

/** Client-side download of a CSV string (never a public URL). */
export function downloadCsv(csv: string, filename = csvFilename()): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
