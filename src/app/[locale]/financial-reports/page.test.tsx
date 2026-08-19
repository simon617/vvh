import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FinancialReportsPage, { generateMetadata } from "./page";
import { renderWithLocale } from "@/test/utils";

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
  it("renders table with placeholder rows in English", () => {
    renderWithLocale(<FinancialReportsPage params={{ locale: "en" }} />);
    expect(screen.getByRole("heading", { level: 1, name: "Financial Reports" })).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Document")).toBeInTheDocument();
    expect(screen.getByText("Annual Report 2025")).toBeInTheDocument();
    expect(screen.getByText("Interim Report 2024/2025")).toBeInTheDocument();
    expect(screen.getByText("Rows per page")).toBeInTheDocument();
  });

  it("renders localized table headers and rows in Chinese", () => {
    renderWithLocale(<FinancialReportsPage params={{ locale: "zh" }} />, "zh");
    expect(screen.getByRole("heading", { level: 1, name: "財務報告" })).toBeInTheDocument();
    expect(screen.getByText("日期")).toBeInTheDocument();
    expect(screen.getByText("2025年報")).toBeInTheDocument();
    expect(screen.getByText("2024/2025年中期報告")).toBeInTheDocument();
    expect(screen.getByText("每頁行數")).toBeInTheDocument();
  });

  it("exposes localized metadata", () => {
    expect(generateMetadata({ params: { locale: "en" } }).title).toContain("Financial Reports");
    expect(generateMetadata({ params: { locale: "zh" } }).title).toContain("財務報告");
  });
});
