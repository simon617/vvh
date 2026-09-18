import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const { mockPageContent } = vi.hoisted(() => ({
  mockPageContent: { findMany: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { pageContent: mockPageContent },
}));

const SITE_URL = "https://www.visionvalues.com.hk";

describe("GET /sitemap.xml", () => {
  afterEach(() => {
    mockPageContent.findMany.mockReset();
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("returns an XML <urlset> listing published pages with absolute URLs", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = SITE_URL;
    mockPageContent.findMany.mockResolvedValue([
      { locale: "en", page: { slug: "home" } },
      { locale: "zh", page: { slug: "home" } },
      { locale: "en", page: { slug: "contact" } },
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/xml");

    const body = await res.text();
    expect(body).toContain(`<loc>${SITE_URL}/en/</loc>`);
    expect(body).toContain(`<loc>${SITE_URL}/zh/</loc>`);
    expect(body).toContain(`<loc>${SITE_URL}/en/contact</loc>`);
    // announcements has no DB row but a public page → emitted explicitly.
    expect(body).toContain(`<loc>${SITE_URL}/zh/announcements</loc>`);
  });

  it("never lists unpublished pages", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = SITE_URL;
    // Only EN home published → no zh rows and no unpublished slugs anywhere.
    mockPageContent.findMany.mockResolvedValue([
      { locale: "en", page: { slug: "home" } },
    ]);
    const res = await GET();
    const body = await res.text();
    expect(body).not.toContain("/zh/esg-reports");
    expect(body).not.toContain("/en/esg-reports");
    // Static announcements is still present for both locales.
    expect(body).toContain(`<loc>${SITE_URL}/zh/announcements</loc>`);
  });
});