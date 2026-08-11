import TemplateShell from "@/components/layout/TemplateShell";
import ContactForm from "@/components/layout/ContactForm";
import { getPageData } from "@/lib/pages";
import type { Locale } from "@/lib/navigation";

interface Props {
  params: { locale: string };
}

export function generateMetadata({ params }: Props) {
  const data = getPageData("contact", params.locale as Locale);
  return { title: data?.metaTitle, description: data?.metaDescription };
}

export default function ContactPage({ params }: Props) {
  const locale = params.locale as Locale;
  const data = getPageData("contact", locale);
  if (!data) return null;

  return (
    <TemplateShell title={data.title} locale={locale}>
      <ContactForm />
    </TemplateShell>
  );
}
