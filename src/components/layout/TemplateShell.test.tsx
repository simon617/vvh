import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TemplateShell from "./TemplateShell";

// Mock next/headers (server-only API)
vi.mock("next/headers", () => ({
  headers: () => new Map([["x-pathname", "/en/board-of-directors"]]),
}));
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
});
