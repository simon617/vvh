import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import TemplateShell from "@/components/layout/TemplateShell";
import ReportsTable from "@/components/layout/ReportsTable";
import { getEsgReports } from "@/lib/reports";
import { getPageData } from "@/lib/pages";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props) {
  const data = await getPageData("esg-reports", params.locale as Locale);
  return { title: data?.metaTitle, description: data?.metaDescription };
}

/** Synchronous view (i18n hook must run inside the provider during render). */
function EsgReportsView({
  title,
  heroImage,
  locale,
}: {
  title: string;
  heroImage?: string;
  locale: Locale;
}) {
  const t = useTranslations("tables");
  return (
    <TemplateShell title={title} locale={locale} heroImage={heroImage}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <ReportsTable
          rows={getEsgReports(locale)}
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
  const locale = params.locale as Locale;
  const data = await getPageData("esg-reports", locale);
  if (!data) notFound();

  return (
    <EsgReportsView title={data.title} heroImage={data.heroImage} locale={locale} />
  );
}


