import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReportsEditor from "./ReportsEditor";
import { buildReportContent } from "@/lib/report-rows";
import { renderWithLocale } from "@/test/utils";

const CONTENT = buildReportContent([
  { id: "a", date: "2025", title: "Annual Report 2025", url: "/uploads/reports/en/a.pdf" },
  { id: "b", date: "2024", title: "Interim 2024", url: "/uploads/reports/en/b.pdf" },
]);

describe("ReportsEditor", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("loads existing report rows into date/document fields", () => {
    renderWithLocale(
      <ReportsEditor value={CONTENT} locale="en" onChange={vi.fn()} />
    );
    expect((screen.getByLabelText("Date 1") as HTMLInputElement).value).toBe("2025");
    expect(
      (screen.getByLabelText("Document 1") as HTMLInputElement).value
    ).toBe("Annual Report 2025");
    expect(screen.getByRole("link", { name: "a.pdf" })).toHaveAttribute(
      "href",
      "/uploads/reports/en/a.pdf"
    );
  });

  it("updates on edit and rebuilds report content", () => {
    const onChange = vi.fn();
    renderWithLocale(
      <ReportsEditor value={CONTENT} locale="en" onChange={onChange} />
    );
    fireEvent.change(screen.getByLabelText("Date 1"), {
      target: { value: "2026" },
    });
    expect(onChange).toHaveBeenCalled();
    // Content serializes to the report envelope JSON.
    expect(onChange.mock.calls[0][0]).toContain('"__type":"reports"');
  });

  it("uploads a PDF via /api/upload/pdf?locale=en and places the returned path", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ path: "/uploads/reports/en/x.pdf" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    const onChange = vi.fn();
    renderWithLocale(
      <ReportsEditor
        value={buildReportContent([{ id: "a", date: "2025", title: "R", url: "" }])}
        locale="en"
        onChange={onChange}
      />
    );

    const file = new File(["x"], "report.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("Upload PDF 1"), {
      target: { files: [file] },
    });

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        "/api/upload/pdf?locale=en",
        expect.objectContaining({ method: "POST" })
      )
    );
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it("adds and removes rows, and shows an empty state", () => {
    const onChange = vi.fn();
    const { unmount } = renderWithLocale(
      <ReportsEditor value="" locale="en" onChange={onChange} />
    );
    expect(screen.getByText(/No reports yet/i)).toBeTruthy();

    fireEvent.click(screen.getByText("Add report"));
    expect(screen.getByLabelText("Date 1")).toBeTruthy();

    fireEvent.click(screen.getAllByLabelText("Remove row")[0]);
    expect(onChange).toHaveBeenCalled();
    unmount();
  });

  it("moves a row down via the Move down button and commits the new order", () => {
    const onChange = vi.fn();
    renderWithLocale(
      <ReportsEditor value={CONTENT} locale="en" onChange={onChange} />
    );

    // Row 1 (Annual Report 2025) is "a"; row 2 is "b". Move row 1 down.
    const downButtons = screen.getAllByLabelText("Move down");
    expect(downButtons).toHaveLength(2);
    fireEvent.click(downButtons[0]);

    const emitted = JSON.parse(
      onChange.mock.calls[onChange.mock.calls.length - 1][0] as string
    );
    expect(emitted.rows.map((r: { id: string }) => r.id)).toEqual(["b", "a"]);
  });

  it("moves the last row up via the Move up button", () => {
    const onChange = vi.fn();
    renderWithLocale(
      <ReportsEditor value={CONTENT} locale="en" onChange={onChange} />
    );

    const upButtons = screen.getAllByLabelText("Move up");
    expect(upButtons).toHaveLength(2);
    fireEvent.click(upButtons[1]);

    const emitted = JSON.parse(
      onChange.mock.calls[onChange.mock.calls.length - 1][0] as string
    );
    expect(emitted.rows.map((r: { id: string }) => r.id)).toEqual(["b", "a"]);
  });

  it("disables Move up on the first row and Move down on the last row", () => {
    renderWithLocale(<ReportsEditor value={CONTENT} locale="en" onChange={vi.fn()} />);

    const upButtons = screen.getAllByLabelText("Move up");
    const downButtons = screen.getAllByLabelText("Move down");
    expect(upButtons[0]).toBeDisabled();
    expect(downButtons.at(-1)).toBeDisabled();
  });

  it("removing a row with an uploaded PDF DELETE-requests the file on the server", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const onChange = vi.fn();
    renderWithLocale(
      <ReportsEditor value={CONTENT} locale="en" onChange={onChange} />
    );

    fireEvent.click(screen.getAllByLabelText("Remove row")[0]);
    // The row is removed from the envelope immediately…
    const emitted = JSON.parse(
      onChange.mock.calls[onChange.mock.calls.length - 1][0] as string
    );
    expect(emitted.rows.map((r: { id: string }) => r.id)).toEqual(["b"]);
    // …and the PDF is deleted on the server (path-traversal safe, authed route).
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/upload/pdf?"),
        expect.objectContaining({ method: "DELETE" })
      )
    );
    expect(decodeURIComponent(
      fetchMock.mock.calls[0][0] as string
    )).toContain("/uploads/reports/en/a.pdf");
  });

  it("removing a row without an uploaded PDF does not call the API", () => {
    const onChange = vi.fn();
    renderWithLocale(
      <ReportsEditor
        value={buildReportContent([{ id: "x", date: "2025", title: "Draft", url: "" }])}
        locale="en"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getAllByLabelText("Remove row")[0]);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });
});