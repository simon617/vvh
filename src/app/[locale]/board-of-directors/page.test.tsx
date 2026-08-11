import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import BoardOfDirectorsPage, { generateMetadata } from "./page";
import { renderWithLocale } from "@/test/utils";

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

describe("Board of Directors page template", () => {
  it("renders director categories and all names", () => {
    renderWithLocale(
      <BoardOfDirectorsPage params={{ locale: "en" }} />
    );
    expect(screen.getByRole("heading", { level: 1, name: "Board of Directors" })).toBeInTheDocument();
    expect(screen.getByText("Executive Directors")).toBeInTheDocument();
    expect(screen.getByText("Independent Non-Executive Directors")).toBeInTheDocument();
    expect(screen.getByText("Mr. Lo Luen Chuen")).toBeInTheDocument();
    expect(screen.getByText("Mr. Tsui Hing Chuen (JP)")).toBeInTheDocument();
  });

  it("renders Chinese director categories and names", () => {
    renderWithLocale(<BoardOfDirectorsPage params={{ locale: "zh" }} />, "zh");
    expect(screen.getByRole("heading", { level: 1, name: "董事會" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "執行董事" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "獨立非執行董事" })
    ).toBeInTheDocument();
    expect(screen.getByText("魯連城先生")).toBeInTheDocument();
  });

  it("expands a director bio on click", async () => {
    const user = userEvent.setup();
    renderWithLocale(<BoardOfDirectorsPage params={{ locale: "en" }} />);
    expect(screen.queryByText(/extensive experience in corporate management/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Lo Luen Chuen/i }));
    expect(screen.getByText(/extensive experience in corporate management/i)).toBeInTheDocument();
  });

  it("exposes localized metadata", () => {
    expect(generateMetadata({ params: { locale: "en" } }).title).toContain("Board of Directors");
    expect(generateMetadata({ params: { locale: "zh" } }).title).toContain("董事會");
  });
});
