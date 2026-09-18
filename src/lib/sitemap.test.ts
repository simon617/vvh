import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildSitemapXml,
  escapeXml,
  getSitemapEntries,
  urlPathFor,
} from "./sitemap";

const { mockPageContent } = vi.hoisted(() => ({
  mockPageContent: { findMany: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { pageContent: mockPageContent },
}));

const SITE_URL = "https://www.visionvalues.com.hk";

describe("sitemap lib (deliverable 4.4 / WEB-10)", () => {
  afterEach(() => {
    mockPageContent.findMany.mockReset();
  });

  describe("urlPathFor", () => {
    it("maps home to the locale root", () => {
      expect(urlPathFor({ slug: "home", locale: "en" })).toBe("/en/");
      expect(urlPathFor({ slug: "home", locale: "zh" })).toBe("/zh/");
    });

    it("prefixes inner pages with the locale", () => {
      expect(urlPathFor({ slug: "contact", locale: "en" })).toBe("/en/contact");
      expect(urlPathFor({ slug: "announcements", locale: "zh" })).toBe(
        "/zh/announcements"
      );
    });
  });

  describe("getSitemapEntries", () => {
    it("returns published rows plus the static announcements page for both locales", async () => {
      mockPageContent.findMany.mockResolvedValue([
        { locale: "en", page: { slug: "home" } },
        { locale: "zh", page: { slug: "home" } },
        { locale: "en", page: { slug: "contact" } },
      ]);
      const entries = await getSitemapEntries();
      const keys = entries.map((e) => `${e.slug}:${e.locale}`);
      expect(keys).toContain("home:en");
      expect(keys).toContain("home:zh");
      expect(keys).toContain("contact:en");
      // announcements has no DB row (TD-30 Option A) but a public page.
      expect(keys).toContain("announcements:en");
      expect(keys).toContain("announcements:zh");
    });

    it("queries only published rows for visible pages", async () => {
      mockPageContent.findMany.mockResolvedValue([]);
      await getSitemapEntries();
      expect(mockPageContent.findMany).toHaveBeenCalledWith({
        where: { isPublished: true, page: { isVisible: true } },
        select: { locale: true, page: { select: { slug: true } } },
      });
    });
  });

  describe("buildSitemapXml", () => {
    it("emits absolute URLs and de-duplicates repeated entries", () => {
      const xml = buildSitemapXml(
        [
          { slug: "home", locale: "en" },
          { slug: "home", locale: "en" },
          { slug: "contact", locale: "zh" },
        ],
        SITE_URL
      );
      expect(xml).toContain("<urlset");
      expect(xml).toContain(`<loc>${SITE_URL}/en/</loc>`);
      expect(xml).toContain(`<loc>${SITE_URL}/zh/contact</loc>`);
      expect((xml.match(/<url>|<url /g) ?? []).length).toBe(2);
    });

    it("sorts entries for stable output", () => {
      const xml = buildSitemapXml(
        [
          { slug: "contact", locale: "en" },
          { slug: "home", locale: "en" },
        ],
        SITE_URL
      );
      const indexEn = xml.indexOf(">https://www.visionvalues.com.hk/en/<");
      const indexContact = xml.indexOf("https://www.visionvalues.com.hk/en/contact");
      expect(indexEn).toBeGreaterThan(-1);
      expect(indexContact).toBeGreaterThan(-1);
      expect(indexEn).toBeLessThan(indexContact);
    });

    it("escapes XML special characters in URLs", () => {
      expect(escapeXml(`<a & 'b'>`)).toBe("&lt;a &amp; &apos;b&apos;&gt;");
    });
  });
});