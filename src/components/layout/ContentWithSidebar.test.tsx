import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContentWithSidebar from "./ContentWithSidebar";
import { getPlaceholder } from "@/lib/placeholders";

const { mockGetPageData } = vi.hoisted(() => ({ mockGetPageData: vi.fn() }));
vi.mock("@/lib/pages", () => ({ getPageData: mockGetPageData }));

// Mock next/headers (server-only API)
vi.mock("next/headers", () => ({
  headers: () => new Map([["x-pathname", "/en/corporate-governance"]]),
}));

// Mock next/link to render a simple anchor
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Unknown slug / unpublished locale → notFound() (Decision D8)
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

describe("ContentWithSidebar", () => {
  beforeEach(() => {
    mockGetPageData.mockImplementation(async (slug, locale) =>
      getPlaceholder(slug, locale)
    );
  });

  it("renders the page title as heading", async () => {
    render(await ContentWithSidebar({ slug: "corporate-governance", locale: "en" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Corporate Governance" })
    ).toBeInTheDocument();
  });

  it("renders breadcrumb navigation", async () => {
    render(await ContentWithSidebar({ slug: "corporate-governance", locale: "en" }));
    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders the page content body", async () => {
    render(await ContentWithSidebar({ slug: "corporate-governance", locale: "en" }));
    expect(
      screen.getByText("Memorandum of Association and Articles of Association")
    ).toBeInTheDocument();
  });

  it("renders localized content for zh", async () => {
    render(await ContentWithSidebar({ slug: "corporate-governance", locale: "zh" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "企業管治" })
    ).toBeInTheDocument();
    expect(screen.getByText("公司組織章程大綱及組織章程細則")).toBeInTheDocument();
  });

  it("renders the hero image when one is present", async () => {
    const base = getPlaceholder("corporate-governance", "en");
    mockGetPageData.mockResolvedValue({
      ...base,
      heroImage: "/uploads/images/hero.jpg",
    });
    render(await ContentWithSidebar({ slug: "corporate-governance", locale: "en" }));
    expect(screen.getByTestId("hero-image")).toHaveAttribute(
      "src",
      "/uploads/images/hero.jpg"
    );
  });

  it("404s for an unknown slug / unpublished locale", async () => {
    mockGetPageData.mockResolvedValue(null);
    await expect(
      ContentWithSidebar({ slug: "unknown-page", locale: "en" })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
