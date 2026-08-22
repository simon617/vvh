import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ALLOWED_IMAGE_EXTENSIONS,
  assertAllowedImage,
  getUploadUrl,
  isAllowedImage,
  maxFileSize,
  sanitizeFilename,
  uploadsDir,
} from "@/lib/uploads";

function snapshotEnv() {
  const prevUpload = process.env.UPLOAD_DIR;
  const prevSize = process.env.MAX_FILE_SIZE;
  const prevSite = process.env.NEXT_PUBLIC_SITE_URL;
  return () => {
    if (prevUpload === undefined) delete process.env.UPLOAD_DIR;
    else process.env.UPLOAD_DIR = prevUpload;
    if (prevSize === undefined) delete process.env.MAX_FILE_SIZE;
    else process.env.MAX_FILE_SIZE = prevSize;
    if (prevSite === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = prevSite;
  };
}

describe("uploads lib", () => {
  let restoreEnv: () => void;

  beforeEach(() => {
    restoreEnv = snapshotEnv();
  });

  afterEach(() => {
    restoreEnv();
  });

  it("declares the allowed image extensions", () => {
    expect(ALLOWED_IMAGE_EXTENSIONS).toEqual([
      ".jpg",
      ".jpeg",
      ".png",
      ".svg",
      ".webp",
    ]);
  });

  describe("isAllowedImage / assertAllowedImage", () => {
    it("accepts supported image types case-insensitively", () => {
      expect(isAllowedImage("hero.JPG")).toBe(true);
      expect(isAllowedImage("hero.PNG")).toBe(true);
      expect(isAllowedImage("logo.svg")).toBe(true);
      expect(isAllowedImage("hero.webp")).toBe(true);
      expect(isAllowedImage("hero.jpeg")).toBe(true);
    });

    it("rejects non-image file types", () => {
      expect(isAllowedImage("evil.exe")).toBe(false);
      expect(isAllowedImage("page.html")).toBe(false);
      expect(isAllowedImage("script.js")).toBe(false);
      expect(isAllowedImage("noext")).toBe(false);
      expect(() => assertAllowedImage("evil.exe", 100)).toThrow(/image/i);
    });

    it("rejects files over MAX_FILE_SIZE (default 5MB)", () => {
      delete process.env.MAX_FILE_SIZE;
      expect(maxFileSize()).toBe(5242880);
      expect(() => assertAllowedImage("big.png", 5242881)).toThrow(
        /5242880 bytes/
      );
    });

    it("honours a MAX_FILE_SIZE override", () => {
      process.env.MAX_FILE_SIZE = "1024";
      expect(maxFileSize()).toBe(1024);
      expect(() => assertAllowedImage("big.png", 2048)).toThrow(/1024 bytes/);
      expect(() => assertAllowedImage("ok.png", 1024)).not.toThrow();
    });
  });

  describe("sanitizeFilename", () => {
    it("strips directory path traversal, keeping only the base name", () => {
      expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
      expect(sanitizeFilename("..\\..\\windows\\win.ini")).toBe("win.ini");
    });

    it("replaces unsafe characters with underscores", () => {
      expect(sanitizeFilename("my image (1).png")).toBe("my_image__1_.png");
    });

    it("preserves safe characters and the extension", () => {
      expect(sanitizeFilename("hero-pic_01.PNG")).toBe("hero-pic_01.PNG");
    });
  });

  describe("getUploadUrl", () => {
    it("returns an absolute URL when NEXT_PUBLIC_SITE_URL is set", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://www.visionvalues.com.hk";
      expect(getUploadUrl("/uploads/images/hero.jpg")).toBe(
        "https://www.visionvalues.com.hk/uploads/images/hero.jpg"
      );
      // relative input is normalised to a leading slash
      expect(getUploadUrl("uploads/images/hero.jpg")).toBe(
        "https://www.visionvalues.com.hk/uploads/images/hero.jpg"
      );
    });

    it("returns the relative path when the site URL is unset", () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      expect(getUploadUrl("/uploads/images/hero.jpg")).toBe(
        "/uploads/images/hero.jpg"
      );
    });
  });

  it("uploadsDir honours UPLOAD_DIR and falls back to ./uploads", () => {
    delete process.env.UPLOAD_DIR;
    expect(uploadsDir()).toBe("./uploads");
    process.env.UPLOAD_DIR = "./uploads-test";
    expect(uploadsDir()).toBe("./uploads-test");
  });
});