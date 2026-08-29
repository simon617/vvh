import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import TemplateShell from "@/components/layout/TemplateShell";
import ReportsTable from "@/components/layout/ReportsTable";
import type { ReportRow } from "@/components/layout/ReportsTable";
import { getCorporateCommunications } from "@/lib/corporateCommunications";
import { getPageData } from "@/lib/pages";
import { getReportRows } from "@/lib/report-rows";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props) {
  const data = await getPageData(
    "corporate-communications",
    params.locale as Locale
  );
  return { title: data?.metaTitle, description: data?.metaDescription };
}

/** Synchronous view (i18n hook must run inside the provider during render). */
function CorporateCommunicationsView({
  title,
  heroImage,
  locale,
  rows,
}: {
  title: string;
  heroImage?: string;
  locale: Locale;
  rows: ReportRow[];
}) {
  const t = useTranslations("tables");
  return (
    <TemplateShell title={title} locale={locale} heroImage={heroImage}>
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

export default async function CorporateCommunicationsPage({ params }: Props) {
  const locale = params.locale as Locale;
  const data = await getPageData("corporate-communications", locale);
  if (!data) notFound();

  const rows =
    getReportRows(data.contentHtml) ?? getCorporateCommunications(locale);

  return (
    <CorporateCommunicationsView
      title={data.title}
      heroImage={data.heroImage}
      locale={locale}
      rows={rows}
    />
  );
}


