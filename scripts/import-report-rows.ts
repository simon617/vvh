/**
 * Import downloaded Financial/ESG report PDFs as report rows into the DB.
 *
 * Reads REPORT_CATALOG (scripts/report-catalog.ts, generated from the four
 * download scripts in ./tools) and matches each entry against the PDFs that
 * actually exist under ./uploads/reports/<locale>/.  It then upserts the
 * report JSON envelope into page_contents.contentHtml for the
 * financial-reports / esg-reports pages — the same envelope shape the CMS
 * ReportsEditor writes and the public pages read (see src/lib/report-rows.ts).
 *
 * Usage:
 *   npm run import:content -- reports
 *
 * The script only creates rows for PDFs found on disk (so no broken links are
 * seeded), and reports which catalog entries could not be found.
 *  Filename matching is tolerant (see `canonicalName`): lowercase, ignores a
 *  CMS-upload `<epochMs>-` prefix, treats separator runs as equivalent.
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { buildReportContent, type ReportRowItem } from "../src/lib/report-rows";
import { REPORT_CATALOG, type ReportCatalogEntry } from "./report-catalog";

const prisma = new PrismaClient();

const UPLOAD_ROOT = path.resolve("uploads", "reports");

/**
 * Canonical file key for matching catalog filenames against files on disk:
 * - lowercases,
 * - ignores a CMS-upload timestamp prefix (`<epochMs>-`, see
 *   `POST /api/upload/pdf` in src/app/api/upload/pdf/route.ts),
 * - treats any run of non-alphanumerics as `-` so `C-ESG_Report_2018-v4.pdf`
 *   matches the catalog's `C-ESG Report 2018-v4.pdf`.
 */
function canonicalName(name: string): string {
  return name.toLowerCase().replace(/^\d+-/, "").replace(/[^a-z0-9]+/g, "-");
}

/** Recursively gather every *.pdf path (POSIX, relative to locale dir). */
function scanLocaleDir(locale: string): Map<string, string> {
  const root = path.join(UPLOAD_ROOT, locale);
  const found = new Map<string, string>();
  if (!fs.existsSync(root)) return found;

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.toLowerCase().endsWith(".pdf")) {
        const rel = path.relative(root, full).split(path.sep).join("/");
        found.set(canonicalName(entry.name), rel);
      }
    }
  };
  walk(root);
  return found;
}

function pageSlugFor(entry: ReportCatalogEntry): string {
  return entry.page === "esg" ? "esg-reports" : "financial-reports";
}

function urlFor(locale: string, relPath: string): string {
  return `/uploads/reports/${locale}/${relPath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/")}`;
}

function stableId(entry: ReportCatalogEntry): string {
  return `${entry.locale}-${entry.page}-${entry.file.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9]+/g, "-")}`;
}

async function importRows(): Promise<void> {
  const onDisk = { en: scanLocaleDir("en"), zh: scanLocaleDir("zh") };
  console.log(
    `PDFs on disk → ${onDisk.en.size} en / ${onDisk.zh.size} zh`
  );

  const built = new Map<string, { slug: string; locale: "en" | "zh"; rows: ReportRowItem[] }>();
  const missing: { file: string; date: string; name: string; locale: string }[] = [];

  for (const entry of REPORT_CATALOG) {
    const disk = onDisk[entry.locale];
    const rel = disk.get(canonicalName(entry.file));
    if (!rel) {
      missing.push({ file: entry.file, date: entry.date, name: entry.name, locale: entry.locale });
      continue;
    }
    const key = `${entry.page}|${entry.locale}`;
    const item: ReportRowItem = {
      id: stableId(entry),
      date: entry.date,
      title: entry.name,
      url: urlFor(entry.locale, rel),
    };
    const slot = built.get(key) ?? {
      slug: pageSlugFor(entry),
      locale: entry.locale,
      rows: [],
    };
    slot.rows.push(item);
    built.set(key, slot);
  }

  // Sort each group newest-first (catalog order already descending by year).
  const slots = Array.from(built.values());
  for (const slot of slots) {
    slot.rows.sort((a, b) => b.date.localeCompare(a.date));
  }

  let updated = 0;
  for (const slot of slots) {
    const page = await prisma.page.findUnique({
      where: { slug: slot.slug },
      select: { id: true },
    });
    if (!page) {
      console.warn(`  skip '${slot.slug}' — no page row (run seed first)`);
      continue;
    }
    const contentHtml = buildReportContent(slot.rows);
    await prisma.pageContent.upsert({
      where: { pageId_locale: { pageId: page.id, locale: slot.locale } },
      create: {
        pageId: page.id,
        locale: slot.locale,
        title: slot.slug === "esg-reports" ? (slot.locale === "zh" ? "環境、社會及管治報告" : "ESG Reports") : (slot.locale === "zh" ? "財務報告" : "Financial Reports"),
        breadcrumbLabel: slot.slug === "esg-reports" ? (slot.locale === "zh" ? "環境、社會及管治報告" : "ESG Reports") : (slot.locale === "zh" ? "財務報告" : "Financial Reports"),
        metaTitle: slot.slug === "esg-reports"
          ? (slot.locale === "zh" ? "環境、社會及管治報告 | 遠見控股有限公司" : "ESG Reports | Vision Values Holdings Limited")
          : (slot.locale === "zh" ? "財務報告 | 遠見控股有限公司" : "Financial Reports | Vision Values Holdings Limited"),
        contentHtml,
        isPublished: true,
      },
      update: { contentHtml, isPublished: true },
    });
    console.log(
      `  ${slot.slug} ${slot.locale}: ${slot.rows.length} rows`
    );
    updated += 1;
  }

  console.log(`\nImport complete. ${updated} page rows upserted.`);

  if (missing.length > 0) {
    console.log("\nCatalog entries with NO matching PDF on disk:");
    for (const m of missing) {
      console.log(`  [${m.locale}] ${m.file}  (${m.name})`);
    }
  }
}

importRows()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());