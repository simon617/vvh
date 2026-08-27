import { afterEach, describe, expect, it } from "vitest";
import path from "path";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { resolveUploadPath } from "@/lib/uploads";

describe("resolveUploadPath (uploads serving guard)", () => {
  const originalUploadDir = process.env.UPLOAD_DIR;

  afterEach(() => {
    if (originalUploadDir === undefined) {
      delete process.env.UPLOAD_DIR;
    } else {
      process.env.UPLOAD_DIR = originalUploadDir;
    }
  });

  it("resolves a relative image path inside the uploads directory", () => {
    process.env.UPLOAD_DIR = "./uploads";
    const result = resolveUploadPath("images/hero.jpg");
    expect(result).toContain("uploads");
    expect(result).toContain("images");
    expect(result!.endsWith(path.join("images", "hero.jpg"))).toBe(true);
  });

  it("throws/rejects path traversal escaping the uploads directory", () => {
    process.env.UPLOAD_DIR = "./uploads";
    expect(resolveUploadPath("../../etc/passwd")).toBeNull();
    expect(resolveUploadPath("..\\..\\windows\\win.ini")).toBeNull();
  });

  it("allows only paths that stay within UPLOAD_DIR", () => {
    process.env.UPLOAD_DIR = "./uploads";
    // An absolute-looking path should not resolve outside UPLOAD_DIR either
    expect(resolveUploadPath("images/../images/hero.jpg")).toContain("uploads");
  });
});

describe("GET /uploads/[...path]", () => {
  const TEST_DIR = "./uploads-test";

  afterEach(async () => {
    const fs = await import("fs/promises");
    await fs.rm(path.resolve(TEST_DIR), { recursive: true, force: true });
  });

  it("serves a file that exists under UPLOAD_DIR with correct content-type", async () => {
    process.env.UPLOAD_DIR = TEST_DIR;
    const fs = await import("fs/promises");

    const imagesDir = path.resolve(TEST_DIR, "images");
    await fs.mkdir(imagesDir, { recursive: true });
    // Minimal 1x1 PNG bytes
    await fs.writeFile(
      path.join(imagesDir, "test.png"),
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );

    const req = new NextRequest("http://localhost/uploads/images/test.png");
    const res = await GET(req, { params: { path: ["images", "test.png"] } });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    const body = Buffer.from(await res.arrayBuffer());
    expect(body.length).toBe(8);
  });

  it("serves a PDF file with the application/pdf content-type", async () => {
    process.env.UPLOAD_DIR = TEST_DIR;
    const fs = await import("fs/promises");

    const reportsDir = path.resolve(TEST_DIR, "reports", "en");
    await fs.mkdir(reportsDir, { recursive: true });
    await fs.writeFile(
      path.join(reportsDir, "RoleAndFunction.pdf"),
      Buffer.from("%PDF-1.4 test")
    );

    const req = new NextRequest(
      "http://localhost/uploads/reports/en/RoleAndFunction.pdf"
    );
    const res = await GET(req, {
      params: { path: ["reports", "en", "RoleAndFunction.pdf"] },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
  });

  it("returns 404 when the file does not exist", async () => {
    process.env.UPLOAD_DIR = TEST_DIR;
    const req = new NextRequest("http://localhost/uploads/images/missing.png");
    const res = await GET(req, { params: { path: ["images", "missing.png"] } });
    expect(res.status).toBe(404);
  });

  it("returns 400 for a path that escapes UPLOAD_DIR", async () => {
    process.env.UPLOAD_DIR = TEST_DIR;
    const req = new NextRequest("http://localhost/uploads/%2e%2e/x");
    const res = await GET(req, { params: { path: ["..", "secret"] } });
    expect(res.status).toBe(400);
  });
});