import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContactPage, { generateMetadata } from "./page";
import { getPlaceholder } from "@/lib/placeholders";
import { renderWithLocale } from "@/test/utils";

const { mockGetPageData } = vi.hoisted(() => ({ mockGetPageData: vi.fn() }));
vi.mock("@/lib/pages", () => ({ getPageData: mockGetPageData }));

vi.mock("next/headers", () => ({
  headers: () => new Map([["x-pathname", "/en/contact"]]),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Contact page", () => {
  beforeEach(() => {
    mockGetPageData.mockImplementation(async (slug, locale) =>
      getPlaceholder(slug, locale)
    );
  });

  it("renders the form fields and buttons", async () => {
    renderWithLocale(await ContactPage({ params: { locale: "en" } }));
    expect(screen.getByRole("heading", { level: 1, name: "Contact Us" })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Subject/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Message/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("renders Chinese labels", async () => {
    renderWithLocale(await ContactPage({ params: { locale: "zh" } }), "zh");
    expect(screen.getByRole("heading", { level: 1, name: "聯絡我們" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "遞交" })).toBeInTheDocument();
  });

  it("exposes localized metadata", async () => {
    expect((await generateMetadata({ params: { locale: "en" } })).title).toContain("Contact Us");
    expect((await generateMetadata({ params: { locale: "zh" } })).title).toContain("聯絡我們");
  });
});
