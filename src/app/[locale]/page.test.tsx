import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage, { generateMetadata } from "./page";
import { getPlaceholder } from "@/lib/placeholders";
import { renderWithLocale } from "@/test/utils";

const { mockGetPageData, mockGetLatestReports } = vi.hoisted(() => ({
  mockGetPageData: vi.fn(),
  mockGetLatestReports: vi.fn(),
}));
vi.mock("@/lib/pages", () => ({
  getPageData: mockGetPageData,
  getLatestReports: mockGetLatestReports,
}));

describe("Home page template", () => {
  beforeEach(() => {
    mockGetPageData.mockImplementation(async (slug, locale) =>
      getPlaceholder(slug, locale)
    );
    mockGetLatestReports.mockResolvedValue({ financial: [], esg: [] });
  });

  it("renders hero, metrics and reports in English", async () => {
    renderWithLocale(await HomePage({ params: { locale: "en" } }));
    expect(
      screen.getByRole("heading", { level: 1, name: /Vision Values Holdings/i })
    ).toBeInTheDocument();
    expect(screen.getByText("HKEX: 862")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Latest Reports" })
    ).toBeInTheDocument();
  });

  it("passes the latest report rows for the locale to the template", async () => {
    await HomePage({ params: { locale: "en" } });
    expect(mockGetLatestReports).toHaveBeenCalledWith("en");
  });

  it("renders localized Chinese content", async () => {
    renderWithLocale(await HomePage({ params: { locale: "zh" } }), "zh");
    expect(
      screen.getByRole("heading", { level: 1, name: "遠見控股有限公司" })
    ).toBeInTheDocument();
    expect(screen.getByText("香港交易所：862")).toBeInTheDocument();
  });

  it("exposes localized metadata", async () => {
    expect(
      (await generateMetadata({ params: { locale: "en" } })).title
    ).toContain("Vision Values Holdings Limited");
    expect(
      (await generateMetadata({ params: { locale: "zh" } })).title
    ).toContain("遠見控股有限公司");
  });
});
