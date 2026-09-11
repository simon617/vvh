import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TipTapEditor from "./TipTapEditor";

describe("TipTapEditor", () => {
  it("renders exactly the limited toolbar: bold, italic, paragraph, heading, link, subscript, superscript", () => {
    render(<TipTapEditor value="<p>Hello</p>" onChange={() => {}} />);

    expect(screen.getByLabelText("Bold")).toBeTruthy();
    expect(screen.getByLabelText("Italic")).toBeTruthy();
    expect(screen.getByLabelText("Paragraph")).toBeTruthy();
    expect(screen.getByLabelText("Heading")).toBeTruthy();
    expect(screen.getByLabelText("Link")).toBeTruthy();
    expect(screen.getByLabelText("Subscript")).toBeTruthy();
    expect(screen.getByLabelText("Superscript")).toBeTruthy();

    // No extra formatting buttons (lists, quote, code) are rendered.
    expect(screen.getAllByRole("button")).toHaveLength(7);
  });

  it("renders the initial HTML content", () => {
    render(
      <TipTapEditor value="<h2>Title</h2><p>Body text</p>" onChange={() => {}} />
    );

    const editable = document.querySelector(".ProseMirror");
    expect(editable).toBeTruthy();
    expect(editable?.textContent).toContain("Title");
    expect(editable?.textContent).toContain("Body text");
  });

  it("renders links with noopener noreferrer + blank target", () => {
    render(
      <TipTapEditor
        value='<p><a href="https://example.com">Docs</a></p>'
        onChange={() => {}}
      />
    );

    const anchor = document.querySelector("a");
    expect(anchor).toBeTruthy();
    expect(anchor?.getAttribute("href")).toBe("https://example.com");
    expect(anchor?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(anchor?.getAttribute("target")).toBe("_blank");
  });

  it("renders subscript and superscript marks from the input HTML", () => {
    render(
      <TipTapEditor
        value="<p>H<sub>2</sub>O and E=mc<sup>2</sup></p>"
        onChange={() => {}}
      />
    );

    expect(document.querySelector("sub")?.textContent).toBe("2");
    expect(document.querySelector("sup")?.textContent).toBe("2");
  });
});