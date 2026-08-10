import { describe, expect, it } from "vitest";
import { getPageData } from "./pages";

describe("pages", () => {
  it("returns page data for a known slug and locale", () => {
    const data = getPageData("financial-reports", "en");
    expect(data).not.toBeNull();
    expect(data?.title).toBe("Financial Reports");
    expect(data?.contentHtml).toContain("Annual Report");
  });

  it("returns localized data for zh", () => {
    const data = getPageData("financial-reports", "zh");
    expect(data?.title).toBe("財務報告");
    expect(data?.contentHtml).toContain("年報");
  });

  it("returns null for unknown slug", () => {
    expect(getPageData("unknown-page", "en")).toBeNull();
  });

  it("returns null for unknown locale", () => {
    expect(getPageData("home", "fr" as "en")).toBeNull();
  });
});