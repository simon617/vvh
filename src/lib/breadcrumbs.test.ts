import { describe, expect, it } from "vitest";
import { getBreadcrumbs } from "./breadcrumbs";

describe("breadcrumbs", () => {
  it("returns just Home for the home page", () => {
    const crumbs = getBreadcrumbs("/en", "en");
    expect(crumbs).toEqual([{ label: "Home", href: "/en" }]);
  });

  it("returns Home → group → page for a nested page", () => {
    const crumbs = getBreadcrumbs("/en/financial-reports", "en");
    expect(crumbs).toEqual([
      { label: "Home", href: "/en" },
      { label: "Investor Relations", href: "/en/financial-reports" },
      { label: "Financial Reports", href: "/en/financial-reports" },
    ]);
  });

  it("returns Home → group for a page in Corporate Information", () => {
    const crumbs = getBreadcrumbs("/en/board-of-directors", "en");
    expect(crumbs).toEqual([
      { label: "Home", href: "/en" },
      { label: "Corporate Information", href: "/en/board-of-directors" },
      { label: "Board of Directors", href: "/en/board-of-directors" },
    ]);
  });

  it("localizes labels for zh", () => {
    const crumbs = getBreadcrumbs("/zh/announcements", "zh");
    expect(crumbs[0].label).toBe("首頁");
    expect(crumbs[1].label).toBe("投資者關係");
    expect(crumbs[2].label).toBe("公告及通函");
  });

  it("returns empty array for unknown slug", () => {
    const crumbs = getBreadcrumbs("/en/unknown-page", "en");
    expect(crumbs).toEqual([]);
  });
});