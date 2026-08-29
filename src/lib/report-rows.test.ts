import { describe, expect, it } from "vitest";
import {
  buildReportContent,
  getReportRows,
  makeRowId,
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