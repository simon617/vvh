import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import AdminNav from "./AdminNav";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Next.js 15+: route params and headers() are async and must be awaited.
  const { locale } = await params;
  const session = await getSession();
  const pathname = (await headers()).get("x-pathname") || "";

  // Public auth pages (login/setup) render standalone without AdminNav
  const isAuthPage =
    pathname.endsWith("/admin/login") || pathname.endsWith("/admin/setup");

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  return (
    <div className="min-h-screen bg-background-light">
      <AdminNav username={session.username} locale={locale} />
      <main className="p-6">{children}</main>
    </div>
  );
}
