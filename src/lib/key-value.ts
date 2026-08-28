/**
 * Key-value HTML table helpers (Phase 2B structured page editor).
 *
 * Corporate-Details (and any future structured pages) store their content in
 * `page_contents.contentHtml` as a simple two-column table mirroring the
 * placeholder format:
 *
 *   <table><tbody>
 *     <tr><th style="text-align:left">Key</th><td>Value</td></tr>
 *     ...
 *   </tbody></table>
 *
 * These helpers parse that HTML into editable key/row pairs and rebuild the
 * same HTML after editing. They are DOM-free (regex/token based) so they work
 * identically in the browser (editor) and in tests.
 */

export interface KeyValueRow {
  key: string;
  value: string;
}

/** Minimal HTML entity decoder for trusted CMS output. */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/g, "'");
}

/** Escape text for safe inclusion inside HTML tags. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function extractInner(body: string, tag: RegExp): string | null {
  const m = body.match(tag);
  return m ? decodeEntities(m[1].trim()) : null;
}

/** Collapse br/whitespace/newlines in recovered value text. */
function cleanText(s: string): string {
  return decodeEntities(s)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Best-effort recovery from the paragraph format the WYSIWYG produces when a
 * `<table>` is pasted into it: `<p><strong>Key</strong> value <br>...</p>`.
 * Each `<strong>` is a label and the following text (until the next label or
 * line break) is its value. Falls back to an empty array when nothing matches.
 */
function parseParagraphKeys(html: string): KeyValueRow[] {
  const rows: KeyValueRow[] = [];
  const pRe = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let pMatch: RegExpExecArray | null;

  while ((pMatch = pRe.exec(html)) !== null) {
    const body = pMatch[1];
    // Find all <strong>labels</strong> and gather the text between them.
    const strongRe = /<strong\b[^>]*>([\s\S]*?)<\/strong>/gi;
    const items: { label: string; value: string }[] = [];
    let cursor = 0;
    let m: RegExpExecArray | null;
    while ((m = strongRe.exec(body)) !== null) {
      const label = cleanText(m[1]);
      // Text between the previous item and this label becomes the previous value.
      if (items.length > 0) {
        const between = body.slice(cursor, m.index);
        items[items.length - 1].value = cleanText(between);
      }
      cursor = strongRe.lastIndex;
      items.push({ label, value: "" });
    }
    // Trailing text after the last label is its value.
    if (items.length > 0) {
      items[items.length - 1].value = cleanText(body.slice(cursor));
    }
    for (const item of items) {
      if (item.label) rows.push({ key: item.label, value: item.value });
    }
  }
  return rows;
}

/**
 * Parse table HTML (or recovered paragraph content) into key/value rows.
 * Returns an empty array when no rows are found (so the editor starts blank).
 */
export function parseKeyValueTable(html: string): KeyValueRow[] {
  const rows: KeyValueRow[] = [];
  const trRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let tr: RegExpExecArray | null;
  while ((tr = trRe.exec(html)) !== null) {
    const key = extractInner(tr[1], /<th\b[^>]*>([\s\S]*?)<\/th>/i);
    const value = extractInner(tr[1], /<td\b[^>]*>([\s\S]*?)<\/td>/i);
    if (key !== null && value !== null) {
      rows.push({ key, value });
    }
  }
  if (rows.length > 0) return rows;
  // No table rows → fall back to recovering any paragraph `**label` value content.
  return parseParagraphKeys(html);
}

/** Build the two-column table HTML from rows (matches the placeholder format). */
export function buildKeyValueTable(rows: KeyValueRow[]): string {
  if (rows.length === 0) return "";
  const body = rows
    .map(
      (r) =>
        `<tr><th style="text-align:left">${escapeHtml(r.key)}</th><td>${escapeHtml(
          r.value
        )}</td></tr>`
    )
    .join("\n");
  return `<table>\n  <tbody>\n${body}\n  </tbody>\n</table>`;
}