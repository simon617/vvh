// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { POST, DELETE } from "./route";

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

function buildDelete(pathParam?: string) {
  const query = pathParam ? `?path=${encodeURIComponent(pathParam)}` : "";
  return new NextRequest(`http://localhost/api/upload/pdf${query}`, {
    method: "DELETE",
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

describe("DELETE /api/upload/pdf", () => {
  const originalDir = process.env.UPLOAD_DIR;

  beforeEach(() => {
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
    expect(
      (await DELETE(buildDelete("/uploads/reports/en/a.pdf"))).status
    ).toBe(401);
  });

  it("returns 400 for a missing or non-/uploads/ path", async () => {
    expect((await DELETE(buildDelete())).status).toBe(400);
    expect((await DELETE(buildDelete("../secret.txt"))).status).toBe(400);
  });

  it("deletes the PDF file on disk and returns ok", async () => {
    // Pre-seed a file the same way POST would have created it.
    const target = path.resolve(TEST_DIR, "reports/en/1789-a.pdf");
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, "%PDF-1.4");

    const res = await DELETE(
      buildDelete("/uploads/reports/en/1789-a.pdf")
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);

    await expect(fs.readFile(target)).rejects.toThrow();
  });

  it("rejects a path-traversal attempt that escapes the uploads root", async () => {
    const res = await DELETE(
      buildDelete("/uploads/../../prisma/data/vvh.db")
    );
    expect(res.status).toBe(400);
  });

  it("is idempotent when the file has already been deleted", async () => {
    const res = await DELETE(
      buildDelete("/uploads/reports/en/nope.pdf")
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});