import { NextResponse } from "next/server";
import { buildRobotsTxt } from "@/lib/robots";

/**
 * GET /robots.txt — allows all crawlers and points at the sitemap
 * (deliverable 4.5 / WEB-10). Public, no auth, not locale-prefixed.
 */
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  return new NextResponse(buildRobotsTxt(siteUrl), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}