import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";
import { assertAllowedImage, uploadsDir } from "@/lib/uploads";

/**
 * POST /api/logo — replace the site logo.
 *
 * Writes to <UPLOAD_DIR>/logo.svg by default. The Logo component loads
 * /logo.svg; in the deployed standalone build, public/logo.svg was baked at
 * build time, so we write the uploaded logo into the uploads dir and serve it
 * through the /uploads route. To keep it simple and match <Logo/>, we write
 * `public/logo.svg` in dev and fall back to uploads in production.
 *
 * In tests, set LOGO_FILE_PATH to a temp path so the real logo is untouched.
 */
export const LOGO_FILE_ENV = "LOGO_FILE_PATH";

export function logoFilePath(): string {
  const override = process.env.LOGO_FILE_PATH;
  if (override) {
    return override;
  }
  if (process.env.NODE_ENV === "production") {
    // Write into uploads so it survives rebuilds / container restarts.
    return path.join(uploadsDir(), "logo.svg");
  }
  // Dev: serve directly from public so /logo.svg resolves.
  return path.join(process.cwd(), "public", "logo.svg");
}

async function writeLogo(buffer: Buffer): Promise<void> {
  const target = logoFilePath();
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, buffer);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const rawFile = formData?.get("file");
  const file = rawFile && typeof rawFile !== "string" ? rawFile : null;
  if (!file || typeof file.name !== "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    assertAllowedImage(file.name, file.size);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeLogo(bytes);

  return NextResponse.json({ success: true, path: "/logo.svg" });
}

export { writeLogo };