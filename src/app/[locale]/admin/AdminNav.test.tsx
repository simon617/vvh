import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithLocale } from "@/test/utils";
import AdminNav from "./AdminNav";

describe("AdminNav", () => {
  it("renders the dashboard, pages, settings and change-password links", () => {
    renderWithLocale(<AdminNav username="admin" locale="en" />);

    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));

    expect(hrefs).toContain("/en/admin");
    expect(hrefs).toContain("/en/admin/pages");
    expect(hrefs).toContain("/en/admin/settings");
    expect(hrefs).toContain("/en/admin/change-password");
  });

  it("prefixes links with the active locale", () => {
    renderWithLocale(<AdminNav username="admin" locale="zh" />);

    const hrefs = screen
      .getAllByRole("link")
      .map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/zh/admin/pages");
  });

  it("shows the username", () => {
    renderWithLocale(<AdminNav username="simon" locale="en" />);
    expect(screen.getByText("simon")).toBeTruthy();
  });
});