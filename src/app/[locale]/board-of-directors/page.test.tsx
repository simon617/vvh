import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BoardOfDirectorsPage, { generateMetadata } from "./page";
import { getPlaceholder } from "@/lib/placeholders";
import { renderWithLocale } from "@/test/utils";

const { mockGetPageData } = vi.hoisted(() => ({ mockGetPageData: vi.fn() }));
vi.mock("@/lib/pages", () => ({ getPageData: mockGetPageData }));

vi.mock("next/headers", () => ({
  headers: () => new Map([["x-pathname", "/en/board-of-directors"]]),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Board of Directors page template", () => {
  beforeEach(() => {
    mockGetPageData.mockImplementation(async (slug, locale) =>
      getPlaceholder(slug, locale)
    );
  });

  it("renders director categories and all names", async () => {
    renderWithLocale(
      await BoardOfDirectorsPage({ params: { locale: "en" } })
    );
    expect(screen.getByRole("heading", { level: 1, name: "Board of Directors" })).toBeInTheDocument();
    expect(screen.getByText("Executive Directors")).toBeInTheDocument();
    expect(screen.getByText("Independent Non-Executive Directors")).toBeInTheDocument();
    expect(screen.getByText("Mr. Lo Luen Chuen")).toBeInTheDocument();
    expect(screen.getByText("Mr. Tsui Hing Chuen (JP)")).toBeInTheDocument();
  });

  it("renders Chinese director categories and names", async () => {
    renderWithLocale(await BoardOfDirectorsPage({ params: { locale: "zh" } }), "zh");
    expect(screen.getByRole("heading", { level: 1, name: "董事會" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "執行董事" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "獨立非執行董事" })
    ).toBeInTheDocument();
    expect(screen.getByText("魯連城先生")).toBeInTheDocument();
  });

  it("expands a director bio on click", async () => {
    const user = userEvent.setup();
    renderWithLocale(await BoardOfDirectorsPage({ params: { locale: "en" } }));
    expect(screen.queryByText(/extensive experience in corporate management/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Lo Luen Chuen/i }));
    expect(screen.getByText(/extensive experience in corporate management/i)).toBeInTheDocument();
  });

  it("renders DB director content as cards and the Role-and-Functions PDF link", async () => {
    const placeholder = getPlaceholder("board-of-directors", "en");
    mockGetPageData.mockResolvedValue({
      ...placeholder!,
      isDbContent: true,
      contentHtml:
        "<h2>Executive Directors</h2><p><strong>Mr. Lo Luen Chuen</strong><br/><em>Chairman</em><br/>A verified DB bio.</p>" +
        '<p><strong>Roles &amp; Functions</strong><br/><a href="/uploads/reports/en/RoleAndFunction.pdf" target="_blank" rel="noopener noreferrer">Directors&#39; Roles and Functions (PDF)</a></p>',
    });

    renderWithLocale(
      await BoardOfDirectorsPage({ params: { locale: "en" } })
    );

    // DB-driven grid (not the interactive component)
    expect(screen.getByTestId("director-db-content")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Lo Luen Chuen/i })).not.toBeInTheDocument();

    // Category heading, director name and bio, and the PDF link are present
    expect(
      screen.getByRole("heading", { level: 2, name: "Executive Directors" })
    ).toBeInTheDocument();
    expect(screen.getByText("Mr. Lo Luen Chuen")).toBeInTheDocument();
    expect(screen.getByText("A verified DB bio.")).toBeInTheDocument();

    const pdfLink = screen.getByRole("link", {
      name: /Roles and Functions/,
    });
    expect(pdfLink).toHaveAttribute(
      "href",
      "/uploads/reports/en/RoleAndFunction.pdf"
    );
    expect(pdfLink).toHaveAttribute("target", "_blank");
    expect(pdfLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("exposes localized metadata", async () => {
    expect(
      (await generateMetadata({ params: { locale: "en" } })).title
    ).toContain("Board of Directors");
    expect(
      (await generateMetadata({ params: { locale: "zh" } })).title
    ).toContain("董事會");
  });
});
