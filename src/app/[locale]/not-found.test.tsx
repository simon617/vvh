import { describe, expect, it, vi } from "vitest";
import { renderWithLocale } from "@/test/utils";
import NotFound from "./not-found";

// The 404 page derives its locale from the `x-locale` request header set by
// middleware (see src/middleware.ts and not-found.tsx) rather than route params.
// Mock next/headers — mirroring the other page tests — and let each test choose
// the active locale. `vi.hoisted` keeps the mock available to the factory above
// the hoisted `vi.mock` call.
const { mockHeaders } = vi.hoisted(() => ({
  mockHeaders: vi.fn(() => new Map([["x-locale", "en"]])),
}));

vi.mock("next/headers", () => ({ headers: mockHeaders }));

describe("[locale] not-found page (deliverable 4.7 / WEB-08)", () => {
  it("renders localized copy for English and links home in the current locale", async () => {
    mockHeaders.mockReturnValue(new Map([["x-locale", "en"]]));
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
    mockHeaders.mockReturnValue(new Map([["x-locale", "zh"]]));
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