import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MobileMenu from "./MobileMenu";
import { renderWithLocale } from "@/test/utils";

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

describe("MobileMenu", () => {
  it("shows the translated menu label and close aria-label in English", () => {
    renderWithLocale(
      <MobileMenu isOpen onClose={() => {}} locale="en" />
    );
    expect(screen.getByText("Menu")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
  });

  it("shows the translated menu label and close aria-label in Chinese", () => {
    renderWithLocale(
      <MobileMenu isOpen onClose={() => {}} locale="zh" />,
      "zh"
    );
    expect(screen.getByText("選單")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "關閉選單" })).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    const { container } = renderWithLocale(
      <MobileMenu isOpen={false} onClose={() => {}} locale="en" />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
