import { describe, expect, it } from "vitest";
import { getPlaceholder, PLACEHOLDER_SLUGS } from "./placeholders";
import { NAV_SLUGS } from "./navigation";

describe("placeholders", () => {
  it("provides placeholder content for every nav slug in both locales", () => {
    for (const slug of NAV_SLUGS) {
      for (const locale of ["en", "zh"] as const) {
        const data = getPlaceholder(slug, locale);
        expect(data, `${slug} (${locale}) should have data`).not.toBeNull();
        expect(data?.title, `${slug} (${locale}) title`).toBeTruthy();
        expect(data?.contentHtml, `${slug} (${locale}) content`).toBeTruthy();
      }
    }
  });

  it("exposes the same slugs as navigation", () => {
    expect(PLACEHOLDER_SLUGS.sort()).toEqual([...NAV_SLUGS].sort());
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