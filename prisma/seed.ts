import { PrismaClient } from "@prisma/client";
import {
  getPlaceholder,
  PLACEHOLDER_SLUGS,
} from "../src/lib/placeholders";
import { getDirectors } from "../src/lib/directors";
import type { Locale } from "../src/lib/navigation";

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

/* ------------------------------------------------------------------ *
 * Phase 2.5 — Content migration builders
 * Upsert existing site content into the `page_contents` table so it can
 * be retrieved and edited from the admin CMS (/admin/pages).
 * ------------------------------------------------------------------ */

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Board of Directors content: category <h2> + one card <p> per director,
 *  plus the Role-and-Functions PDF link. Rendered as cards by
 *  .director-cards in globals.css. */
function directorCardsHtml(locale: Locale): string {
  const groups = new Map<string, { name: string; title: string; bio: string }[]>();
  for (const d of getDirectors(locale)) {
    const list = groups.get(d.category) ?? [];
    list.push(d);
    groups.set(d.category, list);
  }

  const blocks: string[] = [];
  for (const [category, list] of Array.from(groups.entries())) {
    blocks.push(`<h2>${escHtml(category)}</h2>`);
    for (const d of list) {
      const titleHtml = d.title ? `<br/><em>${escHtml(d.title)}</em>` : "";
      blocks.push(
        `<p><strong>${escHtml(d.name)}</strong>${titleHtml}<br/>${escHtml(d.bio)}</p>`
      );
    }
  }

  const roleLabel =
    locale === "zh" ? "董事之角色與職能" : "Directors' Roles and Functions";
  const roleHeader = locale === "en" ? "Roles & Responsibilities" : "角色與職責";
  blocks.push(
    `<p><strong>${escHtml(roleHeader)}</strong><br/>` +
      `<a href="/uploads/reports/${locale}/RoleAndFunction.pdf" target="_blank" rel="noopener noreferrer">` +
      `${escHtml(roleLabel)} (PDF)</a></p>`
  );

  return blocks.join("\n");
}

/** Corporate Governance documentation links (point to locally uploaded PDFs). */
const GOVERNANCE_DOCS: Record<Locale, { label: string; file: string }[]> = {
  en: [
    { label: "Memorandum & Articles of Association", file: "MoAandAoA (3).pdf" },
    { label: "Board Diversity Policy", file: "E-20180800-Board Diversity PolicyV2.pdf" },
    { label: "Terms of Reference of the Nomination Committee", file: "e_Terms of Reference of Nomination Committee.pdf" },
    { label: "Nomination Policy", file: "E-Nomination Policy.pdf" },
    { label: "Workforce Diversity Policy", file: "e_Workforce Diversity Policy.pdf" },
    { label: "Terms of Reference of the Audit Committee", file: "TOR-AuditCommittee (1).pdf" },
    { label: "Terms of Reference of the Remuneration Committee", file: "TOR-RemunerationCommittee.pdf" },
    { label: "Whistleblowing Policy", file: "WHISTLEBLOWING POLICY MEC (eng) (1).pdf" },
    { label: "Anti-Corruption Policy", file: "VVH Anti-corruption policy (eng).pdf" },
    { label: "Code for Securities Transactions", file: "CodeForSecuritiesTransactions.pdf" },
    { label: "Dividend Policy", file: "E-dividend policy.pdf" },
  ],
  zh: [
    { label: "組織章程大綱及細則", file: "MoAandAoA (3).pdf" },
    { label: "董事會多元化政策", file: "C-20181205-Board Diversity Policy (chi).pdf" },
    { label: "提名委員會職權範圍", file: "c_Terms of Reference of Nomination Committee.pdf" },
    { label: "提名政策", file: "C-Nomination Policy.pdf" },
    { label: "員工多元化政策", file: "c_Workforce Diversity Policy.pdf" },
    { label: "審核委員會職權範圍", file: "TOR-AuditCommittee (1).pdf" },
    { label: "薪酬委員會職權範圍", file: "TOR-RemunerationCommittee.pdf" },
    { label: "舉報政策", file: "WHISTLEBLOWING POLICY MEC (chi).pdf" },
    { label: "反貪污政策", file: "VVH Anti-corruption policy (chi).pdf" },
    { label: "證券交易守則", file: "CodeForSecuritiesTransactions.pdf" },
    { label: "股息政策", file: "C-dividend policy.pdf" },
  ],
};

function governanceHtml(locale: Locale): string {
  const intro =
    locale === "zh"
      ? "本公司致力維持嚴謹之企業管治。以下為相關政策及文件，歡迎下載查閱。"
      : "The Company is committed to maintaining the highest standards of corporate governance. The following policies and documents are available for download.";
  const items = GOVERNANCE_DOCS[locale]
    .map(
      (doc) =>
        `<li><a href="/uploads/reports/${locale}/${encodeURI(doc.file)}" target="_blank" rel="noopener noreferrer">${escHtml(doc.label)}</a></li>`
    )
    .join("\n");
  const heading = locale === "en" ? "Policies & Documents" : "政策及文件";
  return `<p>${intro}</p>\n<h2>${heading}</h2>\n<ul>\n${items}\n</ul>`;
}

/** Upsert a page_contents row per slug/locale from the existing content. */
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

      let contentHtml = ph.contentHtml;
      if (slug === "board-of-directors") contentHtml = directorCardsHtml(locale);
      else if (slug === "corporate-governance") contentHtml = governanceHtml(locale);

      const data = {
        title: ph.title,
        metaTitle: ph.metaTitle,
        metaDescription: ph.metaDescription,
        breadcrumbLabel: ph.breadcrumb,
        heroImage: ph.heroImage ?? null,
        contentHtml,
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