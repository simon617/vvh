"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  getReportRows,
  buildReportContent,
  makeRowId,
  type ReportRowItem,
} from "@/lib/report-rows";

interface ReportsEditorProps {
  value: string;
  locale: "en" | "zh";
  onChange: (html: string) => void;
}

/**
 * Shared report editor for financial-reports / esg-reports / corporate-communications.
 * Each row = a date + document title + an uploaded PDF. Rows are stored as a JSON
 * envelope in contentHtml and rendered by the paginated <ReportsTable> on the public
 * page. PDFs upload to /uploads/reports/<locale>/.
 */
export default function ReportsEditor({
  value,
  locale,
  onChange,
}: ReportsEditorProps) {
  const t = useTranslations("admin.reportsEditor");
  const [rows, setRows] = useState<ReportRowItem[]>(() =>
    getReportRows(value) ?? []
  );
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  function commit(next: ReportRowItem[]) {
    setRows(next);
    onChange(buildReportContent(next));
  }

  function updateRow(index: number, patch: Partial<ReportRowItem>) {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    commit(next);
  }

  function addRow() {
    commit([...rows, { id: makeRowId(), date: "", title: "", url: "" }]);
  }

  function removeRow(index: number) {
    commit(rows.filter((_, i) => i !== index));
  }

  async function handleUpload(index: number, file: File) {
    const rowId = rows[index]?.id ?? "";
    setError(null);
    setUploadingId(rowId);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/upload/pdf?locale=${locale}`, {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.path) {
        setError(data?.error ?? "Upload failed");
        return;
      }
      updateRow(index, { url: data.path });
    } catch {
      setError("Upload failed");
    } finally {
      setUploadingId(null);
      const input = fileInputs.current[rowId];
      if (input) {
        input.value = "";
      }
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto bg-white rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background-light">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 w-40">
                {t("date")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                {t("document")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 w-64">
                {t("upload")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 w-24">
                {t("remove")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td className="px-4 py-2 align-top">
                  <input
                    type="text"
                    value={row.date}
                    aria-label={`${t("date")} ${index + 1}`}
                    onChange={(e) => updateRow(index, { date: e.target.value })}
                    className={inputClass}
                  />
                </td>
                <td className="px-4 py-2 align-top">
                  <input
                    type="text"
                    value={row.title}
                    aria-label={`${t("document")} ${index + 1}`}
                    onChange={(e) => updateRow(index, { title: e.target.value })}
                    className={inputClass}
                  />
                </td>
                <td className="px-4 py-2 align-top">
                  <div className="flex items-center gap-2">
                    <input
                      ref={(el) => {
                        fileInputs.current[row.id] = el;
                      }}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      aria-label={`${t("upload")} ${index + 1}`}
                      className="text-xs"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleUpload(index, f);
                      }}
                    />
                    {uploadingId === row.id && (
                      <span className="text-xs text-gray-500">{t("uploading")}</span>
                    )}
                  </div>
                  {row.url && (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-primary hover:underline"
                    >
                      {String(row.url).split("/").pop()}
                    </a>
                  )}
                </td>
                <td className="px-4 py-2 align-top">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    aria-label={t("removeRow")}
                    className="px-3 py-1.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors"
                  >
                    {t("remove")}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  {t("noRows")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {error && <p className="text-sm text-secondary">{error}</p>}

      <button
        type="button"
        onClick={addRow}
        className="px-3 py-1.5 text-sm bg-background-light text-primary border border-border rounded hover:border-primary transition-colors"
      >
        {t("addRow")}
      </button>
      <p className="text-xs text-gray-400">{t("help")}</p>
    </div>
  );
}