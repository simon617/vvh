import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import AdminDashboardPage from "./page";
import { renderWithLocale } from "@/test/utils";

const { mockGetSession, mockListPagesWithContent, mockGetRecentPageActivity } =
  vi.hoisted(() => ({
    mockGetSession: vi.fn(),
    mockListPagesWithContent: vi.fn(),
    mockGetRecentPageActivity: vi.fn(),
  }));

vi.mock("@/lib/auth", () => ({ getSession: mockGetSession }));
vi.mock("@/lib/page-content", () => ({
  listPagesWithContent: mockListPagesWithContent,
  getRecentPageActivity: mockGetRecentPageActivity,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

function pageRow(slug: string, published: { en?: boolean; zh?: boolean } = {}) {
  const en =
    published.en === undefined
      ? null
      : { isPublished: published.en, title: `${slug} EN` };
  const zh =
    published.zh === undefined
      ? null
      : { isPublished: published.zh, title: `${slug} ZH` };
  return { id: 1, slug, menuOrder: 1, isVisible: true, en, zh };
}

function recentRow(slug: string, locale: string, title: string) {
  return { slug, locale, title, updatedAt: new Date("2026-01-05T10:30:00Z") };
}

describe("Admin dashboard (/admin)", () => {
  beforeEach(() => {
    mockGetSession.mockReset().mockResolvedValue({
      userId: 1,
      username: "admin",
      role: "admin",
    });
    mockListPagesWithContent.mockReset();
    mockGetRecentPageActivity.mockReset();
  });

  it("shows page counts and a recent-activity feed", async () => {
    mockListPagesWithContent.mockResolvedValue([
      pageRow("home", { en: true, zh: true }),
      pageRow("contact", { en: false, zh: true }),
      pageRow("reports", { en: true }),
    ]);
    mockGetRecentPageActivity.mockResolvedValue([
      recentRow("home", "en", "Home"),
      recentRow("home", "zh", "首頁"),
    ]);

    renderWithLocale(await AdminDashboardPage({ params: { locale: "en" } }));

    // Stats: 3 pages, 2 EN published, 2 ZH published
    expect(screen.getByText("Total pages")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getAllByText("2")).toHaveLength(2);

    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("首頁")).toBeTruthy();
    expect(screen.getByTestId("recent-locale-home-en")).toBeTruthy();
    expect(screen.getByTestId("recent-locale-home-zh")).toBeTruthy();
  });

  it("greets the logged-in admin by username", async () => {
    mockListPagesWithContent.mockResolvedValue([]);
    mockGetRecentPageActivity.mockResolvedValue([]);

    renderWithLocale(await AdminDashboardPage({ params: { locale: "en" } }));
    expect(screen.getByText("admin")).toBeTruthy();
  });

  it("shows a graceful empty state when there is no recent activity", async () => {
    mockListPagesWithContent.mockResolvedValue([pageRow("home", { en: true })]);
    mockGetRecentPageActivity.mockResolvedValue([]);

    renderWithLocale(await AdminDashboardPage({ params: { locale: "en" } }));
    expect(screen.getByTestId("recent-empty")).toBeTruthy();
    expect(screen.queryByTestId("recent-list")).not.toBeInTheDocument();
  });
});
