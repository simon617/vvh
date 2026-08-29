import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";
import {
  assertAllowedDocument,
  sanitizeFilename,
  uploadsDir,
} from "@/lib/uploads";

const REPORTS_SUBDIR = "reports";
const LOCALES = ["en", "zh"] as const;

/**
 * POST /api/upload/pdf?locale=en|zh — store a report document and return its URL.
 *
 * Reports live under <UPLOAD_DIR>/reports/<locale>/ (matching the paths the
 * Phase 2.5 seed already uses, e.g. /uploads/reports/en/RoleAndFunction.pdf).
 * Self-guards (middleware skips /api/*). Files are stored relative and served
 * by the /uploads route.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "en";
  if (!(LOCALES as readonly string[]).includes(locale)) {
    return NextResponse.json(
      { error: "locale must be 'en' or 'zh'" },
      { status: 400 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const rawFile = formData?.get("file");
  const file = rawFile && typeof rawFile !== "string" ? rawFile : null;
  if (!file || typeof file.name !== "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    assertAllowedDocument(file.name, file.size);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }

  const localeDir = path.join(uploadsDir(), REPORTS_SUBDIR, locale);
  await fs.mkdir(localeDir, { recursive: true });

  const uniqueName = `${Date.now()}-${sanitizeFilename(file.name)}`;
  const relativePath = `/uploads/${REPORTS_SUBDIR}/${locale}/${uniqueName}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(localeDir, uniqueName), bytes);

  return NextResponse.json({ path: relativePath }, { status: 200 });
}