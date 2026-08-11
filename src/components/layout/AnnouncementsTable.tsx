import { useTranslations } from "next-intl";
import type { Announcement } from "@/lib/announcements";

interface AnnouncementsTableProps {
  rows: Announcement[];
}

/**
 * Announcements & Circulars table with HKEX-linked documents.
 * Links open in a new tab (target="_blank").
 */
export default function AnnouncementsTable({ rows }: AnnouncementsTableProps) {
  const t = useTranslations("tables");

  return (
    <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              {t("date")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              {t("document")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={`${row.date}-${row.title}`}>
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
