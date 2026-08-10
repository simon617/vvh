import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Breadcrumb from "./Breadcrumb";

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

describe("Breadcrumb", () => {
  it("renders Home → group → page hierarchy", () => {
    render(<Breadcrumb pathname="/en/financial-reports" locale="en" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Investor Relations")).toBeInTheDocument();
    expect(screen.getByText("Financial Reports")).toBeInTheDocument();
  });

  it("marks the current page with aria-current", () => {
    render(<Breadcrumb pathname="/en/financial-reports" locale="en" />);
    const current = screen.getByText("Financial Reports");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("renders nothing for unknown path", () => {
    const { container } = render(
      <Breadcrumb pathname="/en/unknown-page" locale="en" />
    );
    expect(container).toBeEmptyDOMElement();
  });
});