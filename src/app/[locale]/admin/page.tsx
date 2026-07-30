import { getSession } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const session = await getSession();

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-4">
          Welcome, <strong>{session?.username}</strong>.
        </p>
        <p className="text-gray-500 text-sm">
          This is the admin dashboard. Content management features will be added
          in Phase 2B.
        </p>
      </div>
    </div>
  );
}