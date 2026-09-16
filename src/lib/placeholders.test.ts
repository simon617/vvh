import { describe, expect, it } from "vitest";
import { getPlaceholder, PLACEHOLDER_SLUGS } from "./placeholders";
import { NAV_SLUGS } from "./navigation";

describe("placeholders", () => {
  it("provides placeholder content for every CMS nav slug in both locales", () => {
    for (const slug of NAV_SLUGS) {
      if (slug === "announcements") continue; // iframe-only — no placeholder
      for (const locale of ["en", "zh"] as const) {
        const data = getPlaceholder(slug, locale);
        expect(data, `${slug} (${locale}) should have data`).not.toBeNull();
        expect(data?.title, `${slug} (${locale}) title`).toBeTruthy();
        expect(data?.contentHtml, `${slug} (${locale}) content`).toBeTruthy();
      }
    }
  });

  it("has no placeholder for the iframe-only announcements page", () => {
    for (const locale of ["en", "zh"] as const) {
      expect(getPlaceholder("announcements", locale)).toBeNull();
    }
  });

  it("exposes every nav slug except announcements", () => {
    const expected = [...NAV_SLUGS]
      .filter((slug) => slug !== "announcements")
      .sort();
    expect(PLACEHOLDER_SLUGS.toSorted()).toEqual(expected);
  });

  it("returns null for unknown slug", () => {
    expect(getPlaceholder("unknown-page", "en")).toBeNull();
  });

  it("uses real company intro text for home page", () => {
    const en = getPlaceholder("home", "en");
    expect(en!.contentHtml).toContain("Hong Kong stock code: 862");
    expect(en!.contentHtml).toContain("property investment");

    const zh = getPlaceholder("home", "zh");
    expect(zh!.contentHtml).toContain("香港股票編號：862");
    expect(zh!.contentHtml).toContain("物業投資");
  });
});