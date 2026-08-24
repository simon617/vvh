import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import AdminPagesPage from "./page";
import { renderWithLocale } from "@/test/utils";

const { mockListPagesWithContent } = vi.hoisted(() => ({
  mockListPagesWithContent: vi.fn(),
}));

vi.mock("@/lib/page-content", () => ({
  listPagesWithContent: mockListPagesWithContent,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

function pageRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    slug: "home",
    menuOrder: 1,
    isVisible: true,
    en: {
      id: 1,
      pageId: 1,
      locale: "en",
      isPublished: true,
      title: "Home",
      metaTitle: null,
      metaDescription: null,
      heroImage: null,
      contentHtml: null,
      breadcrumbLabel: null,
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    },
    zh: null,
    ...overrides,
  };
}

describe("Admin pages listing (/admin/pages)", () => {
  beforeEach(() => {
    mockListPagesWithContent.mockReset();
  });

  it("renders a row per page with per-locale status and edit link", async () => {
    mockListPagesWithContent.mockResolvedValue([
      pageRow(),
      pageRow({
        id: 2,
        slug: "contact",
        en: null,
        zh: {
          id: 2,
          pageId: 2,
          locale: "zh",
          isPublished: false,
          title: "聯絡我們",
          metaTitle: null,
          metaDescription: null,
          heroImage: null,
          contentHtml: null,
          breadcrumbLabel: null,
          updatedAt: new Date("2026-01-01T00:00:00Z"),
        },
      }),
    ]);

    // An async server component resolves to JSX — await it before rendering.
    renderWithLocale(await AdminPagesPage({ params: { locale: "en" } }));

    expect(screen.getByText("home")).toBeTruthy();
    expect(screen.getByText("contact")).toBeTruthy();

    // EN published for home, ZH unpublished for contact.
    expect(screen.getByTestId("en-status-home").textContent).toContain(
      "Published"
    );
    expect(screen.getByTestId("zh-status-contact").textContent).toContain(
      "Unpublished"
    );

    // A missing locale shows a dash.
    expect(screen.getByTestId("zh-status-home").textContent).toContain("Unpublished");
    expect(screen.getByTestId("en-status-contact").textContent).toContain("Unpublished");
  });

  it("prefixes the edit link with the active locale", async () => {
    mockListPagesWithContent.mockResolvedValue([pageRow()]);

    renderWithLocale(await AdminPagesPage({ params: { locale: "zh" } }));
    const hrefs = screen
      .getAllByText("Edit")
      .map((node) => node.getAttribute("href"));
    expect(hrefs).toContain("/zh/admin/pages/home");
  });
});