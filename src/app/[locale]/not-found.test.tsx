import { describe, expect, it, vi } from "vitest";
import { renderWithLocale } from "@/test/utils";
import NotFound from "./not-found";

// The 404 page derives its locale from the `x-locale` request header set by
// middleware (see src/middleware.ts and not-found.tsx), falling back to the
// route param when the header is absent.
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
      await NotFound({ params: Promise.resolve({ locale: "en" }) }),
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
      await NotFound({ params: Promise.resolve({ locale: "zh" }) }),
      "zh"
    );
    expect(
      view.getByRole("heading", { level: 2, name: "頁面未找到" })
    ).toBeInTheDocument();
    const link = view.getByRole("link", { name: "返回首頁" });
    expect(link.getAttribute("href")).toBe("/zh");
  });

  it("falls back to the route param when the x-locale header is absent", async () => {
    mockHeaders.mockReturnValue(new Map());
    const view = renderWithLocale(
      await NotFound({ params: Promise.resolve({ locale: "zh" }) }),
      "zh"
    );
    expect(
      view.getByRole("heading", { level: 2, name: "頁面未找到" })
    ).toBeInTheDocument();
  });

  it("falls back to the default locale when rendered without route props", async () => {
    // Regression: Next renders this boundary without route props (dev error
    // overlay / non-locale 404 paths), so `await params` is `undefined`. That
    // must not throw — the English fallback copy is rendered instead.
    mockHeaders.mockReturnValue(new Map());
    const view = renderWithLocale(await NotFound({}), "en");
    expect(
      view.getByRole("heading", { level: 2, name: "Page Not Found" })
    ).toBeInTheDocument();
    expect(
      view.getByRole("link", { name: "Back to Home" }).getAttribute("href")
    ).toBe("/en");
  });

  it("survives an undefined resolved params value and missing x-locale header", async () => {
    mockHeaders.mockReturnValue(new Map());
    const view = renderWithLocale(
      await NotFound({ params: Promise.resolve(undefined) }),
      "en"
    );
    expect(
      view.getByRole("heading", { level: 2, name: "Page Not Found" })
    ).toBeInTheDocument();
  });

  it("does not throw when headers() is called outside a request scope", async () => {
    mockHeaders.mockImplementation(() => {
      throw new Error("`headers` was called outside a request scope.");
    });
    const view = renderWithLocale(await NotFound({}), "en");
    expect(
      view.getByRole("heading", { level: 2, name: "Page Not Found" })
    ).toBeInTheDocument();
  });
});
