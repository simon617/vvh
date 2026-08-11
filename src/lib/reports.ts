import type { ReportRow } from "@/components/layout/ReportsTable";
import type { Locale } from "./navigation";

/**
 * Placeholder report data for Phase 2A.
 * Phase 3 will replace these with DB rows from the `reports` table.
 */
const FINANCIAL_REPORTS: Record<Locale, ReportRow[]> = {
  en: [
    {
      id: "fin-2025",
      date: "2025",
      title: "Annual Report 2025",
      url: "/pdf/AnnualReport2025.pdf",
    },
    {
      id: "fin-2025-interim",
      date: "2025 Interim",
      title: "Interim Report 2025",
      url: "/pdf/InterimReport2025.pdf",
    },
  ],
  zh: [
    {
      id: "fin-2025",
      date: "2025",
      title: "2025年報",
      url: "/pdf/AnnualReport2025.pdf",
    },
    {
      id: "fin-2025-interim",
      date: "2025中期",
      title: "2025中期報告",
      url: "/pdf/InterimReport2025.pdf",
    },
  ],
};

const ESG_REPORTS: Record<Locale, ReportRow[]> = {
  en: [
    {
      id: "esg-2025",
      date: "2025",
      title: "ESG Report 2025",
      url: "/pdf/ESGReport2025.pdf",
    },
  ],
  zh: [
    {
      id: "esg-2025",
      date: "2025",
      title: "2025環境、社會及管治報告",
      url: "/pdf/ESGReport2025.pdf",
    },
  ],
};

export function getFinancialReports(locale: Locale): ReportRow[] {
  return FINANCIAL_REPORTS[locale];
}

export function getEsgReports(locale: Locale): ReportRow[] {
  return ESG_REPORTS[locale];
}
