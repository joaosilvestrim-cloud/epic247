import { isAdmin, adminConfigurado } from "@/lib/admin-auth";
import { getServiceClient } from "@/lib/supabase";
import { getSettings } from "@/lib/settings";
import type { Tarefa } from "@/lib/tarefas";
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
  let tarefas: Tarefa[] = [];
  let tarefasReady = false;

  if (supabase) {
    const { data: leadsData } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    leads = (leadsData as LeadRow[]) ?? [];

    const { data: tarefasData, error: tarefasError } = await supabase
      .from("tarefas")
      .select("*")
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: true });
    // Sem erro = tabela existe (mesmo que vazia)
    tarefasReady = !tarefasError;
    tarefas = (tarefasData as Tarefa[]) ?? [];
  }

  const settings = await getSettings();

  return (
    <AdminDashboard
      leads={leads}
      settings={settings}
      supabaseReady={Boolean(supabase)}
      tarefas={tarefas}
      tarefasReady={tarefasReady}
    />
  );
}
