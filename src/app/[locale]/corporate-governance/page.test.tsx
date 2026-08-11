import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CorporateGovernancePage, { generateMetadata } from "./page";
import { renderWithLocale } from "@/test/utils";

vi.mock("next/headers", () => ({
  headers: () => new Map([["x-pathname", "/en/corporate-governance"]]),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Corporate Governance page (rich text)", () => {
  it("renders localized heading and body", () => {
    renderWithLocale(<CorporateGovernancePage params={{ locale: "en" }} />);
    expect(screen.getByRole("heading", { level: 1, name: "Corporate Governance" })).toBeInTheDocument();
    expect(screen.getByText(/committed to maintaining high standards/i)).toBeInTheDocument();
  });

  it("renders Chinese heading and body", () => {
    renderWithLocale(<CorporateGovernancePage params={{ locale: "zh" }} />, "zh");
    expect(screen.getByRole("heading", { level: 1, name: "企業管治" })).toBeInTheDocument();
    expect(screen.getByText(/企業管治守則/i)).toBeInTheDocument();
  });

  it("exposes localized metadata", () => {
    expect(generateMetadata({ params: { locale: "en" } }).title).toContain("Corporate Governance");
    expect(generateMetadata({ params: { locale: "zh" } }).title).toContain("企業管治");
  });
});
