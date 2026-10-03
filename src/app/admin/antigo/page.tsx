import { isAdmin, adminConfigurado } from "@/lib/admin-auth";
import { getServiceClient } from "@/lib/supabase";
import {
  getSettings,
  getTracking,
  getMetaCapiTokenConfigurado,
} from "@/lib/settings";
import type { Conteudo } from "@/legacy/ciclo1/conteudos";
import { getResumoOrigem } from "@/legacy/ciclo1/origem-resumo";
import AdminLogin from "@/components/admin-login";
import AdminDashboard, { type LeadRow } from "@/legacy/ciclo1/components/admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "EPIC247 · Admin antigo (Ciclo 1)",
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
  const tracking = await getTracking();
  const capiTokenConfigurado = await getMetaCapiTokenConfigurado();
  const resumoOrigem = await getResumoOrigem();

  return (
    <AdminDashboard
      leads={leads}
      settings={settings}
      tracking={tracking}
      capiTokenConfigurado={capiTokenConfigurado}
      resumoOrigem={resumoOrigem}
      supabaseReady={Boolean(supabase)}
      conteudos={conteudos}
      conteudosReady={conteudosReady}
    />
  );
}
