import type { ReportRow } from "@/components/layout/ReportsTable";
import type { Locale } from "./navigation";

/**
 * Corporate communications documents (Date + Document + local PDF link).
 * Phase 3 will replace these with DB rows from the `reports` table, matching
 * the Financial/ESG report pages.
 */
const CORPORATE_COMMUNICATIONS: Record<Locale, ReportRow[]> = {
  en: [
    {
      id: "comm-202401",
      date: "January 2024",
      title: "Arrangements Regarding Dissemination of Corporate Communications",
      url: "/pdf/communication/e_Communications202401.pdf",
    },
  ],
  zh: [
    {
      id: "comm-202401",
      date: "2024年1月",
      title: "有關發佈公司通訊之安排",
      url: "/pdf/communication/c_Communications202401.pdf",
    },
  ],
};

export function getCorporateCommunications(locale: Locale): ReportRow[] {
  return CORPORATE_COMMUNICATIONS[locale];
}