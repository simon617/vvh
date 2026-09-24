import { getPlaceholder, type PagePlaceholder } from "./placeholders";
import { getPageContent } from "./page-content";
import {
  getReportRows,
  sortReportRowsByDate,
  type ReportRowItem,
} from "./report-rows";
import type { Locale } from "./navigation";

export type { PagePlaceholder };

/**
 * DB-aware page data for a given slug and locale (deliverable 2B.12).
 *
 * Resolution order:
 *  1. Unknown slug / invalid locale        → null (public route 404s).
 *  2. No `page_contents` row yet           → fall back to the static
 *     placeholder so the site keeps rendering until content migration
 *     (Phase 2.5) — a fresh install has no content rows.
 *  3. Row exists but explicitly unpublished → fall back to the static
 *     placeholder. Content typed in the editor but left unpublished is not
 *     shown; the site displays the seeded placeholder instead (no 404).
 *  4. Row exists and is published          → return DB content, falling back
 *     to placeholder values for any unset optional field (SEO/hero/breadcrumb).
 *
 * Server-only: DB reads must never leak into client components.
 */
export async function getPageData(
  slug: string,
  locale: Locale
): Promise<PagePlaceholder | null> {
  if (locale !== "en" && locale !== "zh") return null;

  const placeholder = getPlaceholder(slug, locale);
  if (!placeholder) return null; // unknown slug

  const row = await getPageContent(slug, locale);

  // No content row yet → keep the placeholder rendering until migration.
  if (!row) return { ...placeholder, isDbContent: false };

  // Explicitly unpublished for this locale → show the placeholder instead of
  // the DB draft (no 404). Empty editor drafts must never leak to the public.
  if (!row.isPublished) return { ...placeholder, isDbContent: false };

  return {
    title: row.title,
    metaTitle: row.metaTitle ?? placeholder.metaTitle,
    metaDescription: row.metaDescription ?? placeholder.metaDescription,
    breadcrumb: row.breadcrumbLabel ?? placeholder.breadcrumb,
    heroImage: row.heroImage ?? placeholder.heroImage,
    contentHtml: row.contentHtml ?? placeholder.contentHtml,
    isDbContent: true,
  };
}

/** Report rows (CMS envelope) for a report slug + locale, or [] when none. */
export async function getReportRowsBySlug(
  slug: string,
  locale: Locale
): Promise<ReportRowItem[]> {
  const data = await getPageData(slug, locale);
  return data ? (getReportRows(data.contentHtml) ?? []) : [];
}

export interface LatestReports {
  financial: ReportRowItem[];
  esg: ReportRowItem[];
}

/**
 * Newest report rows per category for the home "Latest Reports" section.
 * Reads the LIVE CMS envelopes (financial-reports / esg-reports) so the home
 * page reflects the same rows as the public report pages, sorted by date
 * descending (matching ReportsTable's default) and capped at `limit` rows each.
 */
export async function getLatestReports(
  locale: Locale,
  limit = 3
): Promise<LatestReports> {
  return {
    financial: sortReportRowsByDate(
      await getReportRowsBySlug("financial-reports", locale)
    ).slice(0, limit),
    esg: sortReportRowsByDate(
      await getReportRowsBySlug("esg-reports", locale)
    ).slice(0, limit),
  };
}
