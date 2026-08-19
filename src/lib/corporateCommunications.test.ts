import { describe, expect, it } from "vitest";
import { getCorporateCommunications } from "./corporateCommunications";

describe("corporate communications data layer", () => {
  it("returns the English corporate communications document", () => {
    const rows = getCorporateCommunications("en");
    expect(rows).toHaveLength(1);
    expect(rows[0].date).toBe("January 2024");
    expect(rows[0].title).toBe(
      "Arrangements Regarding Dissemination of Corporate Communications"
    );
    expect(rows[0].url).toBe("/pdf/communication/e_Communications202401.pdf");
  });

  it("returns the Chinese corporate communications document", () => {
    const rows = getCorporateCommunications("zh");
    expect(rows[0].date).toBe("2024年1月");
    expect(rows[0].title).toBe("有關發佈公司通訊之安排");
    expect(rows[0].url).toBe("/pdf/communication/c_Communications202401.pdf");
  });

  it("every row has an id, date, title and url", () => {
    for (const locale of ["en", "zh"] as const) {
      for (const row of getCorporateCommunications(locale)) {
        expect(row.id).toBeTruthy();
        expect(row.date).toBeTruthy();
        expect(row.title).toBeTruthy();
        expect(row.url).toBeTruthy();
      }
    }
  });
});