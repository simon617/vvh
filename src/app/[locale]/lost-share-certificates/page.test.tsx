import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LostShareCertificatesPage from "./page";
import { getPlaceholder } from "@/lib/placeholders";
import { renderWithLocale } from "@/test/utils";

const { mockGetPageData } = vi.hoisted(() => ({ mockGetPageData: vi.fn() }));
vi.mock("@/lib/pages", () => ({ getPageData: mockGetPageData }));

vi.mock("next/headers", () => ({
  headers: () => new Map([["x-pathname", "/en/lost-share-certificates"]]),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Lost Share Certificates page (rich text)", () => {
  beforeEach(() => {
    mockGetPageData.mockImplementation(async (slug, locale) =>
      getPlaceholder(slug, locale)
    );
  });

  it("renders heading and body in English", async () => {
    renderWithLocale(
      await LostShareCertificatesPage({ params: { locale: "en" } })
    );
    expect(screen.getByRole("heading", { level: 1, name: "Lost Share Certificates" })).toBeInTheDocument();
    expect(
      screen.getByText(/Replacement of Lost Share Certificates/i)
    ).toBeInTheDocument();
    expect(screen.getByText("There is currently no notice posted.")).toBeInTheDocument();
  });

  it("renders heading and body in Chinese", async () => {
    renderWithLocale(
      await LostShareCertificatesPage({ params: { locale: "zh" } }),
      "zh"
    );
    expect(screen.getByRole("heading", { level: 1, name: "遺失股票證書" })).toBeInTheDocument();
    expect(screen.getByText(/已遺失的股份證明書/)).toBeInTheDocument();
    expect(screen.getByText("暫時沒有公告刊登。")).toBeInTheDocument();
  });
});
