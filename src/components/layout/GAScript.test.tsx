import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import GAScript from "./GAScript";

describe("GAScript (GA4 analytics, deliverable 4.3)", () => {
  it("renders nothing when no measurement ID is configured", () => {
    const { container } = render(<GAScript measurementId="" />);
    expect(container.innerHTML).toBe("");
  });

  it("injects the gtag loader for the configured measurement ID", () => {
    render(<GAScript measurementId="G-ABC123" />);
    const loader = document.querySelector(
      'script[src*="googletagmanager.com/gtag/js?id=G-ABC123"]'
    );
    expect(loader).not.toBeNull();
  });

  it("includes the gtag init snippet with the measurement ID", async () => {
    render(<GAScript measurementId="G-ABC123" />);
    // next/script appends its tags to document.head, not the render container.
    await vi.waitFor(() => {
      const scripts = Array.from(
        document.querySelectorAll("script")
      ) as HTMLScriptElement[];
      expect(
        scripts.some((s) =>
          (s.textContent ?? "").includes("gtag('config','G-ABC123')")
        )
      ).toBe(true);
    });
  });
});