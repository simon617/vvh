import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  listPagesWithContent,
  getRecentPageActivity,
} from "@/lib/page-content";

interface AdminDashboardPageProps {
  params: { locale: string };
}

/**
 * Admin dashboard (deliverable 2B.11): overview counts (pages + published per
 * locale) and a recent-activity feed driven by page_contents.updatedAt.
 */
export default async function AdminDashboardPage({
  params,
}: AdminDashboardPageProps) {
  const { locale } = params;
  const session = await getSession();

  const [pages, recent] = await Promise.all([
    listPagesWithContent(),
    getRecentPageActivity(10),
  ]);

  const total = pages.length;
  const enPublished = pages.filter((p) => p.en?.isPublished).length;
  const zhPublished = pages.filter((p) => p.zh?.isPublished).length;

  const stats = [
    { label: "Total pages", value: total },
    { label: "English published", value: enPublished },
    { label: "Chinese published", value: zhPublished },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome, <strong>{session?.username}</strong>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-md p-6 text-center"
          >
            <div className="text-3xl font-bold text-primary">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">
            Recent activity
          </h2>
          <Link
            href={`/${locale}/admin/pages`}
            className="text-sm text-primary hover:underline"
          >
            Manage pages
          </Link>
        </div>

        {recent.length === 0 ? (
          <p data-testid="recent-empty" className="text-sm text-gray-500">
            No recent activity yet. Open a page in the editor to get started.
          </p>
        ) : (
          <ul className="divide-y divide-border" data-testid="recent-list">
            {recent.map((row) => (
              <li
                key={`${row.slug}-${row.locale}`}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    data-testid={`recent-locale-${row.slug}-${row.locale}`}
                    className="inline-block px-2 py-0.5 rounded-full text-xs uppercase bg-background-light text-gray-600"
                  >
                    {row.locale}
                  </span>
                  <span className="font-medium text-text">
                    {row.title || row.slug}
                  </span>
                </div>
                <span className="text-xs text-gray-400" title={row.updatedAt.toISOString()}>
                  {row.updatedAt.toLocaleDateString()}{" "}
                  {row.updatedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
