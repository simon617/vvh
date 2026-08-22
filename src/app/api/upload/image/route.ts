import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";
import {
  assertAllowedImage,
  getUploadUrl,
  sanitizeFilename,
  uploadsDir,
} from "@/lib/uploads";

/**
 * POST /api/upload/image — store a header image and return its URL.
 * Guards itself (middleware does not run for /api/*), validates type+size
 * server-side, writes under <UPLOAD_DIR>/images/ and stores/serves the
 * relative path.
 */
const IMAGES_SUBDIR = "images";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const rawFile = formData?.get("file");

  // Duck-type check: Node (undici) and jsdom expose different File classes,
  // so `instanceof File` is unreliable across environments.
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

  const imagesDir = path.join(uploadsDir(), IMAGES_SUBDIR);
  await fs.mkdir(imagesDir, { recursive: true });

  const uniqueName = `${Date.now()}-${sanitizeFilename(file.name)}`;
  const relativePath = `/uploads/${IMAGES_SUBDIR}/${uniqueName}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(imagesDir, uniqueName), bytes);

  return NextResponse.json(
    { path: relativePath, url: getUploadUrl(relativePath) },
    { status: 200 }
  );
}