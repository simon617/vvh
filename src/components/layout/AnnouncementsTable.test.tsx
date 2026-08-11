import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AnnouncementsTable from "./AnnouncementsTable";
import { getAnnouncements } from "@/lib/announcements";
import { renderWithLocale } from "@/test/utils";

describe("AnnouncementsTable", () => {
  it("renders localized column headers and rows", () => {
    renderWithLocale(<AnnouncementsTable rows={getAnnouncements("en")} />);
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Document")).toBeInTheDocument();
    expect(screen.getByText("Announcement of Annual Results")).toBeInTheDocument();
    expect(screen.getByText("Circular")).toBeInTheDocument();
  });

  it("renders Chinese headers and titles", () => {
    renderWithLocale(<AnnouncementsTable rows={getAnnouncements("zh")} />, "zh");
    expect(screen.getByText("日期")).toBeInTheDocument();
    expect(screen.getByText("文件")).toBeInTheDocument();
    expect(screen.getByText("通函")).toBeInTheDocument();
  });

  it("links are external and open in a new tab", () => {
    renderWithLocale(<AnnouncementsTable rows={getAnnouncements("en")} />);
    const link = screen.getByText("Announcement of Annual Results");
    expect(link).toHaveAttribute("href", "https://www1.hkexnews.hk/");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
