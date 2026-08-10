import { describe, expect, it } from "vitest";
import { getNavGroups, getNavItems, NAV_SLUGS } from "./navigation";

describe("navigation", () => {
  it("returns 4 nav groups with correct labels", () => {
    const groups = getNavGroups("en");
    expect(groups).toHaveLength(4);
    expect(groups.map((g) => g.label)).toEqual([
      "Corporate Information",
      "Corporate Governance",
      "Investor Relations",
      "Contact Us",
    ]);
  });

  it("returns all 10 nav items with locale-prefixed hrefs", () => {
    const items = getNavItems("en");
    expect(items).toHaveLength(10);
    expect(items[0].href).toBe("/en");
    expect(items[1].href).toBe("/en/board-of-directors");
    expect(items[2].href).toBe("/en/corporate-details");
    expect(items[3].href).toBe("/en/corporate-governance");
    expect(items[4].href).toBe("/en/announcements");
    expect(items[5].href).toBe("/en/financial-reports");
    expect(items[6].href).toBe("/en/esg-reports");
    expect(items[7].href).toBe("/en/lost-share-certificates");
    expect(items[8].href).toBe("/en/corporate-communications");
    expect(items[9].href).toBe("/en/contact");
  });

  it("prefixes hrefs with the requested locale", () => {
    const items = getNavItems("zh");
    expect(items[0].href).toBe("/zh");
    expect(items[4].href).toBe("/zh/announcements");
  });

  it("exposes all 10 page slugs", () => {
    expect(NAV_SLUGS).toHaveLength(10);
    expect(NAV_SLUGS).toContain("home");
    expect(NAV_SLUGS).toContain("board-of-directors");
    expect(NAV_SLUGS).toContain("financial-reports");
    expect(NAV_SLUGS).toContain("contact");
  });
});