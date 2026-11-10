import { notFound } from "next/navigation";
import { headers } from "next/headers";
import TemplateShell from "@/components/layout/TemplateShell";
import DirectorCards from "@/components/layout/DirectorCards";
import { getDirectors } from "@/lib/directors";
import { getPageData } from "@/lib/pages";
import { buildPageMetadata } from "@/lib/metadata";
import type { PagePlaceholder } from "@/lib/pages";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const data = await getPageData("board-of-directors", locale as Locale);
  return data ? buildPageMetadata(data, locale as Locale) : {};
}

export default async function BoardOfDirectorsPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const data: PagePlaceholder | null = await getPageData(
    "board-of-directors",
    locale
  );
  if (!data) notFound();

  // Next.js 15: headers() is async — read the middleware-set pathname for the breadcrumb.
  const pathname =
    (await headers()).get("x-pathname") || `/${locale}/board-of-directors`;

  return (
    <TemplateShell
      title={data.title}
      locale={locale}
      heroImage={data.heroImage}
      pathname={pathname}
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        {data.isDbContent ? (
          /* DB-driven director content (Phase 2.5). Each <p> = one card;
             category <h2> spans the row. Styled by .director-cards in globals.css. */
          <div className="director-cards">
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: data.contentHtml }}
              data-testid="director-db-content"
            />
          </div>
        ) : (
          /* Fallback before content is migrated: the Phase-2A component cards. */
          <DirectorCards directors={getDirectors(locale)} />
        )}
      </div>
    </TemplateShell>
  );
}

