import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ContentWithSidebar from "./ContentWithSidebar";

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

describe("ContentWithSidebar", () => {
  it("renders the page title as heading", () => {
    render(<ContentWithSidebar slug="corporate-governance" locale="en" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Corporate Governance" })
    ).toBeInTheDocument();
  });

  it("renders breadcrumb navigation", () => {
    render(<ContentWithSidebar slug="corporate-governance" locale="en" />);
    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders the page content body", () => {
    render(<ContentWithSidebar slug="corporate-governance" locale="en" />);
    expect(screen.getByText(/committed to maintaining high standards/i)).toBeInTheDocument();
  });

  it("renders localized content for zh", () => {
    render(<ContentWithSidebar slug="corporate-governance" locale="zh" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "企業管治" })
    ).toBeInTheDocument();
    expect(screen.getByText(/企業管治守則/i)).toBeInTheDocument();
  });

  it("renders nothing for unknown slug", () => {
    const { container } = render(
      <ContentWithSidebar slug="unknown-page" locale="en" />
    );
    expect(container).toBeEmptyDOMElement();
  });
});