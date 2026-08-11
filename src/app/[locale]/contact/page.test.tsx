import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ContactPage, { generateMetadata } from "./page";
import { renderWithLocale } from "@/test/utils";

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
  it("renders the form fields and buttons", () => {
    renderWithLocale(<ContactPage params={{ locale: "en" }} />);
    expect(screen.getByRole("heading", { level: 1, name: "Contact Us" })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Subject/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Message/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("renders Chinese labels", () => {
    renderWithLocale(<ContactPage params={{ locale: "zh" }} />, "zh");
    expect(screen.getByRole("heading", { level: 1, name: "聯絡我們" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "遞交" })).toBeInTheDocument();
  });

  it("exposes localized metadata", () => {
    expect(generateMetadata({ params: { locale: "en" } }).title).toContain("Contact Us");
    expect(generateMetadata({ params: { locale: "zh" } }).title).toContain("聯絡我們");
  });
});
