"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase-browser";
import { DRENOS, type DrenoId } from "@/lib/drenos";
import {
  SETTING_KEYS,
  type SiteSettings,
  type TrackingSettings,
} from "@/lib/settings";
import type { Conteudo } from "@/lib/conteudos";
import ConteudosView, { ConteudosAnalytics } from "./admin-conteudos";

type Aba = "visao" | "calendario" | "leads" | "midias" | "marketing";

export interface LeadRow {
  id: string;
  nome: string | null;
  email: string;
  dreno_dominante: DrenoId;
  dreno_secundario: DrenoId | null;
  scores: Record<string, number> | null;
  origem: string | null;
  created_at: string;
}

const DRENO_IDS: DrenoId[] = ["sono", "combustivel", "cortisol", "atencao", "movimento"];

function bateriaDe(scores: Record<string, number> | null): number | null {
  if (!scores) return null;
  const soma = Object.values(scores).reduce((a, b) => a + (b || 0), 0);
  return Math.round(100 - (soma / 45) * 100);
}

export default function AdminDashboard({
  leads,
  settings,
  tracking,
  capiTokenConfigurado,
  supabaseReady,
  conteudos,
  conteudosReady,
}: {
  leads: LeadRow[];
  settings: SiteSettings;
  tracking: TrackingSettings;
  capiTokenConfigurado: boolean;
  supabaseReady: boolean;
  conteudos: Conteudo[];
  conteudosReady: boolean;
}) {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("visao");

  const distribuicao = DRENO_IDS.map((id) => ({
    id,
    nome: DRENOS[id].nome,
    cor: DRENOS[id].cor,
    qtd: leads.filter((l) => l.dreno_dominante === id).length,
  }));
  const maxQtd = Math.max(1, ...distribuicao.map((d) => d.qtd));

  async function sair() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const abas: { id: Aba; label: string }[] = [
    { id: "visao", label: "Visão geral" },
    { id: "calendario", label: "Calendário" },
    { id: "leads", label: "Leads" },
    { id: "midias", label: "Mídias" },
    { id: "marketing", label: "Marketing" },
  ];

  return (
    <main className="min-h-screen bg-offwhite px-4 py-8 text-navy sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Painel EPIC247</h1>
            <p className="text-sm text-navy/60">Gestão de tarefas, leads e conteúdo</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-xl border border-line/50 px-4 py-2 text-sm font-medium transition hover:bg-cream"
            >
              Ver site
            </a>
            <button
              onClick={sair}
              className="rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white transition hover:brightness-125"
            >
              Sair
            </button>
          </div>
        </header>

        {/* Abas */}
        <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-line/40">
          {abas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                aba === a.id
                  ? "border-gold text-navy"
                  : "border-transparent text-navy/50 hover:text-navy"
              }`}
            >
              {a.label}
            </button>
          ))}
        </nav>

        {!supabaseReady && (
          <p className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            Supabase não está configurado no servidor, dados e uploads ficam
            indisponíveis.
          </p>
        )}

        {/* Visão geral */}
        {aba === "visao" && (
          <div className="mt-8 space-y-10">
            <ConteudosAnalytics conteudos={conteudos} />

            <section>
              <h2 className="mb-4 font-display text-2xl font-bold">Leads do quiz</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-line/40 bg-white p-6">
                  <p className="text-sm text-navy/60">Total de leads</p>
                  <p className="mt-1 font-display text-4xl font-black text-gold">
                    {leads.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-line/40 bg-white p-6 sm:col-span-2">
                  <p className="mb-3 text-sm text-navy/60">
                    Distribuição por Dreno Dominante
                  </p>
                  <div className="space-y-2">
                    {distribuicao.map((d) => (
                      <div key={d.id} className="flex items-center gap-3">
                        <span className="w-32 flex-shrink-0 text-sm">{d.nome}</span>
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-cream">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(d.qtd / maxQtd) * 100}%`,
                              backgroundColor: d.cor,
                            }}
                          />
                        </div>
                        <span className="w-8 text-right text-sm font-semibold">
                          {d.qtd}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Calendário de conteúdo */}
        {aba === "calendario" && (
          <div className="mt-8">
            <ConteudosView conteudos={conteudos} pronto={conteudosReady} />
          </div>
        )}

        {/* Leads */}
        {aba === "leads" && (
          <section className="mt-8">
            <h2 className="font-display text-2xl font-bold">Respostas do quiz</h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-line/40 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line/40 bg-cream/60 text-navy/70">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Data</th>
                    <th className="px-4 py-3 font-semibold">Nome</th>
                    <th className="px-4 py-3 font-semibold">E-mail</th>
                    <th className="px-4 py-3 font-semibold">Dominante</th>
                    <th className="px-4 py-3 font-semibold">Secundário</th>
                    <th className="px-4 py-3 font-semibold">Bateria</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-navy/50">
                        Nenhuma resposta ainda.
                      </td>
                    </tr>
                  )}
                  {leads.map((l) => {
                    const bat = bateriaDe(l.scores);
                    return (
                      <tr key={l.id} className="border-b border-line/20 last:border-0">
                        <td className="whitespace-nowrap px-4 py-3 text-navy/70">
                          {new Date(l.created_at).toLocaleString("pt-BR")}
                        </td>
                        <td className="px-4 py-3">{l.nome || "—"}</td>
                        <td className="px-4 py-3">{l.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                            style={{ backgroundColor: DRENOS[l.dreno_dominante]?.cor }}
                          >
                            {DRENOS[l.dreno_dominante]?.nome ?? l.dreno_dominante}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-navy/70">
                          {l.dreno_secundario
                            ? DRENOS[l.dreno_secundario]?.nome
                            : "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {bat !== null ? `${bat}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Mídias do site */}
        {aba === "midias" && (
          <div className="mt-8 space-y-10">
            <section>
              <h2 className="font-display text-2xl font-bold">Conteúdo do site</h2>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <UploadCard
                  titulo="Vídeo da VSL (hero)"
                  descricao="MP4 recomendado. Aparece no topo da landing page."
                  kind="video"
                  accept="video/*"
                  settingKey={SETTING_KEYS.heroVideoUrl}
                  atual={settings.heroVideoUrl}
                  tipo="video"
                  disabled={!supabaseReady}
                  onDone={() => router.refresh()}
                />
                <UploadCard
                  titulo="Foto da Ju Ferreira"
                  descricao="JPG ou PNG. Aparece no bloco de autoridade."
                  kind="ju"
                  accept="image/*"
                  settingKey={SETTING_KEYS.juPhotoUrl}
                  atual={settings.juPhotoUrl}
                  tipo="imagem"
                  disabled={!supabaseReady}
                  onDone={() => router.refresh()}
                />
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold">
                Relatórios (PDF por dreno)
              </h2>
              <p className="mt-1 text-sm text-navy/60">
                Estes são os PDFs enviados por e-mail ao concluir o quiz. Suba um novo
                arquivo para substituir o relatório de cada dreno.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {DRENO_IDS.map((id) => (
                  <ReportUploadCard
                    key={id}
                    drenoId={id}
                    nome={DRENOS[id].nome}
                    cor={DRENOS[id].cor}
                    disabled={!supabaseReady}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Marketing */}
        {aba === "marketing" && (
          <MarketingView
            tracking={tracking}
            capiTokenConfigurado={capiTokenConfigurado}
            disabled={!supabaseReady}
          />
        )}
      </div>
    </main>
  );
}

function UploadCard({
  titulo,
  descricao,
  kind,
  accept,
  settingKey,
  atual,
  tipo,
  disabled,
  onDone,
}: {
  titulo: string;
  descricao: string;
  kind: string;
  accept: string;
  settingKey: string;
  atual: string | null;
  tipo: "video" | "imagem";
  disabled: boolean;
  onDone: () => void;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro(null);
    setEnviando(true);
    setStatus("Preparando upload...");
    try {
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const path = `${kind}/${kind}-${Date.now()}.${ext}`;

      const r = await fetch("/api/admin/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => null);
        throw new Error(d?.error ?? "Falha ao preparar upload.");
      }
      const { token, path: signedPath, publicUrl } = await r.json();

      setStatus("Enviando arquivo...");
      const supabase = getBrowserClient();
      const { error } = await supabase.storage
        .from("assets")
        .uploadToSignedUrl(signedPath, token, file);
      if (error) throw new Error(error.message);

      setStatus("Salvando...");
      const s = await fetch("/api/admin/save-setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: settingKey, value: publicUrl }),
      });
      if (!s.ok) {
        const d = await s.json().catch(() => null);
        throw new Error(d?.error ?? "Falha ao salvar.");
      }

      setStatus("Concluído ✓");
      onDone();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro no upload.");
      setStatus(null);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line/40 bg-white p-6">
      <h3 className="font-display text-lg font-bold">{titulo}</h3>
      <p className="mt-1 text-sm text-navy/60">{descricao}</p>

      <div className="mt-4 overflow-hidden rounded-xl border border-line/40 bg-cream">
        {atual ? (
          tipo === "video" ? (
            <video src={atual} controls className="aspect-video w-full bg-black" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={atual} alt={titulo} className="aspect-video w-full object-cover" />
          )
        ) : (
          <div className="flex aspect-video items-center justify-center text-sm text-navy/40">
            Nenhum {tipo} enviado
          </div>
        )}
      </div>

      <label className="mt-4 block">
        <span className="sr-only">Escolher arquivo</span>
        <input
          type="file"
          accept={accept}
          disabled={disabled || enviando}
          onChange={handleFile}
          className="block w-full text-sm text-navy/70 file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:brightness-125 disabled:opacity-50"
        />
      </label>

      {status && <p className="mt-2 text-sm text-gold">{status}</p>}
      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
    </div>
  );
}

function ReportUploadCard({
  drenoId,
  nome,
  cor,
  disabled,
}: {
  drenoId: DrenoId;
  nome: string;
  cor: string;
  disabled: boolean;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [versao, setVersao] = useState(0); // cache-buster do link

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const url = base
    ? `${base}/storage/v1/object/public/assets/relatorios/${drenoId}.pdf`
    : null;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro(null);
    setEnviando(true);
    setStatus("Enviando...");
    try {
      const path = `relatorios/${drenoId}.pdf`;
      const r = await fetch("/api/admin/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => null);
        throw new Error(d?.error ?? "Falha ao preparar upload.");
      }
      const { token, path: signedPath } = await r.json();
      const supabase = getBrowserClient();
      const { error } = await supabase.storage
        .from("assets")
        .uploadToSignedUrl(signedPath, token, file);
      if (error) throw new Error(error.message);
      setStatus("Atualizado ✓");
      setVersao(versao + 1);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro no upload.");
      setStatus(null);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line/40 bg-white p-5">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 flex-shrink-0 rounded-full"
          style={{ backgroundColor: cor }}
        />
        <h3 className="font-semibold">{nome}</h3>
      </div>

      {url && (
        <a
          href={`${url}?v=${versao}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-gold underline-offset-2 hover:underline"
        >
          Ver PDF atual →
        </a>
      )}

      <label className="mt-3 block">
        <span className="sr-only">Substituir PDF de {nome}</span>
        <input
          type="file"
          accept="application/pdf"
          disabled={disabled || enviando}
          onChange={handleFile}
          className="block w-full text-sm text-navy/70 file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:brightness-125 disabled:opacity-50"
        />
      </label>

      {status && <p className="mt-2 text-sm text-gold">{status}</p>}
      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
    </div>
  );
}

/* ───────────────────────── Marketing ───────────────────────── */

interface CampoTag {
  chave: string;
  label: string;
  exemplo: string;
  ajuda: string;
  valor: string | null;
  segredo?: boolean;
}

function MarketingView({
  tracking,
  capiTokenConfigurado,
  disabled,
}: {
  tracking: TrackingSettings;
  capiTokenConfigurado: boolean;
  disabled: boolean;
}) {
  const principais: CampoTag[] = [
    {
      chave: SETTING_KEYS.gtmId,
      label: "Google Tag Manager",
      exemplo: "GTM-ABC1234",
      ajuda:
        "O coringa. Com o GTM ligado, você cadastra qualquer outra tag pelo painel do próprio Google, sem precisar de nada aqui.",
      valor: tracking.gtmId,
    },
    {
      chave: SETTING_KEYS.metaPixelId,
      label: "Pixel do Meta (Facebook e Instagram)",
      exemplo: "1234567890123456",
      ajuda:
        "Só números. Está no Gerenciador de Eventos do Business Manager, em Fontes de dados.",
      valor: tracking.metaPixelId,
    },
    {
      chave: SETTING_KEYS.ga4Id,
      label: "Google Analytics 4",
      exemplo: "G-ABC123XYZ",
      ajuda: "Começa com G-. Fica em Admin, Fluxos de dados, no painel do GA4.",
      valor: tracking.ga4Id,
    },
  ];

  const extras: CampoTag[] = [
    {
      chave: SETTING_KEYS.googleAdsId,
      label: "Google Ads · ID de conversão",
      exemplo: "AW-123456789",
      ajuda: "Começa com AW-. Está em Ferramentas, Conversões, no Google Ads.",
      valor: tracking.googleAdsId,
    },
    {
      chave: SETTING_KEYS.googleAdsLabel,
      label: "Google Ads · rótulo da conversão",
      exemplo: "AbC-D_efG12h34i5j",
      ajuda: "O rótulo que aparece junto do ID de conversão.",
      valor: tracking.googleAdsLabel,
    },
    {
      chave: SETTING_KEYS.tiktokPixelId,
      label: "Pixel do TikTok",
      exemplo: "CABC1DEFG2HIJ3KLM",
      ajuda: "Está no TikTok Ads Manager, em Ativos, Eventos.",
      valor: tracking.tiktokPixelId,
    },
    {
      chave: SETTING_KEYS.linkedinPartnerId,
      label: "LinkedIn · Partner ID",
      exemplo: "1234567",
      ajuda: "Só números. Está no Campaign Manager, em Insight Tag.",
      valor: tracking.linkedinPartnerId,
    },
  ];

  return (
    <div className="mt-8 space-y-10">
      <section>
        <h2 className="font-display text-[1.5rem] font-medium">
          Tags de rastreamento
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-navy/60">
          O que você salvar aqui entra no site na hora, sem precisar de deploy e sem
          depender do time de desenvolvimento. Deixe o campo em branco e salve para
          desligar uma tag.
        </p>

        <div className="mt-5 rounded-2xl border border-gold/40 bg-cream p-5">
          <p className="text-sm text-navy/80">
            <strong>Se estiver em dúvida, comece pelo Google Tag Manager.</strong> Com
            ele configurado, qualquer pixel novo (Meta, Google Ads, TikTok, LinkedIn,
            o que vier) é cadastrado direto no painel do GTM. Os campos abaixo existem
            para quem prefere instalar a tag direto, sem passar pelo GTM.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {principais.map((c) => (
            <CampoTagCard key={c.chave} campo={c} disabled={disabled} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-[1.5rem] font-medium">
          Conversions API do Meta
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-navy/60">
          Envia o evento de Lead direto do servidor para o Meta, o que melhora a
          atribuição e não é bloqueado por adblock. Precisa do Pixel preenchido acima
          e de um token gerado no Gerenciador de Eventos.
        </p>
        <div className="mt-5 max-w-xl">
          <CampoTagCard
            campo={{
              chave: SETTING_KEYS.metaCapiToken,
              label: "Token da Conversions API",
              exemplo: "EAAG...",
              ajuda:
                "Gerado no Gerenciador de Eventos, em Configurações, Conversions API. Fica guardado no servidor e não aparece no site.",
              valor: null,
              segredo: true,
            }}
            disabled={disabled}
            jaConfigurado={capiTokenConfigurado}
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-[1.5rem] font-medium">Outras redes</h2>
        <p className="mt-1 text-sm text-navy/60">
          Preencha só se for anunciar nessas plataformas.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {extras.map((c) => (
            <CampoTagCard key={c.chave} campo={c} disabled={disabled} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line/40 bg-white p-6">
        <h2 className="font-display text-[1.25rem] font-semibold">
          Como conferir se está funcionando
        </h2>
        <ol className="mt-3 space-y-2 text-sm text-navy/70">
          <li>
            1. Salve a tag, abra o site numa aba anônima e navegue por algumas páginas.
          </li>
          <li>
            2. No Meta, use o Testar Eventos do Gerenciador de Eventos. No Google, use
            o Modo de visualização do GTM ou o Tempo real do GA4.
          </li>
          <li>
            3. Os eventos que o site dispara sozinho são: PageView em toda página,
            InitiateCheckout ao clicar num botão de compra e Lead ao concluir o quiz.
          </li>
        </ol>
      </section>
    </div>
  );
}

function CampoTagCard({
  campo,
  disabled,
  jaConfigurado = false,
}: {
  campo: CampoTag;
  disabled: boolean;
  jaConfigurado?: boolean;
}) {
  const [valor, setValor] = useState(campo.valor ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(jaConfigurado || Boolean(campo.valor));

  const sujo = valor !== (campo.valor ?? "");

  async function salvar() {
    setErro(null);
    setStatus(null);
    setSalvando(true);
    try {
      const r = await fetch("/api/admin/save-setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: campo.chave, value: valor }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok) throw new Error(d?.error ?? "Falha ao salvar.");
      setStatus(valor.trim() ? "Salvo ✓" : "Tag desligada ✓");
      setSalvo(Boolean(valor.trim()));
      if (campo.segredo) setValor("");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line/40 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-navy">{campo.label}</h3>
        <span
          className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            salvo ? "bg-gold/20 text-gold" : "bg-line/20 text-navy/50"
          }`}
        >
          {salvo ? "Ativa" : "Desligada"}
        </span>
      </div>
      <p className="mt-1.5 text-sm text-navy/60">{campo.ajuda}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type={campo.segredo ? "password" : "text"}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          disabled={disabled || salvando}
          placeholder={
            campo.segredo && jaConfigurado
              ? "Token já salvo. Cole um novo para substituir."
              : campo.exemplo
          }
          spellCheck={false}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-xl border border-line/50 bg-offwhite px-3 py-2 font-mono text-sm text-navy outline-none transition focus:border-gold disabled:opacity-50"
        />
        <button
          onClick={salvar}
          disabled={disabled || salvando || (!sujo && !campo.segredo)}
          className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:brightness-125 disabled:opacity-40"
        >
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {status && <p className="mt-2 text-sm text-gold">{status}</p>}
      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
    </div>
  );
}
