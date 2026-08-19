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
  it("renders localized heading and clickable document list", () => {
    renderWithLocale(<CorporateGovernancePage params={{ locale: "en" }} />);
    expect(screen.getByRole("heading", { level: 1, name: "Corporate Governance" })).toBeInTheDocument();
    const moa = screen.getByText("Memorandum of Association and Articles of Association");
    expect(moa).toHaveAttribute(
      "href",
      "https://www.visionvalues.com.hk/eng/pdf/governance/MoAandAoA.pdf"
    );
    expect(moa).toHaveAttribute("target", "_blank");
    expect(screen.getByText("Audit Committee - Terms of Reference")).toBeInTheDocument();
    expect(screen.getByText("Whistleblowing Policy")).toBeInTheDocument();
  });

  it("renders Chinese heading and clickable document list", () => {
    renderWithLocale(<CorporateGovernancePage params={{ locale: "zh" }} />, "zh");
    expect(screen.getByRole("heading", { level: 1, name: "企業管治" })).toBeInTheDocument();
    const moa = screen.getByText("公司組織章程大綱及組織章程細則");
    expect(moa).toHaveAttribute(
      "href",
      "https://www.visionvalues.com.hk/chi/pdf/governance/MoAandAoA.pdf"
    );
    expect(moa).toHaveAttribute("target", "_blank");
    expect(screen.getByText("審核委員會 - 職權範圍書")).toBeInTheDocument();
  });

  it("exposes localized metadata", () => {
    expect(generateMetadata({ params: { locale: "en" } }).title).toContain("Corporate Governance");
    expect(generateMetadata({ params: { locale: "zh" } }).title).toContain("企業管治");
  });
});
