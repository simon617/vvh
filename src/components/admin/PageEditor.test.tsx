import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PageEditor from "./PageEditor";
import { renderWithLocale } from "@/test/utils";

const { mockUsePathname, mockUseSearchParams, mockRouterReplace } = vi.hoisted(
  () => ({
    mockUsePathname: vi.fn(),
    mockUseSearchParams: vi.fn(),
    mockRouterReplace: vi.fn(),
  })
);

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
  useRouter: () => ({ replace: mockRouterReplace }),
}));

function contentRow(locale: "en" | "zh") {
  return {
    id: 1,
    pageId: 1,
    locale,
    isPublished: true,
    title: locale === "en" ? "Home" : "首頁",
    metaTitle: null,
    metaDescription: null,
    heroImage: null,
    contentHtml: `<p>Welcome</p>`,
    breadcrumbLabel: null,
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  };
}

describe("PageEditor", () => {
  beforeEach(() => {
    mockUsePathname.mockReset().mockReturnValue("/en/admin/pages/home");
    mockUseSearchParams.mockReset().mockReturnValue(
      new URLSearchParams("tab=en")
    );
    mockRouterReplace.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders both locale tabs and the active locale's fields", () => {
    renderWithLocale(
      <PageEditor slug="home" initialEn={contentRow("en")} initialZh={null} />
    );

    expect(screen.getByLabelText("English")).toBeTruthy();
    expect(screen.getByLabelText("Chinese")).toBeTruthy();

    const title = screen.getByLabelText("Title (EN)") as HTMLInputElement;
    expect(title.value).toBe("Home");

    const publish = screen.getByTestId("publish-en") as HTMLInputElement;
    expect(publish.checked).toBe(true);
  });

  it("shows an 'Unsaved changes' indicator when the active locale is edited", () => {
    renderWithLocale(
      <PageEditor slug="home" initialEn={contentRow("en")} initialZh={null} />
    );

    fireEvent.change(screen.getByLabelText("Title (EN)"), {
      target: { value: "New Home" },
    });

    expect(screen.getByText("Unsaved changes")).toBeTruthy();
  });

  it("saves the active locale to PUT /api/pages/[slug]", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ content: contentRow("en") }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    renderWithLocale(
      <PageEditor slug="home" initialEn={contentRow("en")} initialZh={null} />
    );

    fireEvent.change(screen.getByLabelText("Title (EN)"), {
      target: { value: "Edited Home" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        "/api/pages/home",
        expect.objectContaining({ method: "PUT" })
      )
    );

    const body = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string
    );
    expect(body.locale).toBe("en");
    expect(body.title).toBe("Edited Home");
    expect(body.isPublished).toBe(true);
  });
});