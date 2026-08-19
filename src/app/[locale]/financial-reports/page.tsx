import { useTranslations } from "next-intl";
import TemplateShell from "@/components/layout/TemplateShell";
import ReportsTable from "@/components/layout/ReportsTable";
import { getFinancialReports } from "@/lib/reports";
import { getPageData } from "@/lib/pages";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: { locale: string };
}

export function generateMetadata({ params }: Props) {
  const data = getPageData("financial-reports", params.locale as Locale);
  return { title: data?.metaTitle, description: data?.metaDescription };
}

export default function FinancialReportsPage({ params }: Props) {
  const locale = params.locale as Locale;
  const data = getPageData("financial-reports", locale);
  const t = useTranslations("tables");
  if (!data) return null;

  return (
    <TemplateShell title={data.title} locale={locale}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <ReportsTable
          rows={getFinancialReports(locale)}
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
