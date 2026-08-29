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

/** Generate a stable id for a new row. */
export function makeRowId(): string {
  return `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}