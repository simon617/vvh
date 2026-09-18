import type { Metadata } from "next";
import type { Locale } from "@/lib/navigation";
import { getUploadUrl } from "@/lib/uploads";

/**
 * Open Graph / SEO metadata helpers (deliverable 4.6 / WEB-11 / D13).
 *
 * Per page: og:title + og:description come from the CMS SEO fields, and
 * og:image = the hero image when set, else the site logo (TD-29). All image
 * URLs are absolute (social crawlers require it) via getUploadUrl /
 * NEXT_PUBLIC_SITE_URL.
 */

export const SITE_NAME = "Vision Values Holdings Limited";

/** Input shape — satisfied by PagePlaceholder and static page-metadata maps. */
export interface MetadataInput {
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  heroImage?: string | null;
}

/** Absolute site origin (NEXT_PUBLIC_SITE_URL) without a trailing slash. */
export function siteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
}

/** Build Next.js Metadata (title/description + Open Graph) for a page. */
export function buildPageMetadata(
  data: MetadataInput,
  locale: Locale
): Metadata {
  const title = data.metaTitle || data.title;
  const description = data.metaDescription || undefined;

  const heroUrl = data.heroImage ? getUploadUrl(data.heroImage) : "";
  const base = siteBaseUrl();
  // TD-29: hero image first, site logo as fallback.
  const ogImage = heroUrl || (base ? `${base}/logo.svg` : "/logo.svg");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "zh" ? "zh_HK" : "en_HK",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}