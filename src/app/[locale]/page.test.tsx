import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage, { generateMetadata } from "./page";
import { renderWithLocale } from "@/test/utils";

describe("Home page template", () => {
  it("renders hero, metrics and reports in English", () => {
    renderWithLocale(<HomePage params={{ locale: "en" }} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Vision Values Holdings/i })
    ).toBeInTheDocument();
    expect(screen.getByText("HKEX: 862")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Latest Reports" })
    ).toBeInTheDocument();
  });

  it("renders localized Chinese content", () => {
    renderWithLocale(<HomePage params={{ locale: "zh" }} />, "zh");
    expect(
      screen.getByRole("heading", { level: 1, name: "遠見控股有限公司" })
    ).toBeInTheDocument();
    expect(screen.getByText("香港交易所：862")).toBeInTheDocument();
  });

  it("exposes localized metadata", () => {
    expect(generateMetadata({ params: { locale: "en" } }).title).toContain(
      "Vision Values Holdings Limited"
    );
    expect(generateMetadata({ params: { locale: "zh" } }).title).toContain(
      "遠見控股有限公司"
    );
  });
});
