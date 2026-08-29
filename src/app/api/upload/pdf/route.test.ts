// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { POST } from "./route";

const { mockGetSession } = vi.hoisted(() => ({ mockGetSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getSession: mockGetSession }));

const ADMIN_SESSION = { userId: 1, username: "admin", role: "admin" };
const TEST_DIR = "./uploads-doc-test";

function buildUpload(file?: File, locale = "en") {
  const form = new FormData();
  if (file) form.append("file", file);
  return new NextRequest(`http://localhost/api/upload/pdf?locale=${locale}`, {
    method: "POST",
    body: form,
  });
}

describe("POST /api/upload/pdf", () => {
  const originalDir = process.env.UPLOAD_DIR;

  beforeEach(async () => {
    mockGetSession.mockReset().mockResolvedValue(ADMIN_SESSION);
    process.env.UPLOAD_DIR = TEST_DIR;
  });

  afterEach(async () => {
    await fs.rm(path.resolve(TEST_DIR), { recursive: true, force: true });
    if (originalDir === undefined) delete process.env.UPLOAD_DIR;
    else process.env.UPLOAD_DIR = originalDir;
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    expect((await POST(buildUpload())).status).toBe(401);
  });

  it("rejects an invalid locale", async () => {
    const res = await POST(buildUpload(undefined, "fr"));
    expect(res.status).toBe(400);
  });

  it("rejects a non-document file", async () => {
    const exe = new File(["MZ"], "evil.exe");
    const res = await POST(buildUpload(exe));
    expect(res.status).toBe(400);
  });

  it("writes a pdf under /uploads/reports/<locale> and returns its relative path", async () => {
    const pdf = new File(["%PDF-1.4"], "report.pdf", {
      type: "application/pdf",
    });
    const res = await POST(buildUpload(pdf));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.path).toMatch(/^\/uploads\/reports\/en\/\d+-report\.pdf$/);

    // The file physically exists under the uploads reports dir.
    const rel = body.path.replace("/uploads/", "");
    const absolute = path.resolve(path.join(TEST_DIR, rel));
    const written = await fs.readFile(absolute, "utf-8");
    expect(written).toBe("%PDF-1.4");
  });
});