import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listPagesWithContent } from "@/lib/page-content";

/**
 * GET /api/pages — list all pages with per-locale content and status.
 * Guarded manually: the middleware does NOT run for /api/* routes.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await listPagesWithContent();
  return NextResponse.json({ pages });
}