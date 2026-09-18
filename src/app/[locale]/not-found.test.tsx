import { describe, expect, it } from "vitest";
import { renderWithLocale } from "@/test/utils";
import NotFound from "./not-found";

describe("[locale] not-found page (deliverable 4.7 / WEB-08)", () => {
  it("renders localized copy for English and links home in the current locale", async () => {
    const view = renderWithLocale(
      await NotFound({ params: { locale: "en" } }),
      "en"
    );
    expect(
      view.getByRole("heading", { level: 2, name: "Page Not Found" })
    ).toBeInTheDocument();
    const link = view.getByRole("link", { name: "Back to Home" });
    expect(link.getAttribute("href")).toBe("/en");
  });

  it("renders localized copy for Chinese and links home in the current locale", async () => {
    const view = renderWithLocale(
      await NotFound({ params: { locale: "zh" } }),
      "zh"
    );
    expect(
      view.getByRole("heading", { level: 2, name: "頁面未找到" })
    ).toBeInTheDocument();
    const link = view.getByRole("link", { name: "返回首頁" });
    expect(link.getAttribute("href")).toBe("/zh");
  });
});