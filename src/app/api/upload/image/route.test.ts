// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { POST } from "./route";

const { mockGetSession } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getSession: mockGetSession,
  requireSession: async () => {
    const session = await mockGetSession();
    return session
      ? { session, error: null }
      : {
          session: null,
          error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
  },
}));

const ADMIN_SESSION = { userId: 1, username: "admin", role: "admin" };
const TEST_UPLOAD_DIR = "./uploads-test-api";

function buildUpload(file: File | undefined, fieldName = "file") {
  const form = new FormData();
  if (file) {
    form.append(fieldName, file);
  }
  return new NextRequest("http://localhost/api/upload/image", {
    method: "POST",
    body: form,
  });
}

describe("POST /api/upload/image", () => {
  beforeEach(async () => {
    mockGetSession.mockReset();
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.visionvalues.com.hk";
    await fs.mkdir(path.resolve(TEST_UPLOAD_DIR), { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(path.resolve(TEST_UPLOAD_DIR), { recursive: true, force: true });
    delete process.env.UPLOAD_DIR;
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await POST(buildUpload(undefined));
    expect(res.status).toBe(401);
  });

  it("returns 400 when no file is provided", async () => {
    const res = await POST(buildUpload(undefined));
    expect(res.status).toBe(400);
  });

  it("rejects a disallowed file type", async () => {
    const exe = new File(["MZ"], "evil.exe", { type: "application/x-msdownload" });
    const res = await POST(buildUpload(exe));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/image/i);
  });

  it("rejects a file over MAX_FILE_SIZE", async () => {
    process.env.MAX_FILE_SIZE = "8";
    const big = new File([Buffer.alloc(16)], "big.png", { type: "image/png" });
    const res = await POST(buildUpload(big));
    expect(res.status).toBe(400);
  });

  it("writes the file to uploads/images and returns a URL", async () => {
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    const png = new File([bytes], "hero-image.png", { type: "image/png" });
    const res = await POST(buildUpload(png));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.path).toMatch(/^\/uploads\/images\/\d+-hero-image\.png$/);
    expect(body.url).toBe(
      `https://www.visionvalues.com.hk${body.path}`
    );

    // The file must physically exist under the images subdir.
    const savedRelative = body.path.replace("/uploads/", "");
    const saved = path.join(path.resolve(TEST_UPLOAD_DIR), savedRelative);
    const written = await fs.readFile(saved);
    expect(Buffer.compare(written, bytes)).toBe(0);
  });
});