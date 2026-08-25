// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { POST, logoFilePath } from "./route";

const { mockGetSession } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getSession: mockGetSession }));

const ADMIN_SESSION = { userId: 1, username: "admin", role: "admin" };
const TEST_LOGO = "./test-logo/logo.svg";

function buildUpload(file?: File) {
  const form = new FormData();
  if (file) {
    form.append("file", file);
  }
  return new NextRequest("http://localhost/api/logo", {
    method: "POST",
    body: form,
  });
}

describe("POST /api/logo", () => {
  beforeEach(async () => {
    mockGetSession.mockReset();
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    process.env.LOGO_FILE_PATH = path.resolve(TEST_LOGO);
    await fs.mkdir(path.dirname(path.resolve(TEST_LOGO)), { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(path.dirname(path.resolve(TEST_LOGO)), {
      recursive: true,
      force: true,
    });
    delete process.env.LOGO_FILE_PATH;
    vi.unstubAllEnvs();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    expect((await POST(buildUpload())).status).toBe(401);
  });

  it("rejects a non-image file", async () => {
    const exe = new File(["MZ"], "evil.exe", { type: "application/x-msdownload" });
    const res = await POST(buildUpload(exe));
    expect(res.status).toBe(400);
  });

  it("writes an svg logo to the logo file path and returns /logo.svg", async () => {
    const svg = new File(["<svg/>"], "logo.svg", { type: "image/svg+xml" });
    const res = await POST(buildUpload(svg));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.path).toBe("/logo.svg");

    const written = await fs.readFile(path.resolve(TEST_LOGO), "utf-8");
    expect(written).toBe("<svg/>");
  });

  it("logoFilePath defaults to public/logo.svg when not in production", () => {
    vi.stubEnv("NODE_ENV", "test");
    delete process.env.LOGO_FILE_PATH;
    const p = logoFilePath();
    expect(p).toContain(path.join("public", "logo.svg"));
  });
});