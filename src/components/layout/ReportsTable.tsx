"use client";

import { useEffect, useMemo, useState } from "react";
import { reportDateKey } from "@/lib/report-rows";

export interface ReportRow {
  id: string;
  date: string;
  title: string;
  url: string;
}

export interface ReportsTableLabels {
  date: string;
  document: string;
  rowsPerPage?: string;
  previous?: string;
  next?: string;
  pageInfo?: string; // supports %start%, %end%, %total%
  noRows?: string;
}

interface ReportsTableProps {
  rows: ReportRow[];
  labels?: ReportsTableLabels;
}

type SortKey = "date" | "title";
type SortDirection = "asc" | "desc";

const PAGE_SIZES = [5, 10, 20] as const;
const DEFAULT_PAGE_SIZE = 10;
const PAGE_SEARCH_PARAM = "page";

/** `?page=N` from the URL, or null when absent/invalid (client only). */
function pageFromUrl(): number | null {
  if (typeof window === "undefined") return null;
  const value = Number(
    new URLSearchParams(window.location.search).get(PAGE_SEARCH_PARAM)
  );
  return Number.isInteger(value) && value > 0 ? value : null;
}

const DEFAULT_LABELS: Required<
  Omit<ReportsTableLabels, "date" | "document">
> = {
  rowsPerPage: "Rows per page",
  previous: "Previous",
  next: "Next",
  pageInfo: "Showing %start%–%end% of %total%",
  noRows: "No records",
};

export default function ReportsTable({ rows, labels }: ReportsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);

  const dateLabel = labels?.date ?? "Date";
  const documentLabel = labels?.document ?? "Document";
  const rowsPerPageLabel = labels?.rowsPerPage ?? DEFAULT_LABELS.rowsPerPage;
  const previousLabel = labels?.previous ?? DEFAULT_LABELS.previous;
  const nextLabel = labels?.next ?? DEFAULT_LABELS.next;
  const pageInfoTemplate = labels?.pageInfo ?? DEFAULT_LABELS.pageInfo;
  const noRowsLabel = labels?.noRows ?? DEFAULT_LABELS.noRows;

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      if (sortKey === "date")
        return reportDateKey(a.date).localeCompare(reportDateKey(b.date));
      return a.title.localeCompare(b.title);
    });
    return sortDirection === "desc" ? sorted.reverse() : sorted;
  }, [rows, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (safePage !== page) setPage(safePage);
  }, [safePage, page]);

  // Restore the current page from `?page=N` after a refresh / reload. Read in an
  // effect (not the useState initializer) so SSR and the first client render
  // both show page 1 — avoids a hydration mismatch — then the URL-adopted page
  // kicks in on the following render.
  useEffect(() => {
    const fromUrl = pageFromUrl();
    if (fromUrl !== null) {
      setPage(fromUrl);
    }
  }, [setPage]);

  // Keep `?page=N` in the URL as the user navigates, so a refresh returns to
  // the same page with the correct highlighted button. `replaceState` keeps
  // browser history clean (no one entry per page click).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (safePage > 1) {
      url.searchParams.set(PAGE_SEARCH_PARAM, String(safePage));
    } else {
      url.searchParams.delete(PAGE_SEARCH_PARAM);
    }
    window.history.replaceState(null, "", url.toString());
  }, [safePage]);

  const pagedRows = useMemo(
    () => sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sortedRows, safePage, pageSize]
  );

  const start = sortedRows.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, sortedRows.length);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const formatPageInfo = () =>
    pageInfoTemplate
      .replace("%start%", String(start))
      .replace("%end%", String(end))
      .replace("%total%", String(sortedRows.length));

  const pageNumbers = useMemo(() => {
    const maxShown = 5;
    const first = Math.max(1, safePage - Math.floor(maxShown / 2));
    const last = Math.min(totalPages, first + maxShown - 1);
    const nums: number[] = [];
    for (let i = first; i <= last; i++) nums.push(i);
    return nums;
  }, [safePage, totalPages]);

  return (
    <div className="w-full">
      {/* Toolbar: rows-per-page selector + summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span>{rowsPerPageLabel}</span>
          <select
            id="rows-per-page"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className="min-h-[44px] border border-gray-300 rounded px-2 py-1.5 text-sm"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <span className="text-sm text-gray-500">
          {sortedRows.length > 0 ? formatPageInfo() : noRowsLabel}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                <button
                  type="button"
                  onClick={() => handleSort("date")}
                  className="min-h-[44px] hover:text-primary transition-colors"
                >
                  {dateLabel}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                <button
                  type="button"
                  onClick={() => handleSort("title")}
                  className="min-h-[44px] hover:text-primary transition-colors"
                >
                  {documentLabel}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pagedRows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {row.date}
                </td>
                <td className="px-4 py-3 text-sm">
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {row.title}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <nav
          aria-label={`${previousLabel} / ${nextLabel}`}
          className="mt-4 flex flex-wrap items-center justify-between gap-3"
        >
          <button
            type="button"
            onClick={() => setPage(Math.max(1, safePage - 1))}
            disabled={safePage <= 1}
            className="min-h-[44px] px-3 py-2 rounded text-sm border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {previousLabel}
          </button>

          <div className="flex items-center gap-1 flex-wrap">
            {pageNumbers.map((num) => (
              <button
                key={num}
                type="button"
                aria-label={`Page ${num}`}
                aria-current={num === safePage ? "page" : undefined}
                onClick={() => setPage(num)}
                className={`min-w-[44px] h-[44px] px-2 rounded text-sm ${
                  num === safePage
                    ? "bg-primary text-white font-semibold"
                    : "border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, safePage + 1))}
            disabled={safePage >= totalPages}
            className="min-h-[44px] px-3 py-2 rounded text-sm border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {nextLabel}
          </button>
        </nav>
      )}
    </div>
  );
}