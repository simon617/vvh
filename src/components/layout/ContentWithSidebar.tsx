import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPageData } from "@/lib/pages";
import type { PagePlaceholder } from "@/lib/pages";
import type { Locale } from "@/lib/navigation";
import Breadcrumb from "./Breadcrumb";

interface ContentWithSidebarProps {
  slug: string;
  locale: Locale;
}

/**
 * Rich-text page shell for corporate-details / corporate-governance /
 * lost-share-certificates. Reads DB-driven page data (Task 21) and renders
 * the header image when present (Task 22).
 */
export default async function ContentWithSidebar({
  slug,
  locale,
}: ContentWithSidebarProps) {
  const pageData: PagePlaceholder | null = await getPageData(slug, locale);
  // Unknown slug OR unpublished current locale → 404 (Decision D8).
  if (!pageData) notFound();

  const headersList = headers();
  const pathname = headersList.get("x-pathname") || `/${locale}/${slug}`;

  return (
    <div>
      {/* Hero image area */}
      {pageData.heroImage ? (
        <div className="mb-6 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pageData.heroImage}
            alt={pageData.title}
            className="w-full max-h-72 object-cover"
            data-testid="hero-image"
          />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-lg p-8 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {pageData.title}
          </h1>
        </div>
      )}

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
