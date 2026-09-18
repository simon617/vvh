import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import GAScript from "@/components/layout/GAScript";
import { getSiteSetting } from "@/lib/site-settings";

const locales = ["en", "zh"];

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  // GA4 measurement ID is a global site setting (D13); the script only loads
  // when an ID is configured (deliverable 4.3).
  const gaMeasurementId = (await getSiteSetting("ga4_tracking_id")) ?? "";

  return (
    <NextIntlClientProvider messages={messages}>
      {gaMeasurementId ? <GAScript measurementId={gaMeasurementId} /> : null}
      <div className="min-h-screen flex flex-col">
        <Header locale={locale} />
        <div className="flex-1 flex">
          <Sidebar locale={locale} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
        <Footer locale={locale} />
      </div>
    </NextIntlClientProvider>
  );
}