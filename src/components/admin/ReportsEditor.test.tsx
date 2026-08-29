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
});