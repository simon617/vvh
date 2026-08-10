import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ReportsTable, { type ReportRow } from "./ReportsTable";

const rows: ReportRow[] = [
  { id: "1", date: "2025-12-31", title: "Annual Report 2025", url: "/pdf/annual-2025.pdf" },
  { id: "2", date: "2025-09-30", title: "Interim Report 2025", url: "/pdf/interim-2025.pdf" },
  { id: "3", date: "2024-12-31", title: "Annual Report 2024", url: "/pdf/annual-2024.pdf" },
];

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
});