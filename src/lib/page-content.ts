import { prisma } from "./prisma";
import type { PageContent } from "@prisma/client";

/**
 * Server-side data access for the CMS `pages` / `page_contents` tables.
 * Used by the admin CMS API routes and (via getPageData) the public pages.
 *
 * All functions are server-only — never import this module into a client
 * component; call the /api routes instead.
 */

export type { PageContent };

export interface PageContentRow {
  id: number;
  pageId: number;
  locale: string;
  isPublished: boolean;
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  heroImage: string | null;
  contentHtml: string | null;
  breadcrumbLabel: string | null;
  updatedAt: Date;
}

export interface PageContentInput {
  isPublished?: boolean;
  title?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  heroImage?: string | null;
  contentHtml?: string | null;
  breadcrumbLabel?: string | null;
}

export interface PageWithContentSummary {
  id: number;
  slug: string;
  menuOrder: number;
  isVisible: boolean;
  en: PageContentRow | null;
  zh: PageContentRow | null;
}

/** Get a page content row for a given slug + locale, or null. */
export async function getPageContent(
  slug: string,
  locale: string
): Promise<PageContentRow | null> {
  return prisma.pageContent.findFirst({
    where: {
      locale,
      page: { slug },
    },
  });
}

/** Get the Page id for a slug, or null when the page does not exist. */
export async function getPageBySlug(
  slug: string
): Promise<{ id: number } | null> {
  return prisma.page.findUnique({
    where: { slug },
    select: { id: true },
  });
}

/**
 * Create-or-update a page content row for a single locale.
 * EN/ZH are separate rows linked by pageId (`@@unique([pageId, locale])`);
 * upserting one locale never touches the other.
 */
export async function upsertPageContent(
  slug: string,
  locale: string,
  data: PageContentInput
): Promise<PageContentRow> {
  const page = await prisma.page.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!page) {
    throw new Error(`Page not found for slug: ${slug}`);
  }

  const { title, ...rest } = data;
  const payload = { ...rest, title: title ?? "Untitled" };

  return prisma.pageContent.upsert({
    where: { pageId_locale: { pageId: page.id, locale } },
    create: { pageId: page.id, locale, ...payload },
    update: payload,
  });
}

/** List all pages with their per-locale content (null when a locale is absent). */
export async function listPagesWithContent(): Promise<
  PageWithContentSummary[]
> {
  const pages = await prisma.page.findMany({
    orderBy: { menuOrder: "asc" },
    include: { contents: true },
  });

  return pages.map((p) => ({
    id: p.id,
    slug: p.slug,
    menuOrder: p.menuOrder,
    isVisible: p.isVisible,
    en: p.contents.find((c) => c.locale === "en") ?? null,
    zh: p.contents.find((c) => c.locale === "zh") ?? null,
  }));
}

export interface RecentPageActivity {
  slug: string;
  locale: string;
  title: string;
  updatedAt: Date;
}

/** Most recently edited page content rows (for the admin dashboard). */
export async function getRecentPageActivity(
  limit = 10
): Promise<RecentPageActivity[]> {
  const rows = await prisma.pageContent.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: { page: { select: { slug: true } } },
  });

  return rows.map((r) => ({
    slug: r.page.slug,
    locale: r.locale,
    title: r.title,
    updatedAt: r.updatedAt,
  }));
}