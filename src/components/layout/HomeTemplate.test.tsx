import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomeTemplate from "./HomeTemplate";
import { getPlaceholder } from "@/lib/placeholders";
import { renderWithLocale } from "@/test/utils";
import type { LatestReports } from "@/lib/pages";

function pageData(locale: "en" | "zh") {
  const data = getPlaceholder("home", locale);
  if (!data) throw new Error("missing home placeholder");
  return data;
}

function latestReports(
  overrides: Partial<LatestReports> = {}
): LatestReports {
  return {
    financial: [
      {
        id: "fin-1",
        date: "October 2025",
        title: "Annual Report 2025",
        url: "/uploads/reports/en/ar2025.pdf",
      },
    ],
    esg: [
      {
        id: "esg-1",
        date: "2025",
        title: "ESG Report 2025",
        url: "/uploads/reports/en/esg2025.pdf",
      },
    ],
    ...overrides,
  };
}

describe("HomeTemplate", () => {
  it("renders hero, metrics, latest reports and view-all links (English)", () => {
    renderWithLocale(
      <HomeTemplate
        pageData={pageData("en")}
        locale="en"
        latestReports={latestReports()}
      />
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Vision Values Holdings Limited" })
    ).toBeInTheDocument();
    expect(screen.getByText("HKEX: 862")).toBeInTheDocument();
    expect(screen.getByText("Listed")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Latest Reports" })
    ).toBeInTheDocument();

    // Category headings + real report rows.
    expect(
      screen.getByRole("heading", { level: 3, name: "Financial Reports" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "ESG Reports" })
    ).toBeInTheDocument();
    const pdf = screen.getByRole("link", { name: "Annual Report 2025" });
    expect(pdf.getAttribute("href")).toBe("/uploads/reports/en/ar2025.pdf");
    expect(pdf.getAttribute("target")).toBe("_blank");
    expect(screen.getByText("— 2025")).toBeInTheDocument();
    const viewAll = screen.getAllByRole("link", { name: "View all →" });
    expect(viewAll).toHaveLength(2);
    expect(viewAll[0]).toHaveAttribute("href", "/en/financial-reports");
    expect(viewAll[1]).toHaveAttribute("href", "/en/esg-reports");
  });

  it("renders the hero image when one is present", () => {
    renderWithLocale(
      <HomeTemplate
        pageData={{ ...pageData("en"), heroImage: "/uploads/images/hero.jpg" }}
        locale="en"
        latestReports={{ financial: [], esg: [] }}
      />
    );
    expect(screen.getByTestId("hero-image")).toHaveAttribute(
      "src",
      "/uploads/images/hero.jpg"
    );
  });

  it("renders localized hero, metrics and reports with zh view-all links (Chinese)", () => {
    renderWithLocale(
      <HomeTemplate
        pageData={pageData("zh")}
        locale="zh"
        latestReports={latestReports()}
      />,
      "zh"
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "遠見控股有限公司" })
    ).toBeInTheDocument();
    expect(screen.getByText("香港交易所：862")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "最新報告" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "財務報告" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "環境、社會及管治報告" })
    ).toBeInTheDocument();
    const viewAll = screen.getAllByRole("link", { name: "查看全部 →" });
    expect(viewAll).toHaveLength(2);
    expect(viewAll[0]).toHaveAttribute("href", "/zh/financial-reports");
    expect(viewAll[1]).toHaveAttribute("href", "/zh/esg-reports");
  });

  it("falls back to the empty-state body when there are no report rows", () => {
    renderWithLocale(
      <HomeTemplate
        pageData={pageData("en")}
        locale="en"
        latestReports={{ financial: [], esg: [] }}
      />
    );
    expect(screen.getByText("No reports available yet.")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 3, name: /Financial|ESG/ })
    ).toBeNull();
  });
});
