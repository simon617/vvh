import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AnnouncementsPage, { generateMetadata } from "./page";
import { renderWithLocale } from "@/test/utils";

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
  it("embeds the en Datalink announcement page in an iframe", () => {
    renderWithLocale(AnnouncementsPage({ params: { locale: "en" } }));
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

  it("embeds the zh Datalink announcement page in an iframe", () => {
    renderWithLocale(AnnouncementsPage({ params: { locale: "zh" } }), "zh");
    expect(
      screen.getByRole("heading", { level: 1, name: "公告及通函" })
    ).toBeInTheDocument();
    const iframe = screen.getByTitle("公告及通函");
    expect(iframe).toHaveAttribute(
      "src",
      "https://datalink.talesis.com/document/c00640/Chinese/Announcement_2D_Chineselist_new"
    );
  });

  it("exposes localized metadata", () => {
    expect(generateMetadata({ params: { locale: "en" } }).title).toContain(
      "Announcements"
    );
    expect(generateMetadata({ params: { locale: "zh" } }).title).toContain(
      "公告"
    );
  });
});

