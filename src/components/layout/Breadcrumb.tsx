import Link from "next/link";
import { getBreadcrumbs, type Breadcrumb as BreadcrumbItem } from "@/lib/breadcrumbs";
import type { Locale } from "@/lib/navigation";

interface BreadcrumbProps {
  pathname: string;
  locale: Locale;
}

export default function Breadcrumb({ pathname, locale }: BreadcrumbProps) {
  const crumbs = getBreadcrumbs(pathname, locale);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
      <ol className="flex flex-wrap items-center gap-1">
        {crumbs.map((crumb: BreadcrumbItem, index: number) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={`${crumb.href}-${index}`} className="flex items-center gap-1">
              {index > 0 && <span aria-hidden="true">/</span>}
              {isLast ? (
                <span className="text-gray-700 font-medium" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="hover:text-primary transition-colors">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}