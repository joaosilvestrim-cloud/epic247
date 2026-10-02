"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recebivelDe } from "@/lib/epic/kpi/importacao";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { importarCsv, salvarRecebivelManual, type Entidade } from "@/lib/epic/server/kpi";

// Ingestão de dados externos pelo admin (RF-096, RF-098, RF-104, RF-116).
// Arquivo separado de actions.ts para não misturar com o resto do admin.

const DESTINO: Record<Entidade, string> = {
  content_performance: "/admin/epic/conteudo",
  campaign_performance: "/admin/epic/midia",
  receivables: "/admin/epic/vendas",
};

const ORIGEM_PADRAO: Record<Entidade, string> = {
  content_performance: "instagram_csv",
  campaign_performance: "meta_ads_csv",
  receivables: "kiwify_extrato_csv",
};

/** Server Actions aceitam até 1 MB por padrão: o arquivo fica abaixo disso. */
const LIMITE_BYTES = 950_000;

export async function importarDados(f: FormData) {
  await exigirAdmin();
  const entidade = String(f.get("entidade") ?? "") as Entidade;
  if (!(entidade in DESTINO)) return;
  const volta = DESTINO[entidade];
  const arquivo = f.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) redirect(`${volta}?carga=vazio#importar`);
  if (arquivo.size > LIMITE_BYTES) redirect(`${volta}?carga=grande#importar`);
  const origemBruta = String(f.get("origem") ?? "").trim().toLowerCase();
  const origem = /^[a-z0-9_]{2,40}$/.test(origemBruta) ? origemBruta : ORIGEM_PADRAO[entidade];
  const plataforma = String(f.get("plataforma") ?? "").trim().toLowerCase() || null;
  const r = await importarCsv(entidade, await arquivo.text(), {
    origem, arquivo: arquivo.name.slice(0, 120), plataforma,
  });
  revalidatePath("/admin/epic", "layout");
  redirect(`${volta}?carga=${r.gravadas}-${r.falhas.length}-${r.total}#importar`);
}

export async function salvarRecebivel(f: FormData) {
  await exigirAdmin();
  const campos: Record<string, string> = {};
  for (const k of ["transaction_id", "installment_number", "installment_total", "expected_amount", "expected_date",
    "received_amount", "received_date", "receivable_status", "fee_amount", "net_received_amount"]) {
    const v = f.get(k);
    if (typeof v === "string" && v.trim()) campos[k] = v.trim().slice(0, 80);
  }
  const r = recebivelDe(campos);
  const erro = typeof r === "string" ? r : await salvarRecebivelManual(r);
  revalidatePath("/admin/epic", "layout");
  redirect(`/admin/epic/vendas?${erro ? `rec_erro=${encodeURIComponent(erro)}` : "rec=ok"}#recebiveis`);
}
