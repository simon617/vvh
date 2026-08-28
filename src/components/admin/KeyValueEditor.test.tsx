import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import KeyValueEditor from "./KeyValueEditor";
import { renderWithLocale } from "@/test/utils";

const CONTENT_HTML =
  '<table>\n  <tbody>\n' +
  '    <tr><th style="text-align:left">Place of Incorporation</th><td>Cayman Islands</td></tr>\n' +
  "</tbody>\n</table>";

describe("KeyValueEditor", () => {
  it("loads existing table rows into key/value fields", () => {
    renderWithLocale(
      <KeyValueEditor value={CONTENT_HTML} onChange={vi.fn()} />
    );

    expect(
      screen.getByLabelText("Label 1") as HTMLInputElement
    ).toHaveValue("Place of Incorporation");
    expect(
      screen.getByLabelText("Value 1") as HTMLTextAreaElement
    ).toHaveValue("Cayman Islands");
  });

  it("rebuilds table HTML on edit via onChange", () => {
    const onChange = vi.fn();
    renderWithLocale(
      <KeyValueEditor value={CONTENT_HTML} onChange={onChange} />
    );

    fireEvent.change(screen.getByLabelText("Value 1"), {
      target: { value: "British Virgin Islands" },
    });

    expect(onChange).toHaveBeenCalledWith(expect.stringContaining("<table>"));
    // The edited value is escaped and saved back into the table HTML.
    expect(onChange).toHaveBeenCalledWith(
      expect.stringContaining("British Virgin Islands")
    );
  });

  it("adds and removes rows", () => {
    const onChange = vi.fn();
    renderWithLocale(
      <KeyValueEditor value={CONTENT_HTML} onChange={onChange} />
    );

    // Add a row → two rows present.
    fireEvent.click(screen.getByText("Add row"));
    expect(screen.getByLabelText("Label 2")).toBeTruthy();

    // Remove the first row → the original (Place of Incorporation) row is gone;
    // the newly added empty row now occupies Label 1.
    fireEvent.click(screen.getAllByLabelText("Remove row")[0]);
    expect(
      (screen.getByLabelText("Label 1") as HTMLInputElement).value
    ).toBe("");
    expect(onChange).toHaveBeenCalledWith(expect.stringContaining("<table>"));
  });

  it("shows an empty state when there is no table", () => {
    renderWithLocale(<KeyValueEditor value="" onChange={vi.fn()} />);
    expect(screen.getByText(/No rows yet/i)).toBeTruthy();
  });
});