/**
 * Report-row helpers for the shared document report editor (Phase 2B).
 *
 * Financial / ESG reports and Corporate Communications store their rows in
 * `page_contents.contentHtml` as a JSON envelope so the public pages can
 * render them through the paginated <ReportsTable>:
 *
 *   {"__type":"reports","rows":[{"id","date","title","url"}, ...]}
 *
 * Ordinary WYSIWYG/key-value HTML fails the envelope check and `getRows`
 * returns null, so non-report pages are unaffected.
 */

export interface ReportRowItem {
  id: string;
  date: string;
  title: string;
  url: string;
}

const ENVELOPE = "__type" as const;
const TYPE = "reports";

/** Resolve report rows from a contentHtml string, or null when not report data. */
export function getReportRows(content: string | null | undefined): ReportRowItem[] | null {
  if (!content) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return null;
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as { __type?: unknown }).__type !== TYPE
  ) {
    return null;
  }
  const rows = (parsed as { rows?: unknown }).rows;
  if (!Array.isArray(rows)) return null;
  return (rows as ReportRowItem[]).map((row) => ({
    id: String(row?.id ?? ""),
    date: String(row?.date ?? ""),
    title: String(row?.title ?? ""),
    url: String(row?.url ?? ""),
  }));
}

/** Serialize report rows into the contentHtml envelope. */
export function buildReportContent(rows: ReportRowItem[]): string {
  return JSON.stringify({ __type: TYPE, rows });
}

const MONTHS: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

/**
 * Normalize a localized report date into a "YYYY-MM" sort key so rows order
 * chronologically regardless of display language:
 *
 *   EN "October 2025" / "2025"  →  "2025-10" / "2025"
 *   ZH "2025年10月" / "2025年"    →  "2025-10" / "2025-00"
 *   ISO "2025-12-31"            →  "2025-12"
 *
 * Month is "00" only for the Chinese year-only form (identical to "2025-00",
 * still year-desc). Unparseable values fall back to the trimmed original so
 * ordering stays deterministic.
 */
export function reportDateKey(date: string): string {
  const value = date.trim();

  // Chinese: 2025年10月 | 2025年3月 | 2025年
  const zh = /^(\d{4})\s*年(?:\s*(\d{1,2})\s*月)?$/.exec(value);
  if (zh) {
    const month = zh[2] ? Number(zh[2]) : 0;
    return `${zh[1]}-${String(month).padStart(2, "0")}`;
  }

  // English: "October 2025" | "2025"
  const en = /^([A-Za-z]+)\s+(\d{4})$/.exec(value);
  if (en) {
    const month = MONTHS[en[1].toLowerCase()];
    return month ? `${en[2]}-${month}` : en[2];
  }

  // ISO-style: 2025-12-31 | 2025-12
  const iso = /^(\d{4})[-./](\d{1,2})(?:[-./]\d{1,2})?$/.exec(value);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, "0")}`;
  }

  return value;
}

/**
 * Sort a copy of report rows by date descending — mirrors `ReportsTable`'s
 * default sort (date desc) and the report-import script ordering. Uses
 * `reportDateKey` so localized dates ("October 2025" / "2025年10月") order
 * chronologically, not lexicographically.
 */
export function sortReportRowsByDate(rows: ReportRowItem[]): ReportRowItem[] {
  return [...rows].sort((a, b) =>
    reportDateKey(b.date).localeCompare(reportDateKey(a.date))
  );
}

/** Generate a stable id for a new row. */
export function makeRowId(): string {
  return `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}