import { isAdmin, adminConfigurado } from "@/lib/admin-auth";
import { getServiceClient } from "@/lib/supabase";
import { getSettings } from "@/lib/settings";
import AdminLogin from "@/components/admin-login";
import AdminDashboard, { type LeadRow } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "EPIC247 · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return <AdminLogin configurado={adminConfigurado()} />;
  }

  const supabase = getServiceClient();
  let leads: LeadRow[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    leads = (data as LeadRow[]) ?? [];
  }

  const settings = await getSettings();

  return (
    <AdminDashboard
      leads={leads}
      settings={settings}
      supabaseReady={Boolean(supabase)}
    />
  );
}
