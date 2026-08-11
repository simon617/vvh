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
  it("renders field labels and values in English", () => {
    renderWithLocale(<CorporateDetailsPage params={{ locale: "en" }} />);
    expect(screen.getByRole("heading", { level: 1, name: "Corporate Details" })).toBeInTheDocument();
    expect(screen.getByText("Place of Incorporation")).toBeInTheDocument();
    expect(screen.getByText("Cayman Islands")).toBeInTheDocument();
    expect(screen.getByText("Stock Code")).toBeInTheDocument();
    expect(screen.getByText("862")).toBeInTheDocument();
  });

  it("renders field labels and values in Chinese", () => {
    renderWithLocale(<CorporateDetailsPage params={{ locale: "zh" }} />, "zh");
    expect(screen.getByRole("heading", { level: 1, name: "公司詳情" })).toBeInTheDocument();
    expect(screen.getByText("註冊地點")).toBeInTheDocument();
    expect(screen.getByText("開曼群島")).toBeInTheDocument();
    expect(screen.getByText("股票編號")).toBeInTheDocument();
  });
});
