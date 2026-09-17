import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { listPagesWithContent } from "@/lib/page-content";

/**
 * GET /api/pages — list all pages with per-locale content and status.
 * Guarded manually: the middleware does NOT run for /api/* routes.
 */
export async function GET() {
  const { error } = await requireSession();
  if (error) {
    return error;
  }

  const pages = await listPagesWithContent();
  return NextResponse.json({ pages });
}