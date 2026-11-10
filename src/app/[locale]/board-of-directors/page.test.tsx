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
      await BoardOfDirectorsPage({ params: Promise.resolve({ locale: "en" }) })
    );
    expect(screen.getByRole("heading", { level: 1, name: "Board of Directors" })).toBeInTheDocument();
    expect(screen.getByText("Executive Directors")).toBeInTheDocument();
    expect(screen.getByText("Independent Non-Executive Directors")).toBeInTheDocument();
    expect(screen.getByText("Mr. Lo Lin Shing, Simon")).toBeInTheDocument();
    expect(screen.getByText("Mrr. Tsui Hing Chuen, William jp")).toBeInTheDocument();
  });

  it("renders Chinese director categories and names", async () => {
    renderWithLocale(await BoardOfDirectorsPage({ params: Promise.resolve({ locale: "zh" }) }), "zh");
    expect(screen.getByRole("heading", { level: 1, name: "董事會" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "執行董事" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "獨立非執行董事" })
    ).toBeInTheDocument();
    expect(screen.getByText("魯連城先生")).toBeInTheDocument();
  });

  it("expands a director bio on click", async () => {
    const user = userEvent.setup();
    renderWithLocale(await BoardOfDirectorsPage({ params: Promise.resolve({ locale: "en" }) }));
    expect(screen.queryByText(/joined the Company in March 2000/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Lo Lin Shing/i }));
    expect(screen.getByText(/joined the Company in March 2000/i)).toBeInTheDocument();
  });

  it("renders DB director content as cards and the Role-and-Functions PDF link", async () => {
    const placeholder = getPlaceholder("board-of-directors", "en");
    mockGetPageData.mockResolvedValue({
      ...placeholder!,
      isDbContent: true,
      contentHtml:
        "<h2>Executive Directors</h2><p><strong>Mr. Lo Lin Shing, Simon</strong><br/><em>Chairman</em><br/>A verified DB bio.</p>" +
        '<h2>Roles &amp; Responsibilities</h2><p><a href="/uploads/reports/en/RoleAndFunction.pdf" target="_blank" rel="noopener noreferrer">Directors&#39; Roles and Functions (PDF)</a></p>',
    });

    renderWithLocale(
      await BoardOfDirectorsPage({ params: Promise.resolve({ locale: "en" }) })
    );

    // DB-driven grid (not the interactive component)
    expect(screen.getByTestId("director-db-content")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Lo Lin Shing/i })).not.toBeInTheDocument();

    // Category heading, director name and bio, and the PDF link are present
    expect(
      screen.getByRole("heading", { level: 2, name: "Executive Directors" })
    ).toBeInTheDocument();
    expect(screen.getByText("Mr. Lo Lin Shing, Simon")).toBeInTheDocument();
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
      (await generateMetadata({ params: Promise.resolve({ locale: "en" }) })).title
    ).toContain("Board of Directors");
    expect(
      (await generateMetadata({ params: Promise.resolve({ locale: "zh" }) })).title
    ).toContain("董事會");
  });
});
