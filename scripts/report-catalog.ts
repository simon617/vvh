import {
  buildReportContent,
  type ReportRowItem,
} from "../src/lib/report-rows";

/**
 * Catalog of Financial Report & ESG Report PDFs downloaded by the scripts in
 * ./tools (vvheng-frdownload.ps1, vvhchi-frdownload.ps1, vvheng-esgdownload.ps1,
 * vvhchi-esgdownload.ps1). Source of truth for import-report-rows.ts.
 */
export interface ReportCatalogEntry { locale: "en" | "zh"; page: "fr" | "esg"; date: string; name: string; file: string; }

export const REPORT_CATALOG: ReportCatalogEntry[] = [
  { locale: "en", page: "esg", date: "November 2017", name: "ESG Report 2017", file: "LTN20171127265.pdf" },
  { locale: "en", page: "esg", date: "December 2018", name: "ESG Report 2018", file: "E-ESG Report 2018-v4.pdf" },
  { locale: "en", page: "esg", date: "October 2025", name: "ESG Report 2025", file: "e_ESG Report 2025.pdf" },
  { locale: "en", page: "esg", date: "October 2024", name: "ESG Report 2024", file: "e_ESG Report 2024.pdf" },
  { locale: "en", page: "esg", date: "October 2023", name: "ESG Report 2023", file: "e_ESG Report 2023.pdf" },
  { locale: "en", page: "esg", date: "December 2022", name: "ESG Report 2022", file: "e_ESG Report 2022.pdf" },
  { locale: "en", page: "esg", date: "December 2021", name: "ESG Report 2021", file: "e_ESG Report 2021.pdf" },
  { locale: "en", page: "esg", date: "December 2020", name: "ESG Report 2020", file: "e_ESG Report 2020.pdf" },
  { locale: "en", page: "esg", date: "December 2019", name: "ESG Report 2019", file: "e_ESG Report 2019.pdf" },
  { locale: "en", page: "fr", date: "March 2026", name: "Interim Report 2025/2026", file: "ir2025-26e.pdf" },
  { locale: "en", page: "fr", date: "March 2025", name: "Interim Report 2024/2025", file: "ir2024-25e.pdf" },
  { locale: "en", page: "fr", date: "March 2024", name: "Interim Report 2023/2024", file: "ir2023-24e.pdf" },
  { locale: "en", page: "fr", date: "March 2023", name: "Interim Report 2022/2023", file: "ir2022-23e.pdf" },
  { locale: "en", page: "fr", date: "March 2022", name: "Interim Report 2021/2022", file: "ir2021-22e.pdf" },
  { locale: "en", page: "fr", date: "March 2021", name: "Interim Report 2020/2021", file: "ir2020-21e.pdf" },
  { locale: "en", page: "fr", date: "March 2020", name: "Interim Report 2019/2020", file: "ir2019-20e.pdf" },
  { locale: "en", page: "fr", date: "March 2019", name: "Interim Report 2018/2019", file: "ir2018-19e.pdf" },
  { locale: "en", page: "fr", date: "March 2018", name: "Interim Report 2017/2018", file: "ir2017-18e.pdf" },
  { locale: "en", page: "fr", date: "March 2017", name: "Interim Report 2016/2017", file: "ir2016-17e.pdf" },
  { locale: "en", page: "fr", date: "March 2016", name: "Interim Report 2015/2016", file: "ir2015-16e.pdf" },
  { locale: "en", page: "fr", date: "March 2015", name: "Interim Report 2014/2015", file: "ir2014-15e.pdf" },
  { locale: "en", page: "fr", date: "March 2014", name: "Interim Report 2013/2014", file: "ir2013-14e.pdf" },
  { locale: "en", page: "fr", date: "March 2013", name: "Interim Report 2012/2013", file: "ir2012-13e.pdf" },
  { locale: "en", page: "fr", date: "March 2012", name: "Interim Report 2011/2012", file: "ir2011-12e.pdf" },
  { locale: "en", page: "fr", date: "March 2011", name: "Interim Report 2010/2011", file: "ir2010-11e.pdf" },
  { locale: "en", page: "fr", date: "March 2008", name: "Interim Report 2007/2008", file: "ir2007-08e.pdf" },
  { locale: "en", page: "fr", date: "October 2026", name: "Annual Report 2026", file: "ar_2026_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2025", name: "Annual Report 2025", file: "ar_2025_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2024", name: "Annual Report 2024", file: "ar_2024_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2023", name: "Annual Report 2023", file: "ar_2023_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2022", name: "Annual Report 2022", file: "ar_2022_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2021", name: "Annual Report 2021", file: "ar_2021_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2020", name: "Annual Report 2020", file: "ar_2020_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2019", name: "Annual Report 2019", file: "ar_2019_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2018", name: "Annual Report 2018", file: "ar_2018_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2017", name: "Annual Report 2017", file: "ar_2017_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2016", name: "Annual Report 2016", file: "ar_2016_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2015", name: "Annual Report 2015", file: "ar_2015_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2014", name: "Annual Report 2014", file: "ar_2014_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2013", name: "Annual Report 2013", file: "ar_2013_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2012", name: "Annual Report 2012", file: "ar_2012_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2011", name: "Annual Report 2011", file: "ar_2011_eng.pdf" },
  { locale: "en", page: "fr", date: "October 2010", name: "Annual Report 2010", file: "ar_2010_E00862.pdf" },
  { locale: "en", page: "fr", date: "October 2009", name: "Annual Report 2009", file: "ar_2009_E00862.pdf" },
  { locale: "en", page: "fr", date: "October 2008", name: "Annual Report 2008", file: "an2008e.pdf" },
  { locale: "en", page: "fr", date: "October 2007", name: "Annual Report 2007", file: "an2007e.pdf" },
  { locale: "en", page: "fr", date: "March 2010", name: "Interim Report 2009/2010", file: "2009-10-E00862.pdf" },
  { locale: "en", page: "fr", date: "March 2009", name: "Interim Report 2008/2009", file: "2008-09-E00862.pdf" },
  { locale: "zh", page: "esg", date: "2017年11月", name: "2017年度環境、社會及管治報告", file: "LTN20171127266_C.pdf" },
  { locale: "zh", page: "esg", date: "2018年12月", name: "2018年度環境、社會及管治報告", file: "C-ESG Report 2018-v4.pdf" },
  { locale: "zh", page: "esg", date: "2025年10月", name: "2025年度環境、社會及管治報告", file: "c_ESG Report 2025.pdf" },
  { locale: "zh", page: "esg", date: "2024年10月", name: "2024年度環境、社會及管治報告", file: "c_ESG Report 2024.pdf" },
  { locale: "zh", page: "esg", date: "2023年10月", name: "2023年度環境、社會及管治報告", file: "c_ESG Report 2023.pdf" },
  { locale: "zh", page: "esg", date: "2022年12月", name: "2022年度環境、社會及管治報告", file: "c_ESG Report 2022.pdf" },
  { locale: "zh", page: "esg", date: "2021年12月", name: "2021年度環境、社會及管治報告", file: "c_ESG Report 2021.pdf" },
  { locale: "zh", page: "esg", date: "2020年12月", name: "2020年度環境、社會及管治報告", file: "c_ESG Report 2020.pdf" },
  { locale: "zh", page: "esg", date: "2019年12月", name: "2019年度環境、社會及管治報告", file: "c_ESG Report 2019.pdf" },
  { locale: "zh", page: "fr", date: "2026年3月", name: "2025/2026中期報告", file: "ir2025-26c.pdf" },
  { locale: "zh", page: "fr", date: "2025年3月", name: "2024/2025中期報告", file: "ir2024-25c.pdf" },
  { locale: "zh", page: "fr", date: "2024年3月", name: "2023/2024中期報告", file: "ir2023-24c.pdf" },
  { locale: "zh", page: "fr", date: "2023年3月", name: "2022/2023中期報告", file: "ir2022-23c.pdf" },
  { locale: "zh", page: "fr", date: "2022年3月", name: "2021/2022中期報告", file: "ir2021-22c.pdf" },
  { locale: "zh", page: "fr", date: "2021年3月", name: "2020/2021中期報告", file: "ir2020-21c.pdf" },
  { locale: "zh", page: "fr", date: "2020年3月", name: "2019/2020中期報告", file: "ir2019-20c.pdf" },
  { locale: "zh", page: "fr", date: "2019年3月", name: "2018/2019中期報告", file: "ir2018-19c.pdf" },
  { locale: "zh", page: "fr", date: "2018年3月", name: "2017/2018中期報告", file: "ir2017-18c.pdf" },
  { locale: "zh", page: "fr", date: "2017年3月", name: "2016/2017中期報告", file: "ir2016-17c.pdf" },
  { locale: "zh", page: "fr", date: "2016年3月", name: "2015/2016中期報告", file: "ir2015-16c.pdf" },
  { locale: "zh", page: "fr", date: "2015年3月", name: "2014/2015中期報告", file: "ir2014-15c.pdf" },
  { locale: "zh", page: "fr", date: "2014年3月", name: "2013/2014中期報告", file: "ir2013-14c.pdf" },
  { locale: "zh", page: "fr", date: "2013年3月", name: "2012/2013中期報告", file: "ir2012-13c.pdf" },
  { locale: "zh", page: "fr", date: "2012年3月", name: "2011/2012中期報告", file: "ir2011-12c.pdf" },
  { locale: "zh", page: "fr", date: "2011年3月", name: "2010/2011中期報告", file: "ir2010-11c.pdf" },
  { locale: "zh", page: "fr", date: "2008年3月", name: "2007/2008中期報告", file: "ir2007-08c.pdf" },
  { locale: "zh", page: "fr", date: "2010年10月", name: "2010年度全年報告", file: "ar2010_C00862.pdf" },
  { locale: "zh", page: "fr", date: "2009年10月", name: "2009年度全年報告", file: "ar2009_C00862.pdf" },
  { locale: "zh", page: "fr", date: "2026年10月", name: "2026年度全年報告", file: "ar_2026_chi.pdf" },
  { locale: "zh", page: "fr", date: "2025年10月", name: "2025年度全年報告", file: "ar_2025_chi.pdf" },
  { locale: "zh", page: "fr", date: "2024年10月", name: "2024年度全年報告", file: "ar_2024_chi.pdf" },
  { locale: "zh", page: "fr", date: "2023年10月", name: "2023年度全年報告", file: "ar_2023_chi.pdf" },
  { locale: "zh", page: "fr", date: "2022年10月", name: "2022年度全年報告", file: "ar_2022_chi.pdf" },
  { locale: "zh", page: "fr", date: "2021年10月", name: "2021年度全年報告", file: "ar_2021_chi.pdf" },
  { locale: "zh", page: "fr", date: "2020年10月", name: "2020年度全年報告", file: "ar_2020_chi.pdf" },
  { locale: "zh", page: "fr", date: "2019年10月", name: "2019年度全年報告", file: "ar_2019_chi.pdf" },
  { locale: "zh", page: "fr", date: "2018年10月", name: "2018年度全年報告", file: "ar_2018_chi.pdf" },
  { locale: "zh", page: "fr", date: "2017年10月", name: "2017年度全年報告", file: "ar_2017_chi.pdf" },
  { locale: "zh", page: "fr", date: "2016年10月", name: "2016年度全年報告", file: "ar_2016_chi.pdf" },
  { locale: "zh", page: "fr", date: "2015年10月", name: "2015年度全年報告", file: "ar_2015_chi.pdf" },
  { locale: "zh", page: "fr", date: "2014年10月", name: "2014年度全年報告", file: "ar_2014_chi.pdf" },
  { locale: "zh", page: "fr", date: "2013年10月", name: "2013年度全年報告", file: "ar_2013_chi.pdf" },
  { locale: "zh", page: "fr", date: "2012年10月", name: "2012年度全年報告", file: "ar_2012_chi.pdf" },
  { locale: "zh", page: "fr", date: "2011年10月", name: "2011年度全年報告", file: "ar_2011_chi.pdf" },
  { locale: "zh", page: "fr", date: "2008年10月", name: "2008年度全年報告", file: "an2008c.pdf" },
  { locale: "zh", page: "fr", date: "2007年10月", name: "2007年度全年報告", file: "an2007c.pdf" },
  { locale: "zh", page: "fr", date: "2010年3月", name: "2009/2010中期報告", file: "2009-10-C00862.pdf" },
  { locale: "zh", page: "fr", date: "2009年3月", name: "2008/2009中期報告", file: "2008-09-C00862.pdf" },
];

