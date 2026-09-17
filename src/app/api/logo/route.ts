import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { assertAllowedImage } from "@/lib/uploads";
import { writeLogo } from "@/lib/logo";
import { assertFileAllowed, fileFromFormData } from "@/lib/upload-http";

/**
 * POST /api/logo — replace the site logo (deliverable 2B.7).
 *
 * Writes the uploaded logo via @/lib/logo#writeLogo: public/logo.svg in dev,
 * <UPLOAD_DIR>/logo.svg in production. The Logo component keeps loading
 * /logo.svg; file-path logic lives in the lib so this route only exports
 * HTTP handlers.
 */
export async function POST(request: NextRequest) {
  const { error } = await requireSession();
  if (error) {
    return error;
  }

  const { file, error: fileError } = await fileFromFormData(request);
  if (fileError) {
    return fileError;
  }

  const validationError = assertFileAllowed(assertAllowedImage, file);
  if (validationError) {
    return validationError;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeLogo(bytes);

  return NextResponse.json({ success: true, path: "/logo.svg" });
}
