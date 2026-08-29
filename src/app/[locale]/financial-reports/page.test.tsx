import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FinancialReportsPage, { generateMetadata } from "./page";
import { getPlaceholder } from "@/lib/placeholders";
import { renderWithLocale } from "@/test/utils";

const { mockGetPageData } = vi.hoisted(() => ({ mockGetPageData: vi.fn() }));
vi.mock("@/lib/pages", () => ({ getPageData: mockGetPageData }));

vi.mock("next/headers", () => ({
  headers: () => new Map([["x-pathname", "/en/financial-reports"]]),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Financial Reports page (reports table)", () => {
  beforeEach(() => {
    mockGetPageData.mockImplementation(async (slug, locale) =>
      getPlaceholder(slug, locale)
    );
  });

  it("renders table with placeholder rows in English", async () => {
    renderWithLocale(await FinancialReportsPage({ params: { locale: "en" } }));
    expect(screen.getByRole("heading", { level: 1, name: "Financial Reports" })).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Document")).toBeInTheDocument();
    expect(screen.getByText("Annual Report 2025")).toBeInTheDocument();
    expect(screen.getByText("Interim Report 2024/2025")).toBeInTheDocument();
    expect(screen.getByText("Rows per page")).toBeInTheDocument();
  });

  it("renders localized table headers and rows in Chinese", async () => {
    renderWithLocale(
      await FinancialReportsPage({ params: { locale: "zh" } }),
      "zh"
    );
    expect(screen.getByRole("heading", { level: 1, name: "財務報告" })).toBeInTheDocument();
    expect(screen.getByText("日期")).toBeInTheDocument();
    expect(screen.getByText("2025年報")).toBeInTheDocument();
    expect(screen.getByText("2024/2025年中期報告")).toBeInTheDocument();
    expect(screen.getByText("每頁行數")).toBeInTheDocument();
  });

  it("renders DB-driven report rows when the published content contains report data", async () => {
    const base = getPlaceholder("financial-reports", "en");
    mockGetPageData.mockResolvedValue({
      ...base!,
      isDbContent: true,
      contentHtml: JSON.stringify({
        __type: "reports",
        rows: [
          { id: "c", date: "2026", title: "Custom Report 2026", url: "/uploads/reports/en/custom.pdf" },
        ],
      }),
    });

    renderWithLocale(await FinancialReportsPage({ params: { locale: "en" } }));

    // The DB-driven row replaces the hardcoded default.
    expect(screen.getByText("Custom Report 2026")).toBeInTheDocument();
    expect(screen.queryByText("Annual Report 2025")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Custom Report 2026" })).toHaveAttribute(
      "href",
      "/uploads/reports/en/custom.pdf"
    );
  });

  it("exposes localized metadata", async () => {
    expect(
      (await generateMetadata({ params: { locale: "en" } })).title
    ).toContain("Financial Reports");
    expect(
      (await generateMetadata({ params: { locale: "zh" } })).title
    ).toContain("財務報告");
  });
});
