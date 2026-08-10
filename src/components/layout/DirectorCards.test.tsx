import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import DirectorCards, { type Director } from "./DirectorCards";

const directors: Director[] = [
  {
    name: "Mr. Lo Luen Chuen",
    title: "Chairman",
    category: "Executive Directors",
    bio: "Extensive experience in corporate management.",
  },
  {
    name: "Mr. Tsui Hing Chuen",
    title: "Independent Non-Executive Director",
    category: "Independent Non-Executive Directors",
    bio: "Holds various public service roles.",
  },
];

describe("DirectorCards", () => {
  it("renders director names and titles", () => {
    render(<DirectorCards directors={directors} />);
    expect(screen.getByText("Mr. Lo Luen Chuen")).toBeInTheDocument();
    expect(screen.getByText("Chairman")).toBeInTheDocument();
    expect(screen.getByText("Mr. Tsui Hing Chuen")).toBeInTheDocument();
  });

  it("renders category headings", () => {
    render(<DirectorCards directors={directors} />);
    expect(screen.getByText("Executive Directors")).toBeInTheDocument();
    expect(
      screen.getByText("Independent Non-Executive Directors")
    ).toBeInTheDocument();
  });

  it("hides bios by default", () => {
    render(<DirectorCards directors={directors} />);
    expect(
      screen.queryByText(/extensive experience in corporate management/i)
    ).not.toBeInTheDocument();
  });

  it("expands bio when clicking the director button", async () => {
    const user = userEvent.setup();
    render(<DirectorCards directors={directors} />);
    await user.click(screen.getByRole("button", { name: /Lo Luen Chuen/i }));
    expect(
      screen.getByText(/extensive experience in corporate management/i)
    ).toBeInTheDocument();
  });

  it("collapses bio when clicking again", async () => {
    const user = userEvent.setup();
    render(<DirectorCards directors={directors} />);
    const button = screen.getByRole("button", { name: /Lo Luen Chuen/i });
    await user.click(button);
    expect(
      screen.getByText(/extensive experience in corporate management/i)
    ).toBeInTheDocument();
    await user.click(button);
    expect(
      screen.queryByText(/extensive experience in corporate management/i)
    ).not.toBeInTheDocument();
  });
});