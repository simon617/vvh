import { describe, expect, it } from "vitest";
import {
  buildReportContent,
  getReportRows,
  makeRowId,
  reportDateKey,
  sortReportRowsByDate,
} from "./report-rows";

describe("report-rows", () => {
  const rows = [
    { id: "a", date: "2025", title: "ESG Report 2025", url: "/uploads/reports/en/x.pdf" },
    { id: "b", date: "2024", title: "ESG Report 2024", url: "/uploads/reports/en/y.pdf" },
  ];

  it("round-trips rows through the envelope", () => {
    const content = buildReportContent(rows);
    expect(getReportRows(content)).toEqual(rows);
  });

  it("returns null for ordinary (non-report) HTML content", () => {
    expect(getReportRows("<p>hello</p>")).toBeNull();
    expect(getReportRows("")).toBeNull();
    expect(getReportRows(null)).toBeNull();
    expect(getReportRows(undefined)).toBeNull();
  });

  it("returns null for a JSON envelope of the wrong type", () => {
    expect(getReportRows('{"__type":"keyvalue","rows":[]}')).toBeNull();
  });

  it("returns null when rows is not an array", () => {
    expect(getReportRows('{"__type":"reports","rows":"nope"}')).toBeNull();
  });

  it("produces unique, string ids for new rows", () => {
    const a = makeRowId();
    const b = makeRowId();
    expect(a).not.toBe(b);
    expect(typeof a).toBe("string");
  });
});

describe("reportDateKey", () => {
  it("normalises English month-year dates chronologically", () => {
    expect(reportDateKey("October 2025")).toBe("2025-10");
    expect(reportDateKey("March 2025")).toBe("2025-03");
    expect(reportDateKey("October 2024")).toBe("2024-10");
    expect(reportDateKey("January 2024")).toBe("2024-01");
  });

  it("normalises Chinese dates chronologically", () => {
    expect(reportDateKey("2025年10月")).toBe("2025-10");
    expect(reportDateKey("2025年3月")).toBe("2025-03");
    expect(reportDateKey("2024年10月")).toBe("2024-10");
    expect(reportDateKey("2024年")).toBe("2024-00");
  });

  it("handles year-only and ISO dates", () => {
    expect(reportDateKey("2025")).toBe("2025");
    expect(reportDateKey("2025-12-31")).toBe("2025-12");
  });
});

describe("sortReportRowsByDate", () => {
  const row = (id: string, date: string) => ({
    id,
    date,
    title: `Report ${id}`,
    url: `/r/${id}.pdf`,
  });

  it("orders annual and interim reports newest-first (EN)", () => {
    const dates = sortReportRowsByDate([
      row("a", "March 2024"),
      row("b", "October 2024"),
      row("c", "March 2025"),
      row("d", "October 2025"),
    ]).map((r) => r.date);
    expect(dates).toEqual([
      "October 2025",
      "March 2025",
      "October 2024",
      "March 2024",
    ]);
  });

  it("orders Chinese reports newest-first", () => {
    const dates = sortReportRowsByDate([
      row("a", "2024年3月"),
      row("b", "2025年10月"),
      row("c", "2025年3月"),
      row("d", "2024年10月"),
    ]).map((r) => r.date);
    expect(dates).toEqual(["2025年10月", "2025年3月", "2024年10月", "2024年3月"]);
  });

  it("does not mutate the input array", () => {
    const rows = [row("a", "October 2025"), row("b", "March 2025")];
    sortReportRowsByDate(rows);
    expect(rows.map((r) => r.date)).toEqual(["October 2025", "March 2025"]);
  });
});