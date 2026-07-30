import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";

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

  return (
    <NextIntlClientProvider messages={messages}>
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