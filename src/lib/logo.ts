import fs from "fs/promises";
import path from "path";
import { uploadsDir } from "./uploads";

/**
 * Logo file-path + write helpers. Kept OUT of the /api/logo route module so the
 * route file only exports HTTP handlers (Next.js type-checks every export in a
 * route module and rejects arbitrary functions like `logoFilePath`).
 *
 * Logos are written to public/logo.svg in dev (so /logo.svg resolves) and to
 * <UPLOAD_DIR>/logo.svg in production (so it survives rebuilds / restarts).
 * Tests override LOGO_FILE_PATH to a temp path so the real logo is untouched.
 */
export const LOGO_FILE_ENV = "LOGO_FILE_PATH";

export function logoFilePath(): string {
  const override = process.env.LOGO_FILE_PATH;
  if (override) {
    return override;
  }
  if (process.env.NODE_ENV === "production") {
    return path.join(uploadsDir(), "logo.svg");
  }
  return path.join(process.cwd(), "public", "logo.svg");
}

export async function writeLogo(buffer: Buffer): Promise<void> {
  const target = logoFilePath();
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, buffer);
}
