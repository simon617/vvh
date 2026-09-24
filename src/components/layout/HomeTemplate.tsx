import Link from "next/link";
import { useTranslations } from "next-intl";
import type { PagePlaceholder } from "@/lib/pages";
import type { LatestReports } from "@/lib/pages";
import type { ReportRowItem } from "@/lib/report-rows";

interface HomeTemplateProps {
  pageData: PagePlaceholder;
  locale: "en" | "zh";
  latestReports: LatestReports;
}

function ReportCategory({
  title,
  rows,
  viewAllHref,
  viewAllLabel,
}: {
  title: string;
  rows: ReportRowItem[];
  viewAllHref: string;
  viewAllLabel: string;
}) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <div>
      <h3 className="font-semibold text-primary">{title}</h3>
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.id} className="text-sm">
            <a
              href={row.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {row.title}
            </a>
            <span className="text-gray-500"> — {row.date}</span>
          </li>
        ))}
      </ul>
      <Link
        href={viewAllHref}
        className="text-sm font-medium text-primary hover:underline"
      >
        {viewAllLabel}
      </Link>
    </div>
  );
}

export default function HomeTemplate({
  pageData,
  locale,
  latestReports,
}: HomeTemplateProps) {
  const t = useTranslations("home");
  const pathLocale = locale === "zh" ? "zh" : "en";
  const hasReports =
    latestReports.financial.length > 0 || latestReports.esg.length > 0;

  const metrics = [
    { value: t("listedValue"), label: t("metrics.listed") },
    { value: t("sectorValue"), label: t("metrics.sector") },
    { value: t("headquartersValue"), label: t("metrics.headquarters") },
    { value: t("businessValue"), label: t("metrics.business") },
  ];

  return (
    <div className="space-y-6">
      {/* Hero banner + company intro */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-lg p-8 mb-6">
        {pageData.heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pageData.heroImage}
            alt={pageData.title}
            className="w-full max-h-72 object-cover rounded-lg mb-4"
            data-testid="hero-image"
          />
        )}
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
          {pageData.title}
        </h1>
        <div
          className="text-lg leading-relaxed text-gray-200"
          dangerouslySetInnerHTML={{ __html: pageData.contentHtml }}
        />
      </section>

      {/* Key metrics */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("metricsTitle")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg bg-background-light p-4 text-center"
            >
              <div className="text-2xl font-bold text-primary mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-gray-500">{metric.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest reports */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("reportsTitle")}
        </h2>
        {hasReports ? (
          <div className="space-y-4">
            <ReportCategory
              title={t("reportsFinancialCategory")}
              rows={latestReports.financial}
              viewAllHref={`/${pathLocale}/financial-reports`}
              viewAllLabel={t("viewAll")}
            />
            <ReportCategory
              title={t("reportsEsgCategory")}
              rows={latestReports.esg}
              viewAllHref={`/${pathLocale}/esg-reports`}
              viewAllLabel={t("viewAll")}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t("reportsBody")}</p>
        )}
      </section>
    </div>
  );
}
