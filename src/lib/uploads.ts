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

/** Max upload size in bytes, from MAX_FILE_SIZE env (default 5 MB). */
export function maxFileSize(): number {
  const v = Number(process.env.MAX_FILE_SIZE);
  return Number.isFinite(v) && v > 0 ? v : DEFAULT_MAX_FILE_SIZE;
}

/** Absolute path of the uploads root (UPLOAD_DIR env, default ./uploads). */
export function uploadsDir(): string {
  return process.env.UPLOAD_DIR || "./uploads";
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