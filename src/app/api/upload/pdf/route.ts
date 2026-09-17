import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { assertAllowedDocument } from "@/lib/uploads";
import {
  assertFileAllowed,
  deleteUpload,
  fileFromFormData,
  storeUpload,
} from "@/lib/upload-http";

const REPORTS_SUBDIR = "reports";
const LOCALES = ["en", "zh"] as const;
const RESERVED_UPLOAD_PREFIX = `/uploads/${REPORTS_SUBDIR}/`;

/**
 * POST /api/upload/pdf?locale=en|zh — store a report document and return its URL.
 *
 * Reports live under <UPLOAD_DIR>/reports/<locale>/ (matching the paths the
 * Phase 2.5 seed already uses, e.g. /uploads/reports/en/RoleAndFunction.pdf).
 * Self-guards (middleware skips /api/*). Files are stored relative and served
 * by the /uploads route.
 */
export async function POST(request: NextRequest) {
  const { error } = await requireSession();
  if (error) {
    return error;
  }

  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "en";
  if (!(LOCALES as readonly string[]).includes(locale)) {
    return NextResponse.json(
      { error: "locale must be 'en' or 'zh'" },
      { status: 400 }
    );
  }

  const { file, error: fileError } = await fileFromFormData(request);
  if (fileError) {
    return fileError;
  }

  const validationError = assertFileAllowed(assertAllowedDocument, file);
  if (validationError) {
    return validationError;
  }

  const relativePath = await storeUpload(file, [REPORTS_SUBDIR, locale]);
  return NextResponse.json({ path: relativePath }, { status: 200 });
}

/**
 * DELETE /api/upload/pdf?path=/uploads/reports/<locale>/<file>
 * — delete a report document from disk (used when a report row is removed).
 *
 * Deletion is delegated to @/lib/upload-http#deleteUpload, which constrains
 * paths to the /uploads/reports/ space, resolves against UPLOAD_DIR via
 * `resolveUploadPath` (guards `..` traversal escaping the root) and is
 * idempotent: removing an already-deleted file still returns ok (the editor's
 * row-delete is best-effort).
 */
export async function DELETE(request: NextRequest) {
  const { error } = await requireSession();
  if (error) {
    return error;
  }

  const url = new URL(request.url);
  const deleteError = await deleteUpload(
    url.searchParams.get("path") ?? "",
    RESERVED_UPLOAD_PREFIX
  );
  if (deleteError) {
    return deleteError;
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}