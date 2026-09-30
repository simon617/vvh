import { describe, expect, it } from "vitest";
import {
  catalogEnvelopeFor,
  catalogRowsFor,
  catalogSlugFor,
} from "../../scripts/report-catalog";
import { getReportRows } from "./report-rows";

describe("report-catalog → seed rows (from tools/*.ps1)", () => {
  it("maps catalog page buckets to public slugs", () => {
    expect(catalogSlugFor("fr")).toBe("financial-reports");
    expect(catalogSlugFor("esg")).toBe("esg-reports");
  });

  it("covers the full Financial + ESG catalogs for both locales", () => {
    expect(catalogRowsFor("financial-reports", "en")).toHaveLength(39);
    expect(catalogRowsFor("financial-reports", "zh")).toHaveLength(39);
    expect(catalogRowsFor("esg-reports", "en")).toHaveLength(9);
    expect(catalogRowsFor("esg-reports", "zh")).toHaveLength(9);
  });

  it("produces unique, stable row ids", () => {
    for (const slug of ["financial-reports", "esg-reports"]) {
      const rows = catalogRowsFor(slug, "en");
      const ids = rows.map((row) => row.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("builds /uploads/reports/<locale>/<file> download URLs", () => {
    const en = catalogRowsFor("financial-reports", "en");
    expect(
      en.every((row) => row.url.startsWith("/uploads/reports/en/"))
    ).toBe(true);
    const zh = catalogRowsFor("esg-reports", "zh");
    expect(
      zh.every((row) => row.url.startsWith("/uploads/reports/zh/"))
    ).toBe(true);
  });

  it("serializes an envelope that getReportRows parses back unchanged", () => {
    for (const slug of ["financial-reports", "esg-reports"]) {
      for (const locale of ["en", "zh"] as const) {
        const envelope = catalogEnvelopeFor(slug, locale);
        expect(envelope).not.toBeNull();
        expect(getReportRows(envelope)).toEqual(catalogRowsFor(slug, locale));
      }
    }
  });

  it("returns null for a non-report slug", () => {
    expect(catalogEnvelopeFor("home", "en")).toBeNull();
  });
});