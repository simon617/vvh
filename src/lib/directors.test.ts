import { describe, expect, it } from "vitest";
import { getDirectors } from "./directors";

describe("directors data layer", () => {
  it("returns 10 directors in English across all categories", () => {
    const directors = getDirectors("en");
    expect(directors).toHaveLength(10);
    const categories = new Set(directors.map((d) => d.category));
    expect(categories.has("Executive Directors")).toBe(true);
    expect(categories.has("Independent Non-Executive Directors")).toBe(true);
  });

  it("contains all 10 director names from PRD 2.2.2", () => {
    const names = getDirectors("en").map((d) => d.name);
    expect(names).toContain("Mr. Lo Luen Chuen");
    expect(names.length).toBe(10);
  });

  it("returns localized categories and names in Chinese", () => {
    const directors = getDirectors("zh");
    expect(directors).toHaveLength(10);
    expect(directors[0].name).toBe("魯連城先生");
    const categories = new Set(directors.map((d) => d.category));
    expect(categories.has("執行董事")).toBe(true);
    expect(categories.has("獨立非執行董事")).toBe(true);
  });

  it("every director has a non-empty bio", () => {
    for (const locale of ["en", "zh"] as const) {
      for (const director of getDirectors(locale)) {
        expect(director.bio).toBeTruthy();
      }
    }
  });
});
