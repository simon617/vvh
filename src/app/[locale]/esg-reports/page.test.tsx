import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EsgReportsPage from "./page";
import { renderWithLocale } from "@/test/utils";

vi.mock("next/headers", () => ({
  headers: () => new Map([["x-pathname", "/en/esg-reports"]]),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ESG Reports page (reports table)", () => {
  it("renders table with placeholder rows in English", () => {
    renderWithLocale(<EsgReportsPage params={{ locale: "en" }} />);
    expect(screen.getByRole("heading", { level: 1, name: "ESG Reports" })).toBeInTheDocument();
    expect(screen.getByText("ESG Report 2025")).toBeInTheDocument();
  });

  it("renders localized rows in Chinese", () => {
    renderWithLocale(<EsgReportsPage params={{ locale: "zh" }} />, "zh");
    expect(screen.getByRole("heading", { level: 1, name: "環境、社會及管治報告" })).toBeInTheDocument();
    expect(screen.getByText("2025環境、社會及管治報告")).toBeInTheDocument();
  });
});
