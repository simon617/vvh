import Link from "next/link";
import enMessages from "../../../messages/en.json";
import zhMessages from "../../../messages/zh.json";

interface Props {
  params: { locale: string };
}

const toLocale = (value: string): "en" | "zh" => (value === "zh" ? "zh" : "en");

type NotFoundMessages = {
  title: string;
  heading: string;
  message: string;
  backHome: string;
};

/**
 * Localized 404 page (deliverable 4.7 / WEB-08).
 *
 * Renders inside the [locale]/layout so the site header/sidebar/footer chrome
 * is present, and offers a Back-to-Home link in the current locale. App Router
 * returns HTTP 404 automatically for this special `not-found` segment.
 */
export default async function NotFound({ params }: Props) {
  const locale = toLocale(params.locale);
  const messages: NotFoundMessages =
    locale === "zh" ? zhMessages.notFound : enMessages.notFound;

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">
          {messages.title}
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {messages.heading}
        </h2>
        <p className="text-gray-500 mb-8">{messages.message}</p>
        <Link href={`/${locale}`} className="btn-primary">
          {messages.backHome}
        </Link>
      </div>
    </div>
  );
}