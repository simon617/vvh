import { getPlaceholder, type PagePlaceholder } from "./placeholders";
import { getPageContent } from "./page-content";
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
 *  3. Row exists but explicitly unpublished → null (public route notFound,
 *     Decision D8).
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
  if (!row) return placeholder;

  // Explicitly unpublished for this locale → 404 (Decision D8).
  if (!row.isPublished) return null;

  return {
    title: row.title,
    metaTitle: row.metaTitle ?? placeholder.metaTitle,
    metaDescription: row.metaDescription ?? placeholder.metaDescription,
    breadcrumb: row.breadcrumbLabel ?? placeholder.breadcrumb,
    heroImage: row.heroImage ?? placeholder.heroImage,
    contentHtml: row.contentHtml ?? placeholder.contentHtml,
  };
}
