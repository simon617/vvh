import path from "path";

/**
 * Pure helpers for the CMS image upload feature (header images, logo).
 * Kept dependency-free (no next/* imports) so they are easy to unit-test.
 */

export const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".svg",
  ".webp",
] as const;

export const DEFAULT_MAX_FILE_SIZE = 5242880; // 5 MB

/** Allowed report/document file extensions (Phase 2B report editor). */
export const ALLOWED_DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
] as const;

/** Max document upload size in bytes (default 50 MB, configurable via MAX_DOC_SIZE). */
export const DEFAULT_MAX_DOC_SIZE = 52428800;

export function maxDocSize(): number {
  const v = Number(process.env.MAX_DOC_SIZE);
  return Number.isFinite(v) && v > 0 ? v : DEFAULT_MAX_DOC_SIZE;
}

/** Whether a file name has an allowed document extension (case-insensitive). */
export function isAllowedDocument(name: string): boolean {
  const ext = path.extname(name).toLowerCase();
  return (ALLOWED_DOCUMENT_EXTENSIONS as readonly string[]).includes(ext);
}

/** Validate document type and size; throws with a user-facing message. */
export function assertAllowedDocument(name: string, size: number): void {
  if (!isAllowedDocument(name)) {
    throw new Error(
      "Only document files (pdf, doc, docx, xls, xlsx) are allowed."
    );
  }
  const limit = maxDocSize();
  if (size > limit) {
    throw new Error(`File size must be ${limit} bytes or less.`);
  }
}

/** Max upload size in bytes, from MAX_FILE_SIZE env (default 5 MB). */
export function maxFileSize(): number {
  const v = Number(process.env.MAX_FILE_SIZE);
  return Number.isFinite(v) && v > 0 ? v : DEFAULT_MAX_FILE_SIZE;
}

/** Absolute path of the uploads root (UPLOAD_DIR env, default ./uploads). */
export function uploadsDir(): string {
  return process.env.UPLOAD_DIR || "./uploads";
}

/**
 * Resolve a relative path against UPLOAD_DIR, guarding against path traversal
 * (`..` segments escaping the uploads root). Returns null when unsafe.
 * Used by the /uploads serving route.
 */
export function resolveUploadPath(relativePath: string): string | null {
  const base = path.resolve(uploadsDir());
  const target = path.resolve(base, relativePath);

  // Guard against path traversal (.. segments escaping UPLOAD_DIR).
  if (target !== base && !target.startsWith(base + path.sep)) {
    return null;
  }
  return target;
}

/** Whether a file name has an allowed image extension (case-insensitive). */
export function isAllowedImage(name: string): boolean {
  const ext = path.extname(name).toLowerCase();
  return (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(ext);
}

/** Validate image type and size; throws with a user-facing message. */
export function assertAllowedImage(name: string, size: number): void {
  if (!isAllowedImage(name)) {
    throw new Error("Only image files (jpg, png, svg, webp) are allowed.");
  }
  const limit = maxFileSize();
  if (size > limit) {
    throw new Error(`File size must be ${limit} bytes or less.`);
  }
}

/** Strip any directory/traversal and unsafe characters from a file name. */
export function sanitizeFilename(name: string): string {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Build the display URL for an uploaded file. The DB stores the RELATIVE path
 * (e.g. /uploads/images/hero.jpg); the absolute URL is constructed here from
 * NEXT_PUBLIC_SITE_URL at render time.
 */
export function getUploadUrl(relativePath: string): string {
  const normalized = relativePath.startsWith("/")
    ? relativePath
    : `/${relativePath}`;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  return siteUrl ? `${siteUrl}${normalized}` : normalized;
}