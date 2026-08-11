import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LostShareCertificatesPage from "./page";
import { renderWithLocale } from "@/test/utils";

vi.mock("next/headers", () => ({
  headers: () => new Map([["x-pathname", "/en/lost-share-certificates"]]),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Lost Share Certificates page (rich text)", () => {
  it("renders heading and body in English", () => {
    renderWithLocale(<LostShareCertificatesPage params={{ locale: "en" }} />);
    expect(screen.getByRole("heading", { level: 1, name: "Lost Share Certificates" })).toBeInTheDocument();
    expect(screen.getByText(/share certificate is lost/i)).toBeInTheDocument();
  });

  it("renders heading and body in Chinese", () => {
    renderWithLocale(<LostShareCertificatesPage params={{ locale: "zh" }} />, "zh");
    expect(screen.getByRole("heading", { level: 1, name: "遺失股票證書" })).toBeInTheDocument();
    expect(screen.getByText(/股票證書遺失/i)).toBeInTheDocument();
  });
});
