import type { Locale } from "./navigation";

export interface Announcement {
  date: string;
  title: string;
  url: string;
}

/**
 * Placeholder announcements for Phase 2A.
 * Phase 3 replaces this with `announcements` table rows (HKEX-linked).
 */
const ANNOUNCEMENTS: Record<Locale, Announcement[]> = {
  en: [
    {
      date: "2026-01-15",
      title: "Announcement of Annual Results",
      url: "https://www1.hkexnews.hk/",
    },
    {
      date: "2025-12-01",
      title: "Circular",
      url: "https://www1.hkexnews.hk/",
    },
  ],
  zh: [
    {
      date: "2026-01-15",
      title: "全年業績公告",
      url: "https://www1.hkexnews.hk/",
    },
    {
      date: "2025-12-01",
      title: "通函",
      url: "https://www1.hkexnews.hk/",
    },
  ],
};

export function getAnnouncements(locale: Locale): Announcement[] {
  return ANNOUNCEMENTS[locale];
}
