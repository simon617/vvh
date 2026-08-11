import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomeTemplate from "./HomeTemplate";
import { getPlaceholder } from "@/lib/placeholders";
import { renderWithLocale } from "@/test/utils";

function pageData(locale: "en" | "zh") {
  const data = getPlaceholder("home", locale);
  if (!data) throw new Error("missing home placeholder");
  return data;
}

describe("HomeTemplate", () => {
  it("renders hero, metrics and latest reports (English)", () => {
    renderWithLocale(<HomeTemplate pageData={pageData("en")} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Vision Values Holdings Limited" })
    ).toBeInTheDocument();
    expect(screen.getByText("HKEX: 862")).toBeInTheDocument();
    expect(screen.getByText("Listed")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Latest Reports" })
    ).toBeInTheDocument();
  });

  it("renders localized hero, metrics and reports (Chinese)", () => {
    renderWithLocale(<HomeTemplate pageData={pageData("zh")} />, "zh");
    expect(
      screen.getByRole("heading", { level: 1, name: "遠見控股有限公司" })
    ).toBeInTheDocument();
    expect(screen.getByText("香港交易所：862")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "最新報告" })
    ).toBeInTheDocument();
  });
});
