import { headers } from "next/headers";
import { getPageData } from "@/lib/pages";
import type { Locale } from "@/lib/navigation";
import Breadcrumb from "./Breadcrumb";

interface ContentWithSidebarProps {
  slug: string;
  locale: Locale;
}

export default function ContentWithSidebar({
  slug,
  locale,
}: ContentWithSidebarProps) {
  const pageData = getPageData(slug, locale);
  if (!pageData) return null;

  const headersList = headers();
  const pathname = headersList.get("x-pathname") || `/${locale}/${slug}`;

  return (
    <div>
      {/* Hero image area */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-lg p-8 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          {pageData.title}
        </h1>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb pathname={pathname} locale={locale} />

      {/* Content area */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: pageData.contentHtml }}
        />
      </div>
    </div>
  );
}