import { notFound } from "next/navigation";
import TemplateShell from "@/components/layout/TemplateShell";
import ContactForm from "@/components/layout/ContactForm";
import { getPageData } from "@/lib/pages";
import { buildPageMetadata } from "@/lib/metadata";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props) {
  const data = await getPageData("contact", params.locale as Locale);
  return data ? buildPageMetadata(data, params.locale as Locale) : {};
}

export default async function ContactPage({ params }: Props) {
  const locale = params.locale as Locale;
  const data = await getPageData("contact", locale);
  if (!data) notFound();

  return (
    <TemplateShell
      title={data.title}
      locale={locale}
      heroImage={data.heroImage}
    >
      <ContactForm />
    </TemplateShell>
  );
}

