// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  assertFileAllowed,
  deleteUpload,
  fileFromFormData,
  storeUpload,
} from "@/lib/upload-http";

const TEST_UPLOAD_DIR = "./uploads-lib-test";

function buildRequest(file?: File | string, fieldName = "file") {
  const form = new FormData();
  if (file !== undefined) {
    form.append(fieldName, file);
  }
  return new NextRequest("http://localhost/api/upload/test", {
    method: "POST",
    body: form,
  });
}

describe("fileFromFormData", () => {
  it("returns the file from the form data", async () => {
    const sent = new File(["data"], "a.png", { type: "image/png" });
    const { file, error } = await fileFromFormData(buildRequest(sent));
    expect(error).toBeNull();
    expect(file?.name).toBe("a.png");
  });

  it("returns a 400 response when no file is present", async () => {
    const { file, error } = await fileFromFormData(buildRequest());
    expect(file).toBeNull();
    expect(error?.status).toBe(400);
    const body = error && (await error.json());
    expect(body).toEqual({ error: "No file uploaded" });
  });

  it("returns a 400 response when the field is a plain string", async () => {
    const { error } = await fileFromFormData(buildRequest("plain text"));
    expect(error?.status).toBe(400);
  });
});

describe("assertFileAllowed", () => {
  it("returns null when the assertion passes", () => {
    const file = new File(["x"], "ok.png", { type: "image/png" });
    expect(assertFileAllowed(() => {}, file)).toBeNull();
  });

  it("returns a 400 response with the assertion message on rejection", async () => {
    const file = new File(["x"], "bad.exe", { type: "application/x-msdownload" });
    const res = assertFileAllowed(() => {
      throw new Error("Only image files (jpg, png, svg, webp) are allowed.");
    }, file);
    expect(res?.status).toBe(400);
    const body = res && (await res.json());
    expect(body).toEqual({
      error: "Only image files (jpg, png, svg, webp) are allowed.",
    });
  });
});

describe("storeUpload", () => {
  const originalDir = process.env.UPLOAD_DIR;

  afterEach(async () => {
    await fs.rm(path.resolve(TEST_UPLOAD_DIR), { recursive: true, force: true });
    if (originalDir === undefined) {
      delete process.env.UPLOAD_DIR;
    } else {
      process.env.UPLOAD_DIR = originalDir;
    }
  });

  it("writes the file under UPLOAD_DIR and returns its /uploads path", async () => {
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    const file = new File([bytes], "hero-image.png", { type: "image/png" });

    const relativePath = await storeUpload(file, ["images"]);
    expect(relativePath).toMatch(/^\/uploads\/images\/\d+-hero-image\.png$/);

    const savedRelative = relativePath.replace("/uploads/", "");
    const abs = path.join(path.resolve(TEST_UPLOAD_DIR), savedRelative);
    const written = await fs.readFile(abs);
    expect(Buffer.compare(written, bytes)).toBe(0);
  });

  it("supports nested segments (e.g. reports/<locale>)", async () => {
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
    const file = new File(["%PDF-1.4"], "report.pdf", {
      type: "application/pdf",
    });

    const relativePath = await storeUpload(file, ["reports", "en"]);
    expect(relativePath).toMatch(/^\/uploads\/reports\/en\/\d+-report\.pdf$/);
  });
});

describe("deleteUpload", () => {
  const originalDir = process.env.UPLOAD_DIR;

  afterEach(async () => {
    await fs.rm(path.resolve(TEST_UPLOAD_DIR), { recursive: true, force: true });
    if (originalDir === undefined) {
      delete process.env.UPLOAD_DIR;
    } else {
      process.env.UPLOAD_DIR = originalDir;
    }
  });

  it("returns 400 for a path outside the reserved prefix", async () => {
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
    const res = await deleteUpload(
      "/uploads/images/a.png",
      "/uploads/reports/"
    );
    expect(res?.status).toBe(400);
  });

  it("returns 400 for a missing path", async () => {
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
    expect((await deleteUpload("", "/uploads/reports/"))?.status).toBe(400);
  });

  it("rejects a path-traversal attempt that escapes the uploads root", async () => {
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
    const res = await deleteUpload(
      "/uploads/../../prisma/data/vvh.db",
      "/uploads/reports/"
    );
    expect(res?.status).toBe(400);
  });

  it("unlinks the file and returns null on success", async () => {
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
    const target = path.resolve(TEST_UPLOAD_DIR, "reports/en/1789-a.pdf");
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, "%PDF-1.4");

    const res = await deleteUpload(
      "/uploads/reports/en/1789-a.pdf",
      "/uploads/reports/"
    );
    expect(res).toBeNull();
    await expect(fs.readFile(target)).rejects.toThrow();
  });

  it("is idempotent when the file is already gone", async () => {
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
    expect(
      await deleteUpload("/uploads/reports/en/nope.pdf", "/uploads/reports/")
    ).toBeNull();
  });
});