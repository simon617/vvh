import { getPlaceholder, type PagePlaceholder } from "./placeholders";
import type { Locale } from "./navigation";

export type { PagePlaceholder };

/**
 * Get page data for a given slug and locale.
 *
 * Phase 2A: returns placeholder/static content.
 * Phase 2B: this function will be swapped to query the `pages`/`page_contents`
 * tables from Prisma — the public interface (PagePlaceholder) will stay the same.
 */
export function getPageData(
  slug: string,
  locale: Locale
): PagePlaceholder | null {
  if (locale !== "en" && locale !== "zh") return null;
  return getPlaceholder(slug, locale);
}
