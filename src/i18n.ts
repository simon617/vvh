import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["en", "zh"] as const;

// create a TypeScript type so only "en" or "zh" are valid type
export const defaultLocale: Locale = "en";
export type Locale = (typeof locales)[number];  

// Async function that Next.js calls for every request to deterimne the locale and load translation 
// eg. visits /zh/about:
// 1. requestLocale → "zh"
// 2. Validates → "zh" is in ["en", "zh"] ✓
//Loads → ../messages/zh.json
// 4. Renders the page with Chinese translations

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  // Validate locale
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});