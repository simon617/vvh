import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EsgReportsPage from "./page";
import { getPlaceholder } from "@/lib/placeholders";
import { renderWithLocale } from "@/test/utils";

const { mockGetPageData } = vi.hoisted(() => ({ mockGetPageData: vi.fn() }));
vi.mock("@/lib/pages", () => ({ getPageData: mockGetPageData }));

vi.mock("next/headers", () => ({
  headers: () => new Map([["x-pathname", "/en/esg-reports"]]),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ESG Reports page (reports table)", () => {
  beforeEach(() => {
    mockGetPageData.mockImplementation(async (slug, locale) =>
      getPlaceholder(slug, locale)
    );
  });

  it("renders table with placeholder rows in English", async () => {
    renderWithLocale(await EsgReportsPage({ params: { locale: "en" } }));
    expect(screen.getByRole("heading", { level: 1, name: "ESG Reports" })).toBeInTheDocument();
    expect(screen.getByText("ESG Report 2025")).toBeInTheDocument();
  });

  it("renders localized rows in Chinese", async () => {
    renderWithLocale(await EsgReportsPage({ params: { locale: "zh" } }), "zh");
    expect(screen.getByRole("heading", { level: 1, name: "環境、社會及管治報告" })).toBeInTheDocument();
    expect(screen.getByText("2025環境、社會及管治報告")).toBeInTheDocument();
  });
});
