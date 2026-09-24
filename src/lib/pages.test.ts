import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLatestReports, getPageData, getReportRowsBySlug } from "./pages";
import { buildReportContent } from "./report-rows";

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

describe("getReportRowsBySlug / getLatestReports (home latest reports)", () => {
  beforeEach(() => {
    mockGetPageContent.mockReset();
  });

  it("reads the rows from a report page's CMS envelope", async () => {
    mockGetPageContent.mockResolvedValue(
      dbRow({
        contentHtml: buildReportContent([
          { id: "a", date: "October 2025", title: "Annual Report 2025", url: "/r1.pdf" },
          { id: "b", date: "March 2024", title: "Interim Report", url: "/r2.pdf" },
        ]),
      })
    );
    const rows = await getReportRowsBySlug("financial-reports", "en");
    expect(rows).toHaveLength(2);
    expect(rows[0].title).toBe("Annual Report 2025");
  });

  it("returns [] when the page content is not a report envelope", async () => {
    mockGetPageContent.mockResolvedValue(
      dbRow({ contentHtml: "<p>plain HTML</p>" })
    );
    expect(await getReportRowsBySlug("home", "en")).toEqual([]);
  });

  it("returns the newest financial and esg rows per locale, sorted by date desc and capped at limit", async () => {
    const rows = Array.from({ length: 5 }, (_, i) => ({
      id: `r${i}`,
      date: `202${i}`,
      title: `Report ${i}`,
      url: `/r${i}.pdf`,
    }));
    mockGetPageContent.mockImplementation(async () =>
      dbRow({ contentHtml: buildReportContent(rows) })
    );

    const latest = await getLatestReports("en", 3);
    expect(latest.financial).toHaveLength(3);
    expect(latest.esg).toHaveLength(3);
    expect(latest.financial[0].date).toBe("2024");

    await getLatestReports("zh");
    expect(mockGetPageContent).toHaveBeenCalledWith("financial-reports", "zh");
    expect(mockGetPageContent).toHaveBeenCalledWith("esg-reports", "zh");
  });
});
