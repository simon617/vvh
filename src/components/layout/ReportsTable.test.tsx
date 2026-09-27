import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import ReportsTable, { type ReportRow } from "./ReportsTable";

const rows: ReportRow[] = [
  { id: "1", date: "2025-12-31", title: "Annual Report 2025", url: "/pdf/annual-2025.pdf" },
  { id: "2", date: "2025-09-30", title: "Interim Report 2025", url: "/pdf/interim-2025.pdf" },
  { id: "3", date: "2024-12-31", title: "Annual Report 2024", url: "/pdf/annual-2024.pdf" },
];

const manyRows: ReportRow[] = Array.from({ length: 12 }, (_, i) => ({
  id: `r${i}`,
  date: `2025-${String((i % 12) + 1).padStart(2, "0")}-01`,
  title: `Report ${i + 1}`,
  url: `/pdf/report-${i + 1}.pdf`,
}));

describe("ReportsTable", () => {
  afterEach(() => {
    // Clear the ?page= search param left by the previous test.
    window.history.replaceState(null, "", "/");
  });

  it("renders all report rows", () => {
    render(<ReportsTable rows={rows} />);
    expect(screen.getByText("Annual Report 2025")).toBeInTheDocument();
    expect(screen.getByText("Interim Report 2025")).toBeInTheDocument();
    expect(screen.getByText("Annual Report 2024")).toBeInTheDocument();
  });

  it("sorts by date descending by default", () => {
    render(<ReportsTable rows={rows} />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("Annual Report 2025");
    expect(links[1]).toHaveTextContent("Interim Report 2025");
    expect(links[2]).toHaveTextContent("Annual Report 2024");
  });

  it("sorts localized EN month/year dates chronologically (not alphabetically)", () => {
    const localized = [
      { id: "a", date: "March 2024", title: "Interim 2023/24", url: "/i2324.pdf" },
      { id: "b", date: "October 2024", title: "Annual 2024", url: "/a2024.pdf" },
      { id: "c", date: "March 2025", title: "Interim 2024/25", url: "/i2425.pdf" },
      { id: "d", date: "October 2025", title: "Annual 2025", url: "/a2025.pdf" },
    ];
    render(<ReportsTable rows={localized} />);
    const links = screen.getAllByRole("link").map((l) => l.textContent);
    expect(links).toEqual([
      "Annual 2025",
      "Interim 2024/25",
      "Annual 2024",
      "Interim 2023/24",
    ]);
  });

  it("sorts localized ZH month/year dates chronologically (not alphabetically)", () => {
    const localized = [
      { id: "d", date: "2025年10月", title: "2025年報", url: "/a2025.pdf" },
      { id: "c", date: "2025年3月", title: "2024/2025中期報告", url: "/i2425.pdf" },
      { id: "b", date: "2024年10月", title: "2024年報", url: "/a2024.pdf" },
      { id: "a", date: "2024年3月", title: "2023/2024中期報告", url: "/i2324.pdf" },
    ];
    render(<ReportsTable rows={localized} />);
    const links = screen.getAllByRole("link").map((l) => l.textContent);
    expect(links).toEqual([
      "2025年報",
      "2024/2025中期報告",
      "2024年報",
      "2023/2024中期報告",
    ]);
  });

  it("sorts by title when title header clicked", async () => {
    const user = userEvent.setup();
    render(<ReportsTable rows={rows} />);
    await user.click(screen.getByRole("button", { name: /document/i }));
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("Annual Report 2024");
    expect(links[1]).toHaveTextContent("Annual Report 2025");
    expect(links[2]).toHaveTextContent("Interim Report 2025");
  });

  it("renders links with target blank", () => {
    render(<ReportsTable rows={rows} />);
    const link = screen.getByText("Annual Report 2025");
    expect(link).toHaveAttribute("href", "/pdf/annual-2025.pdf");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("wraps table in horizontal scroll container", () => {
    const { container } = render(<ReportsTable rows={rows} />);
    expect(container.querySelector(".overflow-x-auto")).not.toBeNull();
  });

  it("paginates rows and navigates forward/back", async () => {
    const user = userEvent.setup();
    render(<ReportsTable rows={manyRows} />);

    // Default page size 10: first page shows 10 of 12.
    expect(screen.getAllByRole("link")).toHaveLength(10);
    expect(screen.getByText("Showing 1–10 of 12")).toBeInTheDocument();

    const previous = screen.getByRole("button", { name: "Previous" });
    const next = screen.getByRole("button", { name: "Next" });
    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();

    // Next page shows the remaining rows and enables Previous.
    await user.click(next);
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.getByText("Showing 11–12 of 12")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();

    // And back.
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Showing 1–10 of 12")).toBeInTheDocument();
  });

  it("paginates real month/year dates newest-first without any sort interaction (regression)", async () => {
    const user = userEvent.setup();
    // 19 years x (October + March) = 38 rows, newest-first already.
    const rows38: ReportRow[] = [];
    for (let year = 2025; year >= 2007; year--) {
      rows38.push({
        id: `row-${year}-annual`,
        date: `October ${year}`,
        title: `Annual Report ${year}`,
        url: `/pdf/${year}-annual.pdf`,
      });
      rows38.push({
        id: `row-${year}-interim`,
        date: `March ${year}`,
        title: `Interim Report ${year}`,
        url: `/pdf/${year}-interim.pdf`,
      });
    }
    expect(rows38).toHaveLength(38);
    render(<ReportsTable rows={rows38} />);

    // Page 1 (default date desc) shows the newest rows.
    expect(screen.getByText("October 2025")).toBeInTheDocument();
    expect(screen.getByText("Annual Report 2025")).toBeInTheDocument();
    expect(screen.getByText("Showing 1–10 of 38")).toBeInTheDocument();

    // Click "Page 4" — must show the OLDEST rows, not reset to page 1.
    await user.click(screen.getByRole("button", { name: "Page 4" }));
    expect(screen.getByText("Showing 31–38 of 38")).toBeInTheDocument();
    expect(screen.getByText("March 2007")).toBeInTheDocument();
    expect(screen.queryByText("October 2025")).not.toBeInTheDocument();
    expect(screen.queryByText("Annual Report 2025")).not.toBeInTheDocument();

    // Clicking "Page 3" must NOT jump back to page 1 either.
    await user.click(screen.getByRole("button", { name: "Page 3" }));
    expect(screen.getByText("Showing 21–30 of 38")).toBeInTheDocument();
    expect(screen.getByText("October 2013")).toBeInTheDocument();
    expect(screen.queryByText("October 2025")).not.toBeInTheDocument();
  });

  it("restores page 4 from ?page= in the URL after a refresh (regression)", () => {
    const rows38: ReportRow[] = [];
    for (let year = 2025; year >= 2007; year--) {
      rows38.push({
        id: `a-${year}`,
        date: `October ${year}`,
        title: `Annual ${year}`,
        url: `/p/${year}.pdf`,
      });
      rows38.push({
        id: `i-${year}`,
        date: `March ${year}`,
        title: `Interim ${year}`,
        url: `/p/${year}-i.pdf`,
      });
    }
    window.history.replaceState(
      null,
      "",
      "/en/financial-reports?page=4"
    );

    render(<ReportsTable rows={rows38} />);

    // The page is adopted from the URL (highlight + content stay on page 4).
    expect(screen.getByText("Showing 31–38 of 38")).toBeInTheDocument();
    expect(screen.getByText("March 2007")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Page 4" })
    ).toHaveAttribute("aria-current", "page");
    // Page 1 has scrolled out of the button window ([2,3,4]); page 3 is not active.
    expect(screen.queryByRole("button", { name: "Page 1" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Page 3" })
    ).not.toHaveAttribute("aria-current", "page");
  });

  it("writes ?page= into the URL when navigating pages", async () => {
    const user = userEvent.setup();
    render(<ReportsTable rows={manyRows} />);

    await user.click(screen.getByRole("button", { name: "Page 2" }));
    expect(window.location.search).toContain("page=2");
    expect(
      screen.getByRole("button", { name: "Page 2" })
    ).toHaveAttribute("aria-current", "page");

    await user.click(screen.getByRole("button", { name: "Page 1" }));
    expect(window.location.search).not.toContain("page=");
  });

  it("controls the number of rows per page", async () => {
    const user = userEvent.setup();
    render(<ReportsTable rows={manyRows} />);

    await user.selectOptions(screen.getByRole("combobox"), "5");
    expect(screen.getAllByRole("link")).toHaveLength(5);
    expect(screen.getByText("Showing 1–5 of 12")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "20");
    expect(screen.getAllByRole("link")).toHaveLength(12);
    expect(screen.getByText("Showing 1–12 of 12")).toBeInTheDocument();
  });

  it("resets to the first page when sorting changes", async () => {
    const user = userEvent.setup();
    render(<ReportsTable rows={manyRows} />);

    // Go to the second page, then click the Document header to sort.
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Showing 11–12 of 12")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Document" }));
    expect(screen.getByText("Showing 1–10 of 12")).toBeInTheDocument();
  });

  it("navigates directly to a numbered page button (regression: 4 pages)", async () => {
    const user = userEvent.setup();
    // 38 rows, default 10/page → 4 pages; use title sort for deterministic pages.
    const rows38 = Array.from({ length: 38 }, (_, i) => ({
      id: `row-${i + 1}`,
      date: `2025-${String((i % 12) + 1).padStart(2, "0")}-01`,
      title: `Report ${String(i + 1).padStart(2, "0")}`,
      url: `/pdf/report-${i + 1}.pdf`,
    }));
    render(<ReportsTable rows={rows38} />);

    // Title ASC → page 1 = Report 01..10, page 4 = Report 31..38.
    await user.click(screen.getByRole("button", { name: /document/i }));
    expect(screen.getByText("Showing 1–10 of 38")).toBeInTheDocument();

    // Click the "Page 4" number button directly.
    await user.click(screen.getByRole("button", { name: "Page 4" }));
    expect(screen.getByText("Showing 31–38 of 38")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Report 38" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Report 01" })
    ).not.toBeInTheDocument();

    // Clicking another number button (e.g. 2 or 3) must NOT revert to page 1.
    await user.click(screen.getByRole("button", { name: "Page 2" }));
    expect(screen.getByText("Showing 11–20 of 38")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Page 3" }));
    expect(screen.getByText("Showing 21–30 of 38")).toBeInTheDocument();
  });
});