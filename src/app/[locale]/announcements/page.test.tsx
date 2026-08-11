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
  it("renders HKEX-linked table rows that open in a new tab", () => {
    renderWithLocale(<AnnouncementsPage params={{ locale: "en" }} />);
    expect(screen.getByRole("heading", { level: 1, name: "Announcements & Circulars" })).toBeInTheDocument();
    const link = screen.getByText("Announcement of Annual Results");
    expect(link).toHaveAttribute("href", "https://www1.hkexnews.hk/");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders Chinese rows", () => {
    renderWithLocale(<AnnouncementsPage params={{ locale: "zh" }} />, "zh");
    expect(screen.getByText("全年業績公告")).toBeInTheDocument();
  });

  it("exposes localized metadata", () => {
    expect(generateMetadata({ params: { locale: "en" } }).title).toContain("Announcements");
    expect(generateMetadata({ params: { locale: "zh" } }).title).toContain("公告");
  });
});
