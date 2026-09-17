import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import {
  resolveUploadPath,
  sanitizeFilename,
  uploadsDir,
} from "@/lib/uploads";

/**
 * HTTP-coupled helpers shared by the upload routes (api/upload/image,
 * api/upload/pdf, api/logo, uploads/*).
 *
 * Kept OUT of the route modules so those files only export HTTP handlers
 * (Next.js type-checks every export inside a route module), and out of
 * @/lib/uploads so that dependency-free helper library remains pure and
 * trivially unit-testable.
 */

/**
 * Extract the uploaded "file" field from a multipart request.
 * Returns a 400 response when no file was sent.
 */
export async function fileFromFormData(
  request: NextRequest
): Promise<{ file: File; error: null } | { file: null; error: NextResponse }> {
  const formData = await request.formData().catch(() => null);
  const rawFile = formData?.get("file");

  // Duck-type check: Node (undici) and jsdom expose different File classes,
  // so `instanceof File` is unreliable across environments.
  const file = rawFile && typeof rawFile !== "string" ? rawFile : null;
  if (!file || typeof file.name !== "string") {
    return {
      file: null,
      error: NextResponse.json({ error: "No file uploaded" }, { status: 400 }),
    };
  }
  return { file, error: null };
}

/**
 * Run an allow-list validation (assertAllowedImage / assertAllowedDocument)
 * and translate a rejection into a 400 response. Returns null when valid.
 */
export function assertFileAllowed(
  assert: (name: string, size: number) => void,
  file: File
): NextResponse | null {
  try {
    assert(file.name, file.size);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
  return null;
}

/**
 * Persist an uploaded file under <UPLOAD_DIR>/<segments...> as
 * `<timestamp>-<sanitized-name>` and return its `/uploads/...` relative path.
 */
export async function storeUpload(
  file: File,
  segments: string[]
): Promise<string> {
  const fileDir = path.join(uploadsDir(), ...segments);
  await fs.mkdir(fileDir, { recursive: true });

  const uniqueName = `${Date.now()}-${sanitizeFilename(file.name)}`;
  const relativePath = `/uploads/${segments.join("/")}/${uniqueName}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(fileDir, uniqueName), bytes);

  return relativePath;
}

/**
 * Delete an uploaded file by its `/uploads/...` path.
 *
 * `reservedPrefix` (e.g. "/uploads/reports/") constrains which uploads a caller
 * may delete; the resolved path is additionally checked by `resolveUploadPath`
 * so `..` segments cannot escape UPLOAD_DIR. Idempotent: a missing file is
 * treated as success. Returns a 400 response on invalid input, null on success.
 */
export async function deleteUpload(
  uploadPath: string,
  reservedPrefix: string
): Promise<NextResponse | null> {
  if (!uploadPath || !uploadPath.startsWith(reservedPrefix)) {
    return NextResponse.json(
      { error: `path must be a "${reservedPrefix}..." path` },
      { status: 400 }
    );
  }

  const relative = uploadPath.replace(/^\/uploads\//, "");
  const filePath = resolveUploadPath(relative);
  if (!filePath) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  await fs.unlink(filePath).catch((error: NodeJS.ErrnoException) => {
    // ENOENT = already deleted → idempotent success.
    if (error.code !== "ENOENT") {
      throw error;
    }
  });

  return null;
}