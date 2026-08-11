import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CorporateCommunicationsPage from "./page";
import { renderWithLocale } from "@/test/utils";

vi.mock("next/headers", () => ({
  headers: () => new Map([["x-pathname", "/en/corporate-communications"]]),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Corporate Communications page (rich text)", () => {
  it("renders heading and body in English", () => {
    renderWithLocale(<CorporateCommunicationsPage params={{ locale: "en" }} />);
    expect(screen.getByRole("heading", { level: 1, name: "Corporate Communications" })).toBeInTheDocument();
    expect(screen.getByText(/communicates with shareholders/i)).toBeInTheDocument();
  });

  it("renders heading and body in Chinese", () => {
    renderWithLocale(<CorporateCommunicationsPage params={{ locale: "zh" }} />, "zh");
    expect(screen.getByRole("heading", { level: 1, name: "公司通訊" })).toBeInTheDocument();
    expect(screen.getByText(/與股東溝通/i)).toBeInTheDocument();
  });
});
