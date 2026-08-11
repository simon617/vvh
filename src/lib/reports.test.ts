import { describe, expect, it } from "vitest";
import { getFinancialReports, getEsgReports } from "./reports";

describe("reports data layer", () => {
  it("returns financial reports in English", () => {
    const rows = getFinancialReports("en");
    expect(rows).toHaveLength(2);
    expect(rows[0].title).toBe("Annual Report 2025");
    expect(rows[0].url).toBe("/pdf/AnnualReport2025.pdf");
  });

  it("returns localized financial report titles in Chinese", () => {
    const rows = getFinancialReports("zh");
    expect(rows[0].title).toBe("2025年報");
    expect(rows[1].title).toBe("2025中期報告");
  });

  it("returns ESG reports for both locales", () => {
    expect(getEsgReports("en")).toHaveLength(1);
    expect(getEsgReports("zh")[0].title).toBe("2025環境、社會及管治報告");
  });

  it("every report row has an id, date, title and url", () => {
    for (const locale of ["en", "zh"] as const) {
      for (const row of [...getFinancialReports(locale), ...getEsgReports(locale)]) {
        expect(row.id).toBeTruthy();
        expect(row.date).toBeTruthy();
        expect(row.title).toBeTruthy();
        expect(row.url).toBeTruthy();
      }
    }
  });
});
