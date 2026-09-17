import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { GET } from "./route";

const { mockGetSession, mockListPagesWithContent } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockListPagesWithContent: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getSession: mockGetSession,
  requireSession: async () => {
    const session = await mockGetSession();
    return session
      ? { session, error: null }
      : {
          session: null,
          error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
  },
}));
vi.mock("@/lib/page-content", () => ({
  listPagesWithContent: mockListPagesWithContent,
}));

const ADMIN_SESSION = { userId: 1, username: "admin", role: "admin" };

describe("GET /api/pages", () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    mockListPagesWithContent.mockReset();
  });

  it("returns 401 for an unauthenticated request", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(mockListPagesWithContent).not.toHaveBeenCalled();
  });

  it("returns the pages list with per-locale content/status when authenticated", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockListPagesWithContent.mockResolvedValue([
      {
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
      },
    ]);

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.pages).toHaveLength(1);
    expect(body.pages[0].slug).toBe("home");
    expect(body.pages[0].en?.isPublished).toBe(true);
    expect(body.pages[0].en?.title).toBe("Home");
    expect(body.pages[0].zh).toBeNull();
  });
});