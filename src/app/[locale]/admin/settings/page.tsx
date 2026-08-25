import { getSiteSetting } from "@/lib/site-settings";
import SettingsForm from "@/components/admin/SettingsForm";

interface AdminSettingsPageProps {
  params: { locale: string };
}

/**
 * Admin settings page (deliverable 2B.10): loads global site_name + GA4 ID
 * and renders the SettingsForm (which also handles logo upload, 2B.7).
 */
export default async function AdminSettingsPage(_props: AdminSettingsPageProps) {
  const siteName = (await getSiteSetting("site_name")) ?? "";
  const ga4 = (await getSiteSetting("ga4_tracking_id")) ?? "";

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Settings</h1>
      <SettingsForm initial={{ site_name: siteName, ga4_tracking_id: ga4 }} />
    </div>
  );
}