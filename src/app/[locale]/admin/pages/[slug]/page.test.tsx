import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import AdminPageEditorPage from "./page";
import { renderWithLocale } from "@/test/utils";

const { mockGetPageBySlug, mockGetPageContent, mockNotFound } = vi.hoisted(
  () => ({
    mockGetPageBySlug: vi.fn(),
    mockGetPageContent: vi.fn(),
    mockNotFound: vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    }),
  })
);

vi.mock("@/lib/page-content", () => ({
  getPageBySlug: mockGetPageBySlug,
  getPageContent: mockGetPageContent,
}));

vi.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/admin/LocaleTabs", () => ({
  __esModule: true,
  default: () => <div data-testid="locale-tabs-mock" />,
}));

// PageEditor pulls in TipTap (jsdom-heavy); mock it to keep this focused on the page seam.
vi.mock("@/components/admin/PageEditor", () => ({
  __esModule: true,
  default: ({ initialEn }: { initialEn: { title?: string } | null }) => (
    <div data-testid="page-editor-mock" data-en-title={initialEn?.title ?? ""} />
  ),
}));

describe("Admin page editor route (server)", () => {
  it("calls notFound() when the slug has no Page row", async () => {
    mockGetPageBySlug.mockResolvedValue(null);
    await expect(
      AdminPageEditorPage({ params: { locale: "en", slug: "nope" } })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("loads both locales and renders the editor with loaded content", async () => {
    mockGetPageBySlug.mockResolvedValue({ id: 1 });
    mockGetPageContent.mockImplementation(
      async (_slug: string, locale: string) =>
        locale === "en"
          ? { id: 1, pageId: 1, locale: "en", isPublished: true, title: "Home" }
          : null
    );

    const jsx = await AdminPageEditorPage({
      params: { locale: "en", slug: "home" },
    });
    renderWithLocale(jsx);

    expect(mockGetPageContent).toHaveBeenCalledWith("home", "en");
    expect(mockGetPageContent).toHaveBeenCalledWith("home", "zh");
    // The mocked PageEditor receives the EN content title.
    const editor = document.querySelector(
      '[data-testid="page-editor-mock"]'
    ) as HTMLElement | null;
    expect(editor?.getAttribute("data-en-title")).toBe("Home");
  });
});