import { isAdmin, adminConfigurado } from "@/lib/admin-auth";
import { getServiceClient } from "@/lib/supabase";
import { getSettings } from "@/lib/settings";
import type { Conteudo } from "@/lib/conteudos";
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
  let conteudos: Conteudo[] = [];
  let conteudosReady = false;

  if (supabase) {
    const { data: leadsData } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    leads = (leadsData as LeadRow[]) ?? [];

    const { data: contData, error: contError } = await supabase
      .from("conteudos")
      .select("*")
      .order("ordem", { ascending: true })
      .order("data", { ascending: true });
    conteudosReady = !contError;
    conteudos = (contData as Conteudo[]) ?? [];
  }

  const settings = await getSettings();

  return (
    <AdminDashboard
      leads={leads}
      settings={settings}
      supabaseReady={Boolean(supabase)}
      conteudos={conteudos}
      conteudosReady={conteudosReady}
    />
  );
}
