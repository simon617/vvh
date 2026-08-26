import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CorporateCommunicationsPage from "./page";
import { getPlaceholder } from "@/lib/placeholders";
import { renderWithLocale } from "@/test/utils";

const { mockGetPageData } = vi.hoisted(() => ({ mockGetPageData: vi.fn() }));
vi.mock("@/lib/pages", () => ({ getPageData: mockGetPageData }));

vi.mock("next/headers", () => ({
  headers: () => new Map([["x-pathname", "/en/corporate-communications"]]),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Corporate Communications page (reports table)", () => {
  beforeEach(() => {
    mockGetPageData.mockImplementation(async (slug, locale) =>
      getPlaceholder(slug, locale)
    );
  });

  it("renders a sortable document table linked to a local PDF in English", async () => {
    renderWithLocale(
      await CorporateCommunicationsPage({ params: { locale: "en" } })
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Corporate Communications" })
    ).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Document")).toBeInTheDocument();

    const link = screen.getByText(
      "Arrangements Regarding Dissemination of Corporate Communications"
    );
    expect(link).toHaveAttribute(
      "href",
      "/pdf/communication/e_Communications202401.pdf"
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders a localized document table linked to a local PDF in Chinese", async () => {
    renderWithLocale(
      await CorporateCommunicationsPage({ params: { locale: "zh" } }),
      "zh"
    );
    expect(screen.getByRole("heading", { level: 1, name: "公司通訊" })).toBeInTheDocument();
    expect(screen.getByText("日期")).toBeInTheDocument();
    expect(screen.getByText("文件")).toBeInTheDocument();

    const link = screen.getByText("有關發佈公司通訊之安排");
    expect(link).toHaveAttribute(
      "href",
      "/pdf/communication/c_Communications202401.pdf"
    );
    expect(link).toHaveAttribute("target", "_blank");
  });
});
