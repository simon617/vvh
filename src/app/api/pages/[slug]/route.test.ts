import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, PUT, validatePageContentBody } from "./route";

const { mockGetSession, mockGetPageContent, mockGetPageBySlug, mockUpsertPageContent } =
  vi.hoisted(() => ({
    mockGetSession: vi.fn(),
    mockGetPageContent: vi.fn(),
    mockGetPageBySlug: vi.fn(),
    mockUpsertPageContent: vi.fn(),
  }));

vi.mock("@/lib/auth", () => ({ getSession: mockGetSession }));
vi.mock("@/lib/page-content", () => ({
  getPageContent: mockGetPageContent,
  getPageBySlug: mockGetPageBySlug,
  upsertPageContent: mockUpsertPageContent,
}));

const ADMIN_SESSION = { userId: 1, username: "admin", role: "admin" };
const CONTENT = {
  id: 1,
  pageId: 1,
  locale: "en",
  isPublished: true,
  title: "Home",
  metaTitle: null,
  metaDescription: null,
  heroImage: null,
  contentHtml: "<p>hi</p>",
  breadcrumbLabel: null,
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

function makeRequest(body?: unknown, search?: string) {
  const url = `http://localhost/api/pages/home${search ?? ""}`;
  if (body === undefined) {
    return new NextRequest(url);
  }
  return new NextRequest(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("validatePageContentBody", () => {
  it("accepts a valid page content body", () => {
    const result = validatePageContentBody({
      locale: "en",
      title: "Home",
      isPublished: true,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects a missing or invalid locale", () => {
    const missing = validatePageContentBody({ title: "Home" });
    expect(missing.ok).toBe(false);
    expect(!missing.ok && missing.errors).toContain("locale must be 'en' or 'zh'");

    const bad = validatePageContentBody({ locale: "fr", title: "Home" });
    expect(bad.ok).toBe(false);
  });

  it("rejects a non-object payload", () => {
    const result = validatePageContentBody(null);
    expect(result.ok).toBe(false);
  });

  it("rejects a non-boolean isPublished", () => {
    const result = validatePageContentBody({
      locale: "en",
      title: "Home",
      isPublished: "yes",
    });
    expect(result.ok).toBe(false);
  });
});

describe("GET /api/pages/[slug]", () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    mockGetPageContent.mockReset();
    mockGetPageBySlug.mockReset();
    mockUpsertPageContent.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(makeRequest(undefined), { params: { slug: "home" } });
    expect(res.status).toBe(401);
  });

  it("returns both locale contents", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockGetPageContent.mockImplementation(
      async (_slug: string, locale: string) =>
        locale === "en" ? CONTENT : null
    );
    const res = await GET(makeRequest(undefined), { params: { slug: "home" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.en?.title).toBe("Home");
    expect(body.zh).toBeNull();
  });

  it("returns a single locale when ?locale= is provided", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockGetPageContent.mockResolvedValue(CONTENT);
    const res = await GET(makeRequest(undefined, "?locale=en"), {
      params: { slug: "home" },
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.locale).toBe("en");
    expect(body.content.id).toBe(CONTENT.id);
    expect(body.content.title).toBe("Home");
    expect(typeof body.content.updatedAt).toBe("string"); // JSON serialised Date
    expect(mockGetPageContent).toHaveBeenCalledWith("home", "en");
  });

  it("rejects an invalid locale param", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const res = await GET(makeRequest(undefined, "?locale=fr"), {
      params: { slug: "home" },
    });
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/pages/[slug]", () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    mockGetPageBySlug.mockReset();
    mockUpsertPageContent.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await PUT(makeRequest({ locale: "en", title: "Home" }), {
      params: { slug: "home" },
    });
    expect(res.status).toBe(401);
  });

  it("returns 400 for an invalid body", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    const res = await PUT(makeRequest({ title: "Home" }), {
      params: { slug: "home" },
    });
    expect(res.status).toBe(400);
    expect(mockUpsertPageContent).not.toHaveBeenCalled();
  });

  it("returns 404 when the page slug does not exist", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockGetPageBySlug.mockResolvedValue(null);
    const res = await PUT(makeRequest({ locale: "en", title: "Home" }), {
      params: { slug: "nope" },
    });
    expect(res.status).toBe(404);
    expect(mockUpsertPageContent).not.toHaveBeenCalled();
  });

  it("upserts the target locale and returns the saved content", async () => {
    mockGetSession.mockResolvedValue(ADMIN_SESSION);
    mockGetPageBySlug.mockResolvedValue({ id: 1 });
    mockUpsertPageContent.mockResolvedValue(CONTENT);

    const res = await PUT(
      makeRequest({ locale: "zh", title: "首頁", isPublished: true }),
      { params: { slug: "home" } }
    );

    expect(res.status).toBe(200);
    expect(mockUpsertPageContent).toHaveBeenCalledWith("home", "zh", {
      title: "首頁",
      isPublished: true,
    });
    const body = await res.json();
    expect(body.content.title).toBe("Home");
  });
});