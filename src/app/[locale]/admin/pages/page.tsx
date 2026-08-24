import Link from "next/link";
import { listPagesWithContent } from "@/lib/page-content";

interface AdminPagesPageProps {
  params: { locale: string };
}

/**
 * Admin pages listing (deliverable 2B.1).
 * Shows all 10 pages with per-locale published status and an edit link.
 * Rendered inside the protected [locale]/admin layout.
 */
export default async function AdminPagesPage({ params }: AdminPagesPageProps) {
  const { locale } = params;
  const pages = await listPagesWithContent();

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Pages</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background-light">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Page
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                English
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Chinese
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Edit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pages.map((page) => (
              <tr key={page.slug}>
                <td className="px-4 py-3 font-medium text-text">{page.slug}</td>
                <td className="px-4 py-3">
                  <span
                    data-testid={`en-status-${page.slug}`}
                    className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                      page.en?.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {page.en?.isPublished ? "Published" : "Unpublished"}
                  </span>
                  <span className="ml-2 text-gray-500">{page.en?.title ?? "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    data-testid={`zh-status-${page.slug}`}
                    className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                      page.zh?.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {page.zh?.isPublished ? "Published" : "Unpublished"}
                  </span>
                  <span className="ml-2 text-gray-500">{page.zh?.title ?? "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/${locale}/admin/pages/${page.slug}`}
                    className="text-primary hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}