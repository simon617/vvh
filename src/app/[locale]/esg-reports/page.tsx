import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { useTranslations } from "next-intl";
import TemplateShell from "@/components/layout/TemplateShell";
import ReportsTable from "@/components/layout/ReportsTable";
import type { ReportRow } from "@/components/layout/ReportsTable";
import { getPageData } from "@/lib/pages";
import { getReportRows } from "@/lib/report-rows";
import { buildPageMetadata } from "@/lib/metadata";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const data = await getPageData("esg-reports", locale as Locale);
  return data ? buildPageMetadata(data, locale as Locale) : {};
}

/** Synchronous view (i18n hook must run inside the provider during render). */
function EsgReportsView({
  title,
  heroImage,
  locale,
  pathname,
  rows,
}: {
  title: string;
  heroImage?: string;
  locale: Locale;
  pathname: string;
  rows: ReportRow[];
}) {
  const t = useTranslations("tables");
  return (
    <TemplateShell
      title={title}
      locale={locale}
      heroImage={heroImage}
      pathname={pathname}
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        <ReportsTable
          rows={rows}
          labels={{
            date: t("date"),
            document: t("document"),
            rowsPerPage: t("rowsPerPage"),
            previous: t("previous"),
            next: t("next"),
            pageInfo: t("pageInfo"),
            noRows: t("noRows"),
          }}
        />
      </div>
    </TemplateShell>
  );
}

export default async function EsgReportsPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const data = await getPageData("esg-reports", locale);
  if (!data) notFound();

  // Next.js 15: headers() is async — read the middleware-set pathname for the breadcrumb.
  const pathname = (await headers()).get("x-pathname") || `/${locale}/esg-reports`;

  // contentHtml is always populated (DB or placeholder) and both carry the report
  // envelope, so getReportRows always yields rows here.
  const rows = getReportRows(data.contentHtml) ?? [];

  return (
    <EsgReportsView
      title={data.title}
      heroImage={data.heroImage}
      locale={locale}
      pathname={pathname}
      rows={rows}
    />
  );
}


