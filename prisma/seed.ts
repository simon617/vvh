import { PrismaClient } from "@prisma/client";
import {
  getPlaceholder,
  PLACEHOLDER_SLUGS,
} from "../src/lib/placeholders";

const prisma = new PrismaClient();

/**
 * Page slugs must match src/lib/navigation.ts (NAV_SLUGS) exactly so the
 * admin pages listing and the DB-aware getPageData stay in sync with the
 * public routing.
 */
const PAGES = [
  { slug: "home", menuOrder: 1 },
  { slug: "board-of-directors", menuOrder: 2 },
  { slug: "corporate-details", menuOrder: 3 },
  { slug: "corporate-governance", menuOrder: 4 },
  { slug: "financial-reports", menuOrder: 6 },
  { slug: "esg-reports", menuOrder: 7 },
  { slug: "lost-share-certificates", menuOrder: 8 },
  { slug: "corporate-communications", menuOrder: 9 },
  { slug: "contact", menuOrder: 10 },
] as const;

/** Upsert a page_contents row per slug/locale from the placeholder (the single
 *  static-content source). Placeholders now carry the same content as the DB
 *  baseline (director card grid, governance local-PDF links, report envelopes). */
async function migratePageContent(): Promise<void> {
  console.log("Migrating Phase 2.5 content into page_contents...");
  let updated = 0;

  for (const slug of PLACEHOLDER_SLUGS) {
    for (const locale of ["en", "zh"] as const) {
      const ph = getPlaceholder(slug, locale);
      if (!ph) continue;

      const page = await prisma.page.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!page) {
        console.warn(`  skip '${slug}' — page row missing (run pages seed first)`);
        continue;
      }

      const data = {
        title: ph.title,
        metaTitle: ph.metaTitle,
        metaDescription: ph.metaDescription,
        breadcrumbLabel: ph.breadcrumb,
        heroImage: ph.heroImage ?? null,
        contentHtml: ph.contentHtml,
        isPublished: true,
      };

      await prisma.pageContent.upsert({
        where: { pageId_locale: { pageId: page.id, locale } },
        create: { pageId: page.id, locale, ...data },
        update: data,
      });
      updated += 1;
    }
  }

  console.log(`Content migration complete. ${updated} page_content rows upserted.`);
}

async function main() {
  console.log("Seeding pages table...");

  for (const page of PAGES) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: { menuOrder: page.menuOrder },
      create: {
        slug: page.slug,
        menuOrder: page.menuOrder,
        isVisible: true,
      },
    });
    console.log(`  upserted page '${page.slug}' (menuOrder=${page.menuOrder})`);
  }

  // Remove pages that are no longer CMS-managed (e.g. `announcements` — Datalink
  // iframe only: no placeholder, no editor, no page_contents). Idempotent:
  // PageContent rows cascade-delete with the page.
  const canonicalSlugs = PAGES.map((p) => p.slug);
  const stale = await prisma.page.findMany({
    where: { slug: { notIn: [...canonicalSlugs] } },
    select: { slug: true },
  });
  for (const stalePage of stale) {
    await prisma.page.delete({ where: { slug: stalePage.slug } });
    console.log(`  pruned page '${stalePage.slug}' (removed from CMS)`);
  }

  const count = await prisma.page.count();
  console.log(`Seed complete. Page count = ${count}`);

  await migratePageContent();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());