import { describe, expect, it } from "vitest";
import { getAnnouncements } from "./announcements";

describe("announcements data layer", () => {
  it("returns announcements with HKEX links", () => {
    const rows = getAnnouncements("en");
    expect(rows).toHaveLength(2);
    expect(rows[0].title).toBe("Announcement of Annual Results");
    expect(rows[0].url).toContain("hkexnews");
  });

  it("returns localized announcement titles", () => {
    const rows = getAnnouncements("zh");
    expect(rows[0].title).toBe("全年業績公告");
    expect(rows[1].title).toBe("通函");
  });

  it("every announcement has a date, title and external url", () => {
    for (const locale of ["en", "zh"] as const) {
      for (const row of getAnnouncements(locale)) {
        expect(row.date).toBeTruthy();
        expect(row.title).toBeTruthy();
        expect(row.url).toMatch(/^https:\/\//);
      }
    }
  });
});
