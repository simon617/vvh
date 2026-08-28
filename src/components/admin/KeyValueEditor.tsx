"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  parseKeyValueTable,
  buildKeyValueTable,
  type KeyValueRow,
} from "@/lib/key-value";

interface KeyValueEditorProps {
  value: string;
  onChange: (html: string) => void;
}

/**
 * Structured key/value editor for Corporate-Details style pages.
 *
 * The WYSIWYG (TipTap) can't edit tables, so structured pages get this editor
 * instead: it parses the existing `<table>` HTML into editable rows (key +
 * value) and rebuilds the same table HTML on change. Non-technical friendly —
 * just rows of "label" and "value", with add / remove controls.
 */
export default function KeyValueEditor({
  value,
  onChange,
}: KeyValueEditorProps) {
  const t = useTranslations("admin.keyValue");
  const [rows, setRows] = useState<KeyValueRow[]>(() =>
    parseKeyValueTable(value)
  );

  function commit(next: KeyValueRow[]) {
    setRows(next);
    onChange(buildKeyValueTable(next));
  }

  function updateRow(index: number, patch: Partial<KeyValueRow>) {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    commit(next);
  }

  function addRow() {
    commit([...rows, { key: "", value: "" }]);
  }

  function removeRow(index: number) {
    commit(rows.filter((_, i) => i !== index));
  }

  const inputClass =
    "w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto bg-white rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background-light">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 w-2/5">
                {t("label")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                {t("value")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 w-24">
                {t("remove")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-2 align-top">
                  <input
                    type="text"
                    value={row.key}
                    aria-label={`${t("label")} ${index + 1}`}
                    onChange={(e) => updateRow(index, { key: e.target.value })}
                    className={inputClass}
                  />
                </td>
                <td className="px-4 py-2 align-top">
                  <textarea
                    rows={2}
                    value={row.value}
                    aria-label={`${t("value")} ${index + 1}`}
                    onChange={(e) =>
                      updateRow(index, { value: e.target.value })
                    }
                    className={inputClass}
                  />
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
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  {t("noRows")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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