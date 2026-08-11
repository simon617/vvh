import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "./Footer";
import { renderWithLocale } from "@/test/utils";

describe("Footer", () => {
  it("renders the English copyright and contact link", () => {
    renderWithLocale(<Footer locale="en" />);
    expect(
      screen.getByText(/all rights reserved/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toHaveAttribute(
      "href",
      "/en/contact"
    );
  });

  it("renders the localized Chinese copyright and contact link", () => {
    renderWithLocale(<Footer locale="zh" />, "zh");
    expect(screen.getByText(/版權所有/)).toBeInTheDocument();
    expect(screen.getByText("聯絡我們")).toBeInTheDocument();
    expect(screen.getByText("聯絡我們")).toHaveAttribute(
      "href",
      "/zh/contact"
    );
  });
});
