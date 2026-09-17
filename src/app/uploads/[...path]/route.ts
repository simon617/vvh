import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { mimeTypeForUpload, resolveUploadPath } from "@/lib/uploads";

/**
 * Serve uploaded files from UPLOAD_DIR (default ./uploads) at /uploads/<path>.
 *
 * Why a route handler instead of public/:
 * - The app is built with `output: "standalone"`. In production the standalone
 *   server only serves files that existed at build time under `public/` or
 *   `.next/static/`; runtime uploads must be read from disk at request time.
 * - Docker maps a persistent volume to /app/uploads, so writes survive
 *   container restarts and are served from there.
 */

export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const relative = (params.path ?? []).join("/");
  const filePath = resolveUploadPath(relative);

  if (!filePath) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const data = await fs.readFile(filePath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": mimeTypeForUpload(filePath),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}