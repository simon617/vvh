"use client";

import { useMemo, useState } from "react";

export interface ReportRow {
  id: string;
  date: string;
  title: string;
  url: string;
}

interface ReportsTableProps {
  rows: ReportRow[];
  labels?: { date: string; document: string };
}


type SortKey = "date" | "title";
type SortDirection = "asc" | "desc";

export default function ReportsTable({ rows, labels }: ReportsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const dateLabel = labels?.date ?? "Date";
  const documentLabel = labels?.document ?? "Document";

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      if (sortKey === "date") {
        return a.date.localeCompare(b.date);
      }
      return a.title.localeCompare(b.title);
    });
    return sortDirection === "desc" ? sorted.reverse() : sorted;
  }, [rows, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
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
          {sortedRows.map((row) => (
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
  );
}