import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { assertAllowedImage } from "@/lib/uploads";
import { writeLogo } from "@/lib/logo";

/**
 * POST /api/logo — replace the site logo (deliverable 2B.7).
 *
 * Writes the uploaded logo via @/lib/logo#writeLogo: public/logo.svg in dev,
 * <UPLOAD_DIR>/logo.svg in production. The Logo component keeps loading
 * /logo.svg; file-path logic lives in the lib so this route only exports
 * HTTP handlers.
 */
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
