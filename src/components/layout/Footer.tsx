import { useTranslations } from "next-intl";

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-300">
            © {year} Vision Values Holdings Limited. All rights reserved.
          </div>
          <div className="flex space-x-4 text-sm text-gray-400">
            <a
              href={`/${locale}/contact`}
              className="hover:text-accent transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}