import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "./AdminNav";

export default async function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await getSession();

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