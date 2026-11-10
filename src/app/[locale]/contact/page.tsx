import { notFound } from "next/navigation";
import { headers } from "next/headers";
import TemplateShell from "@/components/layout/TemplateShell";
import ContactForm from "@/components/layout/ContactForm";
import { getPageData } from "@/lib/pages";
import { buildPageMetadata } from "@/lib/metadata";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const data = await getPageData("contact", locale as Locale);
  return data ? buildPageMetadata(data, locale as Locale) : {};
}

export default async function ContactPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const data = await getPageData("contact", locale);
  if (!data) notFound();

  // Next.js 15: headers() is async — read the middleware-set pathname for the breadcrumb.
  const pathname =
    (await headers()).get("x-pathname") || `/${locale}/contact`;

  return (
    <TemplateShell
      title={data.title}
      locale={locale}
      heroImage={data.heroImage}
      pathname={pathname}
    >
      <ContactForm />
    </TemplateShell>
  );
}

