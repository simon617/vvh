/**
 * robots.txt content helper (deliverable 4.5 / WEB-10).
 * No auth; served publicly at /robots.txt. The Sitemap line must be an
 * absolute URL derived from NEXT_PUBLIC_SITE_URL.
 */

/** Build the robots.txt body for a given site origin. */
export function buildRobotsTxt(siteUrl: string): string {
  const base = siteUrl.replace(/\/+$/, "");
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${base}/sitemap.xml`,
    "",
  ].join("\n");
}