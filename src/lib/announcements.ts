import type { Locale } from "./navigation";

/**
 * Per-locale Datalink announcement pages, embedded via an <iframe> — mirroring
 * the legacy ASP `<frame src="...">`. The page renders whatever content the
 * provider serves, so newly published announcements appear automatically.
 */
export const ANNOUNCEMENT_IFRAME_URLS: Record<Locale, string> = {
  en: "https://datalink.talesis.com/document/c00640/Announcement_new",
  zh: "https://datalink.talesis.com/document/c00640/Chinese/Announcement_2D_Chineselist_new",
};

/** Get the announcement iframe URL for a locale. */
export function getAnnouncementsUrl(locale: Locale): string {
  return ANNOUNCEMENT_IFRAME_URLS[locale];
}
