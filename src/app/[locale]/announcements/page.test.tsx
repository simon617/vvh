import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AnnouncementsPage, { generateMetadata } from "./page";
import { getPlaceholder } from "@/lib/placeholders";
import { renderWithLocale } from "@/test/utils";

const { mockGetPageData } = vi.hoisted(() => ({ mockGetPageData: vi.fn() }));
vi.mock("@/lib/pages", () => ({ getPageData: mockGetPageData }));

vi.mock("next/headers", () => ({
  headers: () => new Map([["x-pathname", "/en/announcements"]]),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Announcements page", () => {
  beforeEach(() => {
    mockGetPageData.mockImplementation(async (slug, locale) =>
      getPlaceholder(slug, locale)
    );
  });

  it("embeds the en Datalink announcement page in an iframe", async () => {
    renderWithLocale(await AnnouncementsPage({ params: { locale: "en" } }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Announcements & Circulars" })
    ).toBeInTheDocument();
    const iframe = screen.getByTitle("Announcements & Circulars");
    expect(iframe.tagName).toBe("IFRAME");
    expect(iframe).toHaveAttribute(
      "src",
      "https://datalink.talesis.com/document/c00640/Announcement_new"
    );
  });

  it("embeds the zh Datalink announcement page in an iframe", async () => {
    renderWithLocale(await AnnouncementsPage({ params: { locale: "zh" } }), "zh");
    expect(
      screen.getByRole("heading", { level: 1, name: "公告及通函" })
    ).toBeInTheDocument();
    const iframe = screen.getByTitle("公告及通函");
    expect(iframe).toHaveAttribute(
      "src",
      "https://datalink.talesis.com/document/c00640/Chinese/Announcement_2D_Chineselist_new"
    );
  });

  it("exposes localized metadata", async () => {
    expect(
      (await generateMetadata({ params: { locale: "en" } })).title
    ).toContain("Announcements");
    expect(
      (await generateMetadata({ params: { locale: "zh" } })).title
    ).toContain("公告");
  });
});

