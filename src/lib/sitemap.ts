import { prisma } from "./prisma";

/**
 * Server-side sitemap helpers (deliverable 4.4 / WEB-10 / TD-27).
 *
 * The sitemap is DYNAMIC: it always reflects the current published state from
 * the `page_contents` table, so re-indexing after CMS edits needs no manual
 * step. Only rows with `isPublished = true` on a visible `Page` are listed.
 */

export interface SitemapEntry {
  slug: string;
  locale: "en" | "zh";
}

/**
 * Public slugs that have NO `pages` row but DO have a public route. These are
 * emitted explicitly so the sitemap stays complete:
 *  - announcements → static Datalink iframe page (TD-30 Option A).
 */
const STATIC_PUBLIC_PAGES: { slug: string; locales: ("en" | "zh")[] }[] = [
  { slug: "announcements", locales: ["en", "zh"] },
];

/** Locale-prefixed URL path for a sitemap entry (no site origin). */
export function urlPathFor(entry: SitemapEntry): string {
  // `home` is served at the locale root: /en/ and /zh/.
  if (entry.slug === "home") {
    return `/${entry.locale}/`;
  }
  return `/${entry.locale}/${entry.slug}`;
}

/**
 * All sitemap-worthy entries: published `page_contents` rows (any published
 * row for a visible page, both locales) plus the static public pages.
 */
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const published = await prisma.pageContent.findMany({
    where: { isPublished: true, page: { isVisible: true } },
    select: { locale: true, page: { select: { slug: true } } },
  });

  const fromDb = published.map((row) => ({
    slug: row.page.slug,
    locale: row.locale as "en" | "zh",
  }));

  const statics = STATIC_PUBLIC_PAGES.flatMap((page) =>
    page.locales.map((locale) => ({ slug: page.slug, locale }))
  );

  return [...statics, ...fromDb];
}

/** Escape text for XML element content. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Build the sitemap <urlset> document for a list of entries (pure).
 * Duplicate URLs (e.g. static + DB) are de-duplicated and sorted for stable
 * output. Pass the production origin in `siteUrl` (`NEXT_PUBLIC_SITE_URL`).
 */
export function buildSitemapXml(
  entries: SitemapEntry[],
  siteUrl: string
): string {
  const base = siteUrl.replace(/\/+$/, "");
  const unique = new Map<string, SitemapEntry>();
  for (const entry of entries) {
    unique.set(urlPathFor(entry), entry);
  }
  const urls = [...unique.values()]
    .sort((a, b) => urlPathFor(a).localeCompare(urlPathFor(b)))
    .map((entry) => {
      const loc = escapeXml(base + urlPathFor(entry));
      return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}