/* -------------------------------------------------------------------------- *
 * Catalog → report-row helpers (shared by prisma/seed.ts and
 * import-report-rows.ts). The seed uses these directly (it cannot rely on PDFs
 * being on disk yet); the importer reuses the same `stableId` so its later
 * upserts overwrite the seeded rows instead of duplicating them.
 * -------------------------------------------------------------------------- */

/** Stable, unique row id — identical in seed and import (idempotent upserts). */
export function stableId(entry: ReportCatalogEntry): string {
  return `${entry.locale}-${entry.page}-${entry.file.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9]+/g, "-")}`;
}

/** Public page slug for a catalog page bucket ("fr" | "esg"). */
export function catalogSlugFor(page: ReportCatalogEntry["page"]): string {
  return page === "esg" ? "esg-reports" : "financial-reports";
}

/** Canonical upload URL for a catalog entry (no PDF-on-disk dependency). */
export function catalogUrlFor(entry: ReportCatalogEntry): string {
  return `/uploads/reports/${entry.locale}/${encodeURIComponent(entry.file)}`;
}

/** A ReportRowItem from a catalog entry (id/date/title + upload URL). */
export function catalogRowFor(entry: ReportCatalogEntry): ReportRowItem {
  return {
    id: stableId(entry),
    date: entry.date,
    title: entry.name,
    url: catalogUrlFor(entry),
  };
}

/** All catalog rows for a report slug + locale. */
export function catalogRowsFor(
  slug: string,
  locale: "en" | "zh"
): ReportRowItem[] {
  return REPORT_CATALOG
    .filter((entry) => catalogSlugFor(entry.page) === slug && entry.locale === locale)
    .map(catalogRowFor);
}

/** Serialized "reports" envelope for a report slug + locale, or null. */
export function catalogEnvelopeFor(
  slug: string,
  locale: "en" | "zh"
): string | null {
  const rows = catalogRowsFor(slug, locale);
  return rows.length > 0 ? buildReportContent(rows) : null;
}
