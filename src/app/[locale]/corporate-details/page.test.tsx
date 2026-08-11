import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CorporateDetailsPage from "./page";
import { renderWithLocale } from "@/test/utils";

vi.mock("next/headers", () => ({
  headers: () => new Map([["x-pathname", "/en/corporate-details"]]),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Corporate Details page (data table)", () => {
  it("renders field labels and values in English (matching live site)", () => {
    renderWithLocale(<CorporateDetailsPage params={{ locale: "en" }} />);
    expect(screen.getByRole("heading", { level: 1, name: "Corporate Details" })).toBeInTheDocument();
    expect(screen.getByText("Place of Incorporation")).toBeInTheDocument();
    expect(screen.getByText("Cayman Islands")).toBeInTheDocument();
    expect(screen.getByText("Principal Activities")).toBeInTheDocument();
    expect(screen.getByText("Authorised Shares")).toBeInTheDocument();
    expect(screen.getByText("20,000,000,000")).toBeInTheDocument();
    expect(screen.getByText("Financial Year End Date")).toBeInTheDocument();
    expect(screen.getByText("Listing Date")).toBeInTheDocument();
  });

  it("renders field labels and values in Chinese (matching live site)", () => {
    renderWithLocale(<CorporateDetailsPage params={{ locale: "zh" }} />, "zh");
    expect(screen.getByRole("heading", { level: 1, name: "公司詳情" })).toBeInTheDocument();
    expect(screen.getByText("註冊地點")).toBeInTheDocument();
    expect(screen.getByText("開曼群島")).toBeInTheDocument();
    expect(screen.getByText("主要業務")).toBeInTheDocument();
    expect(screen.getByText("上市日期")).toBeInTheDocument();
  });

  it("left-aligns the row title cells (not centered)", () => {
    renderWithLocale(<CorporateDetailsPage params={{ locale: "en" }} />);
    const headers = screen.getAllByRole("columnheader");
    expect(headers.length).toBeGreaterThan(0);
    headers.forEach((header) => {
      expect(header).toHaveStyle("text-align: left");
    });
  });
});
