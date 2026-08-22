import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPageContent,
  upsertPageContent,
  listPagesWithContent,
  getRecentPageActivity,
} from "@/lib/page-content";

// Mock the Prisma client at the DB boundary (see .github/skills/tdd/mocking.md —
// databases are a system boundary and are mocked with canned responses).
const { mockPage, mockPageContent } = vi.hoisted(() => ({
  mockPage: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  mockPageContent: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { page: mockPage, pageContent: mockPageContent },
}));

function row(overrides: Partial<Record<string, unknown>> = {}) {
  return {
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
    ...overrides,
  };
}

describe("getPageContent(slug, locale)", () => {
  beforeEach(() => {
    mockPageContent.findFirst.mockReset();
  });

  it("returns the page content row for an existing page+locale", async () => {
    mockPageContent.findFirst.mockResolvedValue(row({ title: "Home" }));
    const content = await getPageContent("home", "en");
    expect(content?.title).toBe("Home");
    expect(mockPageContent.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          locale: "en",
          page: { slug: "home" },
        }),
      })
    );
  });

  it("returns null when the locale content does not exist", async () => {
    mockPageContent.findFirst.mockResolvedValue(null);
    expect(await getPageContent("home", "zh")).toBeNull();
  });
});

describe("upsertPageContent(slug, locale, data)", () => {
  beforeEach(() => {
    mockPage.findUnique.mockReset();
    mockPageContent.upsert.mockReset();
  });

  it("throws when the page slug does not exist", async () => {
    mockPage.findUnique.mockResolvedValue(null);
    await expect(
      upsertPageContent("unknown-slug", "en", { title: "X" })
    ).rejects.toThrow(/unknown-slug/);
    expect(mockPageContent.upsert).not.toHaveBeenCalled();
  });

  it("upserts against the pageId_locale compound key", async () => {
    mockPage.findUnique.mockResolvedValue({ id: 42 });
    mockPageContent.upsert.mockResolvedValue(
      row({ id: 7, pageId: 42, title: "Saved" })
    );

    const saved = await upsertPageContent("home", "en", {
      title: "Saved",
      isPublished: true,
    });

    expect(saved.title).toBe("Saved");
    expect(mockPageContent.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { pageId_locale: { pageId: 42, locale: "en" } },
        create: expect.objectContaining({
          pageId: 42,
          locale: "en",
          title: "Saved",
        }),
      })
    );
  });
});

describe("listPagesWithContent()", () => {
  beforeEach(() => {
    mockPage.findMany.mockReset();
  });

  it("projects each page with en/zh content slots (null when absent)", async () => {
    mockPage.findMany.mockResolvedValue([
      {
        id: 1,
        slug: "home",
        menuOrder: 1,
        isVisible: true,
        contents: [row({ locale: "en", title: "Home EN" })],
      },
      {
        id: 2,
        slug: "contact",
        menuOrder: 2,
        isVisible: true,
        contents: [row({ locale: "zh", title: "聯絡我們" })],
      },
    ]);

    const list = await listPagesWithContent();

    expect(list).toHaveLength(2);
    expect(list[0].en?.title).toBe("Home EN");
    expect(list[0].zh).toBeNull();
    expect(list[1].zh?.title).toBe("聯絡我們");
    expect(list[1].en).toBeNull();
    expect(mockPage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { menuOrder: "asc" } })
    );
  });

  it("handles pages without any content rows", async () => {
    mockPage.findMany.mockResolvedValue([
      { id: 1, slug: "home", menuOrder: 1, isVisible: true, contents: [] },
    ]);
    const list = await listPagesWithContent();
    expect(list[0].en).toBeNull();
    expect(list[0].zh).toBeNull();
  });
});

describe("getRecentPageActivity(limit)", () => {
  beforeEach(() => {
    mockPageContent.findMany.mockReset();
  });

  it("returns recent rows ordered by updatedAt desc and limited", async () => {
    mockPageContent.findMany.mockImplementation(async ({ take }) => {
      return Array.from({ length: take }, (_, i) =>
        row({
          pageId: i + 1,
          slug: `page-${i + 1}`,
          locale: "en",
          title: `Page ${i + 1}`,
          updatedAt: new Date(2026, 0, take - i),
          page: { slug: `page-${i + 1}` },
        })
      );
    });

    const recent = await getRecentPageActivity(3);

    expect(recent).toHaveLength(3);
    expect(recent[0].slug).toBe("page-1");
    expect(recent[0].locale).toBe("en");
    expect(mockPageContent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 3, orderBy: { updatedAt: "desc" } })
    );
  });
});