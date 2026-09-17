import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { assertAllowedImage, getUploadUrl } from "@/lib/uploads";
import {
  assertFileAllowed,
  fileFromFormData,
  storeUpload,
} from "@/lib/upload-http";

/**
 * POST /api/upload/image — store a header image and return its URL.
 * Guards itself (middleware does not run for /api/*), validates type+size
 * server-side, writes under <UPLOAD_DIR>/images/ and stores/serves the
 * relative path.
 */
const IMAGES_SUBDIR = "images";

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

  const relativePath = await storeUpload(file, [IMAGES_SUBDIR]);
  return NextResponse.json(
    { path: relativePath, url: getUploadUrl(relativePath) },
    { status: 200 }
  );
}