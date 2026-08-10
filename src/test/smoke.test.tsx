import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function HelloWorld() {
  return <h1>Hello World</h1>;
}

describe("test infrastructure", () => {
  it("renders a component with testing-library", () => {
    render(<HelloWorld />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Hello World"
    );
  });
});