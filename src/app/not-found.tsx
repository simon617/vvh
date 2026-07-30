import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/en" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}