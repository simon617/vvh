import { prisma } from "./prisma";

/**
 * Server-side data access for the `site_settings` table.
 * Admin settings (GA4 tracking ID, site name) are GLOBAL — they are stored
 * with `locale = NULL` and apply to every page/locale.
 */

/** Get a global setting value by key, or null when absent/locale-scoped. */
export async function getSiteSetting(key: string): Promise<string | null> {
  const row = await prisma.siteSetting.findUnique({
    where: { key },
  });
  if (!row || row.locale !== null) {
    return null;
  }
  return row.value;
}

/** Create or update a global setting (always stored as a global row). */
export async function setSiteSetting(
  key: string,
  value: string
): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value, locale: null },
    update: { value, locale: null },
  });
}

/** List all global settings. */
export async function getSiteSettings(): Promise<
  { key: string; value: string }[]
> {
  const rows = await prisma.siteSetting.findMany({
    where: { locale: null },
  });
  // Defensively ignore any locale-scoped rows that creep in.
  return rows
    .filter((r) => r.locale === null)
    .map((r) => ({ key: r.key, value: r.value ?? "" }));
}