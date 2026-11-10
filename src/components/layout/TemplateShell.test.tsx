import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TemplateShell from "./TemplateShell";

// TemplateShell is a synchronous component: callers resolve the middleware
// `x-pathname` header (async in Next.js 15) and pass it in as a `pathname` prop,
// so the component itself no longer imports next/headers — nothing to mock.
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("TemplateShell", () => {
  it("renders the title in a gradient hero when no hero image is set", () => {
    render(
      <TemplateShell title="Board of Directors" locale="en">
        <p>Body</p>
      </TemplateShell>
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Board of Directors" })
    ).toBeInTheDocument();
    expect(screen.queryByTestId("hero-image")).not.toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("renders the header image instead of the gradient when a hero image is set", () => {
    render(
      <TemplateShell
        title="Board of Directors"
        locale="en"
        heroImage="/uploads/images/board.jpg"
      >
        <p>Body</p>
      </TemplateShell>
    );
    expect(screen.getByTestId("hero-image")).toHaveAttribute(
      "src",
      "/uploads/images/board.jpg"
    );
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("builds the breadcrumb trail from the pathname prop", () => {
    render(
      <TemplateShell
        title="Corporate Governance"
        locale="en"
        pathname="/en/corporate-governance"
      >
        <p>Body</p>
      </TemplateShell>
    );
    const nav = screen.getByLabelText("Breadcrumb");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveTextContent("Home");
  });

  it("falls back to the locale root breadcrumb when no pathname is provided", () => {
    render(
      <TemplateShell title="Contact Us" locale="en">
        <p>Body</p>
      </TemplateShell>
    );
    expect(screen.getByLabelText("Breadcrumb")).toHaveTextContent("Home");
  });

  it("localizes the breadcrumb for zh", () => {
    render(
      <TemplateShell title="聯絡我們" locale="zh" pathname="/zh">
        <p>Body</p>
      </TemplateShell>
    );
    expect(screen.getByLabelText("Breadcrumb")).toHaveTextContent("首頁");
  });
});
