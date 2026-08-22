import { PrismaClient } from "@prisma/client";

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
  { slug: "announcements", menuOrder: 5 },
  { slug: "financial-reports", menuOrder: 6 },
  { slug: "esg-reports", menuOrder: 7 },
  { slug: "lost-share-certificates", menuOrder: 8 },
  { slug: "corporate-communications", menuOrder: 9 },
  { slug: "contact", menuOrder: 10 },
] as const;

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

  const count = await prisma.page.count();
  console.log(`Seed complete. Page count = ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());