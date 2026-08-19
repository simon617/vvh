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

describe("Corporate Communications page (reports table)", () => {
  it("renders a sortable document table linked to a local PDF in English", () => {
    renderWithLocale(<CorporateCommunicationsPage params={{ locale: "en" }} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Corporate Communications" })
    ).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Document")).toBeInTheDocument();

    const link = screen.getByText(
      "Arrangements Regarding Dissemination of Corporate Communications"
    );
    expect(link).toHaveAttribute(
      "href",
      "/pdf/communication/e_Communications202401.pdf"
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders a localized document table linked to a local PDF in Chinese", () => {
    renderWithLocale(<CorporateCommunicationsPage params={{ locale: "zh" }} />, "zh");
    expect(screen.getByRole("heading", { level: 1, name: "公司通訊" })).toBeInTheDocument();
    expect(screen.getByText("日期")).toBeInTheDocument();
    expect(screen.getByText("文件")).toBeInTheDocument();

    const link = screen.getByText("有關發佈公司通訊之安排");
    expect(link).toHaveAttribute(
      "href",
      "/pdf/communication/c_Communications202401.pdf"
    );
    expect(link).toHaveAttribute("target", "_blank");
  });
});
