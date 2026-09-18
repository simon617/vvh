import Link from "next/link";

/**
 * Global 404 fallback (deliverable 4.7 / WEB-08) for paths outside the locale
 * segments. Locale-prefixed 404s render `src/app/[locale]/not-found.tsx`
 * (localized, inside the public chrome); this English fallback is used for the
 * few non-locale paths that reach the router.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link href="/en" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}