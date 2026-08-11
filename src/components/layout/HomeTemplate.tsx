import { useTranslations } from "next-intl";
import type { PagePlaceholder } from "@/lib/pages";

interface HomeTemplateProps {
  pageData: PagePlaceholder;
}

export default function HomeTemplate({ pageData }: HomeTemplateProps) {
  const t = useTranslations("home");

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
        <p className="text-sm text-gray-500">{t("reportsBody")}</p>
      </section>
    </div>
  );
}
