import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
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
});