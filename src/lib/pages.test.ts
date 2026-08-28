import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPageData } from "./pages";

// The public read seam is pages.ts; the Prisma/DB boundary lives in
// page-content.ts, which we stub here (database = system boundary).
const { mockGetPageContent } = vi.hoisted(() => ({
  mockGetPageContent: vi.fn(),
}));

vi.mock("@/lib/page-content", () => ({
  getPageContent: mockGetPageContent,
}));

function dbRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    pageId: 1,
    locale: "en",
    isPublished: true,
    title: "DB Title",
    metaTitle: "DB Meta Title",
    metaDescription: "DB Meta Description",
    heroImage: "/uploads/images/hero.jpg",
    contentHtml: "<p>DB content</p>",
    breadcrumbLabel: "DB Breadcrumb",
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

describe("pages (DB-aware getPageData)", () => {
  beforeEach(() => {
    mockGetPageContent.mockReset();
  });

  it("falls back to the placeholder when no DB content row exists yet", async () => {
    mockGetPageContent.mockResolvedValue(null);
    const data = await getPageData("financial-reports", "en");
    expect(data?.title).toBe("Financial Reports");
    expect(data?.contentHtml).toContain("Annual Report");
  });

  it("returns localized placeholder fallback for zh", async () => {
    mockGetPageContent.mockResolvedValue(null);
    const data = await getPageData("financial-reports", "zh");
    expect(data?.title).toBe("財務報告");
    expect(data?.contentHtml).toContain("年報");
  });

  it("returns DB content for a known slug + published locale", async () => {
    mockGetPageContent.mockResolvedValue(dbRow());
    const data = await getPageData("home", "en");
    expect(data?.title).toBe("DB Title");
    expect(data?.contentHtml).toBe("<p>DB content</p>");
    expect(data?.heroImage).toBe("/uploads/images/hero.jpg");
    expect(data?.breadcrumb).toBe("DB Breadcrumb");
  });

  it("falls back to placeholder SEO when DB meta fields are unset", async () => {
    mockGetPageContent.mockResolvedValue(
      dbRow({ metaTitle: null, metaDescription: null })
    );
    const data = await getPageData("home", "en");
    expect(data?.metaTitle).toContain("Vision Values");
    expect(data?.metaDescription).toContain("HKEX");
  });

  it("returns the placeholder when the current locale is explicitly unpublished", async () => {
    mockGetPageContent.mockResolvedValue(dbRow({ isPublished: false }));
    const data = await getPageData("home", "en");
    // Unpublished → show the seeded placeholder, never the DB draft.
    expect(data?.title).toBe("Vision Values Holdings Limited");
    expect(data?.isDbContent).toBe(false);
  });

  it("returns null for an unknown slug", async () => {
    mockGetPageContent.mockResolvedValue(null);
    expect(await getPageData("unknown-page", "en")).toBeNull();
  });

  it("returns null for an unknown locale", async () => {
    expect(await getPageData("home", "fr" as "en")).toBeNull();
  });
});
