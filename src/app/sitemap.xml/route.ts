import { NextResponse } from "next/server";
import { buildSitemapXml, getSitemapEntries } from "@/lib/sitemap";

/**
 * GET /sitemap.xml — dynamically generated sitemap of all published pages
 * (deliverable 4.4 / WEB-10 / TD-27). Public, no auth, not locale-prefixed.
 *
 * `dynamic = "force-dynamic"` is required: a GET route handler that never
 * touches a dynamic API would otherwise be statically optimized at build time
 * (empty DB during a Docker build → empty sitemap).
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const xml = buildSitemapXml(await getSitemapEntries(), siteUrl);
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}