"use client";

import { useEffect, useState } from "react";
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
import type {
  DetalheOrigem,
  PeriodoOrigem,
  ResumoOrigem,
} from "@/lib/origem-resumo";
import { QUIZ_QUESTIONS } from "@/lib/quiz-data";

type Aba = "visao" | "calendario" | "leads" | "origem" | "midias" | "marketing";

export interface LeadRow {
  id: string;
  nome: string | null;
  email: string;
  dreno_dominante: DrenoId;
  dreno_secundario: DrenoId | null;
  scores: Record<string, number> | null;
  origem: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
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
  resumoOrigem,
  supabaseReady,
  conteudos,
  conteudosReady,
}: {
  leads: LeadRow[];
  settings: SiteSettings;
  tracking: TrackingSettings;
  capiTokenConfigurado: boolean;
  resumoOrigem: ResumoOrigem;
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
    { id: "origem", label: "Origem" },
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
                    <th className="px-4 py-3 font-semibold">Origem</th>
                    <th className="px-4 py-3 font-semibold">Dominante</th>
                    <th className="px-4 py-3 font-semibold">Secundário</th>
                    <th className="px-4 py-3 font-semibold">Bateria</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-navy/50">
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
                        <td className="whitespace-nowrap px-4 py-3 text-navy/70">
                          {l.utm_source ? nomeFonte(l.utm_source, l.utm_medium ?? "") : "—"}
                        </td>
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

        {/* Origem do tráfego */}
        {aba === "origem" && <OrigemView resumo={resumoOrigem} />}

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
        "O coringa. Com o GTM ligado, você cadastra qualquer outra tag pelo painel do próprio Google. Pode colar o código inteiro ou só o GTM-.",
      valor: tracking.gtmId,
    },
    {
      chave: SETTING_KEYS.metaPixelId,
      label: "Pixel do Meta (Facebook e Instagram)",
      exemplo: "1234567890123456",
      ajuda:
        "Pode colar o código inteiro que o Meta entrega, ou só o número. Está no Gerenciador de Eventos, em Fontes de dados.",
      valor: tracking.metaPixelId,
    },
    {
      chave: SETTING_KEYS.ga4Id,
      label: "Google Analytics 4",
      exemplo: "G-ABC123XYZ",
      ajuda: "Começa com G-. Pode colar o código inteiro do gtag. Fica em Admin, Fluxos de dados, no GA4.",
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
  const [base, setBase] = useState(campo.valor ?? "");

  const sujo = valor !== base;

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
      const final: string = typeof d?.value === "string" ? d.value : valor.trim();
      const extraiu = final !== valor.trim();
      setStatus(
        !final
          ? "Tag desligada ✓"
          : extraiu && !campo.segredo
            ? `Salvo ✓ ID ${final} tirado do código colado`
            : "Salvo ✓"
      );
      setSalvo(Boolean(final));
      if (campo.segredo) {
        setValor("");
      } else {
        setValor(final);
        setBase(final);
      }
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

/* ───────────────────────── Origem ───────────────────────── */

const NOMES_FONTE: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  meta: "Meta (Instagram ou Facebook)",
  google: "Google",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  x: "X (Twitter)",
  email: "E-mail",
};

const NOMES_MEIO: Record<string, string> = {
  bio: "link da bio",
  stories: "stories",
  story: "stories",
  referral: "link",
  organic: "busca",
  clique: "clique",
  cpc: "anúncio",
  paid: "anúncio",
  ads: "anúncio",
};

/** "instagram" + "bio" vira "Instagram · link da bio". */
function nomeFonte(source: string, medium: string): string {
  if (source === "direto") return "Acesso direto";
  if (source === "(sem origem)") return "Sem origem (antes do rastreio)";
  const fonte = NOMES_FONTE[source] ?? source;
  const meio = medium ? NOMES_MEIO[medium] ?? medium : "";
  return meio ? `${fonte} · ${meio}` : fonte;
}

function taxa(parte: number, todo: number): string {
  if (!todo) return "—";
  const v = (parte / todo) * 100;
  return `${v < 10 ? v.toFixed(1) : Math.round(v)}%`;
}

function OrigemView({ resumo }: { resumo: ResumoOrigem }) {
  const [periodo, setPeriodo] = useState<PeriodoOrigem>("30");

  if (!resumo.pronto) {
    return (
      <section className="mt-8 rounded-2xl border border-gold/40 bg-cream p-6">
        <h2 className="font-display text-[1.5rem] font-medium">
          Falta um passo no banco
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-navy/70">
          O rastreio de origem precisa de uma tabela nova no Supabase. Abra o SQL
          Editor, cole o conteúdo do arquivo{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">
            supabase/003_origem.sql
          </code>{" "}
          e clique em Run. Depois é só recarregar esta página.
        </p>
      </section>
    );
  }

  const linhas = resumo.periodos[periodo];
  const tot = linhas.reduce(
    (a, l) => ({
      visitantes: a.visitantes + l.visitantes,
      leads: a.leads + l.leads,
      checkouts: a.checkouts + l.checkouts,
    }),
    { visitantes: 0, leads: 0, checkouts: 0 }
  );

  const periodos: { id: PeriodoOrigem; label: string }[] = [
    { id: "7", label: "7 dias" },
    { id: "30", label: "30 dias" },
    { id: "tudo", label: "Tudo" },
  ];

  const cards = [
    { label: "Visitantes", valor: String(tot.visitantes) },
    { label: "Leads do quiz", valor: String(tot.leads), sub: `${taxa(tot.leads, tot.visitantes)} dos visitantes` },
    {
      label: "Cliques em comprar",
      valor: String(tot.checkouts),
      sub: `${taxa(tot.checkouts, tot.visitantes)} dos visitantes`,
    },
  ];

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[1.5rem] font-medium">
            De onde vêm as pessoas
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-navy/60">
            Cada visita é contada uma vez por sessão. A origem fica guardada por 30
            dias, então quem clica na bio e volta depois digitando o endereço
            continua contando para o Instagram.
          </p>
        </div>
        <div className="flex rounded-xl border border-line/50 bg-white p-1">
          {periodos.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                periodo === p.id ? "bg-navy text-white" : "text-navy/60 hover:text-navy"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-line/40 bg-white p-6">
            <p className="text-sm text-navy/60">{c.label}</p>
            <p className="mt-1 font-display text-4xl font-semibold text-navy">{c.valor}</p>
            {c.sub && <p className="mt-1 text-sm text-navy/50">{c.sub}</p>}
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line/40 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line/40 bg-cream/60 text-navy/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Origem</th>
              <th className="px-4 py-3 text-right font-semibold">Visitantes</th>
              <th className="px-4 py-3 text-right font-semibold">Leads</th>
              <th className="px-4 py-3 text-right font-semibold">Visitante → lead</th>
              <th className="px-4 py-3 text-right font-semibold">Cliques em comprar</th>
              <th className="px-4 py-3 text-right font-semibold">Visitante → clique</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy/50">
                  Nenhuma visita registrada neste período.
                </td>
              </tr>
            )}
            {linhas.map((l) => (
              <tr
                key={`${l.utm_source}|${l.utm_medium}`}
                className="border-b border-line/20 last:border-0"
              >
                <td className="px-4 py-3 font-medium">
                  {nomeFonte(l.utm_source, l.utm_medium)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{l.visitantes}</td>
                <td className="px-4 py-3 text-right tabular-nums">{l.leads}</td>
                <td className="px-4 py-3 text-right tabular-nums text-navy/60">
                  {taxa(l.leads, l.visitantes)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{l.checkouts}</td>
                <td className="px-4 py-3 text-right tabular-nums text-navy/60">
                  {taxa(l.checkouts, l.visitantes)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DetalheOrigemView periodo={periodo} linhas={linhas} />

      <section className="rounded-2xl border border-line/40 bg-white p-6">
        <h3 className="font-display text-[1.25rem] font-semibold">E as vendas?</h3>
        <p className="mt-2 max-w-3xl text-sm text-navy/70">
          A compra acontece no Kiwify, fora do site. Por isso o botão de compra leva a
          origem junto no link. No painel do Kiwify, o relatório de vendas filtrado
          por UTM mostra quantas vendas vieram de cada origem desta tabela.
        </p>
        <p className="mt-3 max-w-3xl text-sm text-navy/70">
          Para separar cada post ou campanha, use links diferentes. Por exemplo:{" "}
          <code className="rounded bg-cream px-1.5 py-0.5 text-xs">
            epic247.com.br/?utm_source=instagram&amp;utm_medium=stories&amp;utm_campaign=live1
          </code>
        </p>
      </section>
    </div>
  );
}

/* ─────────────── Origem: funil, abandono do quiz e perfil ─────────────── */

const NOMES_PERFIL: Record<string, Record<string, string>> = {
  dispositivo: { celular: "Celular", computador: "Computador", tablet: "Tablet" },
  app: {
    instagram: "Navegador do Instagram",
    facebook: "Navegador do Facebook",
    tiktok: "Navegador do TikTok",
    linkedin: "Navegador do LinkedIn",
    navegador: "Navegador normal (Chrome, Safari...)",
  },
  sistema: {
    ios: "iPhone / iPad",
    android: "Android",
    windows: "Windows",
    mac: "Mac",
    chromeos: "Chromebook",
    linux: "Linux",
  },
};

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function Barra({
  label,
  valor,
  max,
  sub,
  destaque = false,
}: {
  label: string;
  valor: number;
  max: number;
  sub?: string;
  destaque?: boolean;
}) {
  const pct = max ? Math.max(2, Math.round((valor / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className={destaque ? "font-semibold text-navy" : "text-navy/80"}>{label}</span>
        <span className="tabular-nums text-navy/60">
          <strong className="text-navy">{valor}</strong>
          {sub ? ` · ${sub}` : ""}
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-line/20">
        <div
          className={`h-full rounded-full ${destaque ? "bg-red-400" : "bg-gold"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CartaoPerfil({
  titulo,
  linhas,
  vazio = "Sem dados ainda.",
}: {
  titulo: string;
  linhas: { label: string; valor: number }[];
  vazio?: string;
}) {
  const total = linhas.reduce((a, l) => a + l.valor, 0);
  const max = Math.max(0, ...linhas.map((l) => l.valor));
  return (
    <div className="rounded-2xl border border-line/40 bg-white p-5">
      <h4 className="font-semibold text-navy">{titulo}</h4>
      <div className="mt-4 space-y-3">
        {linhas.length === 0 && <p className="text-sm text-navy/50">{vazio}</p>}
        {linhas.map((l) => (
          <Barra
            key={l.label}
            label={l.label}
            valor={l.valor}
            max={max}
            sub={taxa(l.valor, total)}
          />
        ))}
      </div>
    </div>
  );
}

function DetalheOrigemView({
  periodo,
  linhas,
}: {
  periodo: PeriodoOrigem;
  linhas: { utm_source: string; utm_medium: string }[];
}) {
  // "" = todas as origens; senão "source|medium".
  const [fonte, setFonte] = useState("");
  const [dados, setDados] = useState<DetalheOrigem | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(false);
    const q = new URLSearchParams({ periodo });
    if (fonte) {
      const [s, m] = fonte.split("|");
      q.set("source", s);
      q.set("medium", m ?? "");
    }
    fetch(`/api/admin/origem?${q}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: DetalheOrigem) => ativo && setDados(d))
      .catch(() => ativo && setErro(true))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [periodo, fonte]);

  const opcoes = linhas.filter((l) => l.utm_source !== "(sem origem)");

  const cabecalho = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-[1.5rem] font-medium">O caminho das pessoas</h2>
        <p className="mt-1 max-w-2xl text-sm text-navy/60">
          Do primeiro acesso até o clique em comprar. Filtre por origem para comparar
          quem vem do Instagram com quem vem de outros lugares.
        </p>
      </div>
      <select
        value={fonte}
        onChange={(e) => setFonte(e.target.value)}
        className="rounded-xl border border-line/50 bg-white px-3 py-2 text-sm font-semibold text-navy"
      >
        <option value="">Todas as origens</option>
        {opcoes.map((l) => (
          <option key={`${l.utm_source}|${l.utm_medium}`} value={`${l.utm_source}|${l.utm_medium}`}>
            {nomeFonte(l.utm_source, l.utm_medium)}
          </option>
        ))}
      </select>
    </div>
  );

  if (carregando && !dados) {
    return (
      <section className="space-y-4">
        {cabecalho}
        <p className="text-sm text-navy/50">Carregando...</p>
      </section>
    );
  }

  if (erro) {
    return (
      <section className="space-y-4">
        {cabecalho}
        <p className="text-sm text-red-600">Não foi possível carregar os dados agora.</p>
      </section>
    );
  }

  if (!dados?.pronto) {
    return (
      <section className="rounded-2xl border border-gold/40 bg-cream p-6">
        <h2 className="font-display text-[1.5rem] font-medium">Falta um passo no banco</h2>
        <p className="mt-2 max-w-2xl text-sm text-navy/70">
          O funil, o abandono do quiz e o perfil das visitas precisam do arquivo{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">
            supabase/004_funil.sql
          </code>
          . Cole no SQL Editor do Supabase, clique em Run e recarregue esta página.
        </p>
      </section>
    );
  }

  // ── Funil ──
  const funil = dados.funil;
  const topo = funil[0]?.pessoas ?? 0;
  // Maior perda entre etapas seguidas da jornada principal (até o e-mail).
  let piorFunil = -1;
  let maiorPerdaFunil = 0;
  for (let i = 1; i < funil.length - 1; i++) {
    const perda = funil[i - 1].pessoas - funil[i].pessoas;
    if (perda > maiorPerdaFunil) {
      maiorPerdaFunil = perda;
      piorFunil = i;
    }
  }

  // ── Quiz ──
  const porEtapa = new Map(dados.quiz.map((q) => [q.etapa, q.pessoas]));
  const inicioQuiz = funil.find((f) => f.ordem === 3)?.pessoas ?? 0;
  const etapasQuiz = QUIZ_QUESTIONS.map((q, i) => ({
    n: i + 1,
    pergunta: q.pergunta,
    pessoas: porEtapa.get(i + 1) ?? 0,
  }));
  let piorQuizN = 0;
  let piorQuizPerda = 0;
  for (let i = 0; i < etapasQuiz.length; i++) {
    const antes = i === 0 ? inicioQuiz : etapasQuiz[i - 1].pessoas;
    const perdeu = antes - etapasQuiz[i].pessoas;
    if (perdeu > piorQuizPerda) {
      piorQuizPerda = perdeu;
      piorQuizN = etapasQuiz[i].n;
    }
  }
  const piorQuiz = piorQuizN
    ? { n: piorQuizN, perdeu: piorQuizPerda, pergunta: etapasQuiz[piorQuizN - 1].pergunta }
    : null;
  const maxQuiz = Math.max(inicioQuiz, ...etapasQuiz.map((e) => e.pessoas));

  // ── Perfil ──
  const dim = (d: string) =>
    dados.perfil
      .filter((p) => p.dimensao === d)
      .sort((a, b) => b.visitantes - a.visitantes);
  const rotulo = (d: string, v: string) =>
    NOMES_PERFIL[d]?.[v] ?? (v === "desconhecido" ? "Não identificado" : v);
  const cartao = (d: string, limite = 8) =>
    dim(d)
      .slice(0, limite)
      .map((p) => ({ label: rotulo(d, p.valor), valor: p.visitantes }));

  const horas = Array.from({ length: 24 }, (_, h) => ({
    h,
    v: dim("hora").find((p) => Number(p.valor) === h)?.visitantes ?? 0,
  }));
  const maxHora = Math.max(0, ...horas.map((x) => x.v));
  const dias = DIAS_SEMANA.map((nome, d) => ({
    nome,
    v: dim("dia_semana").find((p) => Number(p.valor) === d)?.visitantes ?? 0,
  }));
  const maxDia = Math.max(0, ...dias.map((x) => x.v));
  const melhorHora = maxHora ? horas.find((x) => x.v === maxHora)?.h : null;
  const melhorDia = maxDia ? dias.find((x) => x.v === maxDia)?.nome : null;

  return (
    <div className={`space-y-8 transition-opacity ${carregando ? "opacity-50" : ""}`}>
      {cabecalho}

      {/* Funil */}
      <section className="rounded-2xl border border-line/40 bg-white p-6">
        <h3 className="font-display text-[1.25rem] font-semibold">Funil</h3>
        <p className="mt-1 text-sm text-navy/60">
          Pessoas, não cliques. O clique em comprar não depende do quiz: dá para
          comprar direto pela página.
        </p>
        <div className="mt-5 space-y-4">
          {funil.map((f, i) => (
            <Barra
              key={f.ordem}
              label={f.etapa}
              valor={f.pessoas}
              max={topo}
              sub={i === 0 ? undefined : `${taxa(f.pessoas, topo)} de quem visitou`}
              destaque={i === piorFunil}
            />
          ))}
        </div>
        {piorFunil > 0 && (
          <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            A maior perda está entre <strong>{funil[piorFunil - 1].etapa}</strong> e{" "}
            <strong>{funil[piorFunil].etapa}</strong>: {maiorPerdaFunil}{" "}
            {maiorPerdaFunil === 1 ? "pessoa ficou" : "pessoas ficaram"} pelo caminho.
          </p>
        )}
      </section>

      {/* Abandono do quiz */}
      <section className="rounded-2xl border border-line/40 bg-white p-6">
        <h3 className="font-display text-[1.25rem] font-semibold">Abandono do quiz</h3>
        <p className="mt-1 text-sm text-navy/60">
          Quantas pessoas responderam cada pergunta. A barra vermelha é onde mais
          gente desistiu.
        </p>
        {inicioQuiz === 0 ? (
          <p className="mt-4 text-sm text-navy/50">Ninguém começou o quiz neste período.</p>
        ) : (
          <>
            <div className="mt-5 space-y-2.5">
              <Barra label="Começou" valor={inicioQuiz} max={maxQuiz} />
              {etapasQuiz.map((e) => (
                <Barra
                  key={e.n}
                  label={`Pergunta ${e.n}`}
                  valor={e.pessoas}
                  max={maxQuiz}
                  sub={taxa(e.pessoas, inicioQuiz)}
                  destaque={piorQuiz?.n === e.n}
                />
              ))}
            </div>
            {piorQuiz && (
              <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                <strong>Pergunta {piorQuiz.n}</strong> perdeu {piorQuiz.perdeu}{" "}
                {piorQuiz.perdeu === 1 ? "pessoa" : "pessoas"}: “{piorQuiz.pergunta}”
              </p>
            )}
          </>
        )}
      </section>

      {/* Perfil */}
      <section>
        <h3 className="font-display text-[1.25rem] font-semibold">Quem são os visitantes</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CartaoPerfil titulo="Aparelho" linhas={cartao("dispositivo")} />
          <CartaoPerfil titulo="Onde abriu o link" linhas={cartao("app")} />
          <CartaoPerfil titulo="Sistema" linhas={cartao("sistema")} />
          <CartaoPerfil titulo="Estados" linhas={cartao("estado")} />
          <CartaoPerfil titulo="Cidades" linhas={cartao("cidade")} />
          <CartaoPerfil titulo="Países" linhas={cartao("pais", 5)} />
        </div>
      </section>

      {/* Horários */}
      <section className="rounded-2xl border border-line/40 bg-white p-6">
        <h3 className="font-display text-[1.25rem] font-semibold">Quando as visitas chegam</h3>
        <p className="mt-1 text-sm text-navy/60">
          Horário de Brasília.
          {melhorHora != null && melhorDia && (
            <>
              {" "}
              O pico é <strong>{melhorDia}</strong>, e o horário mais forte é{" "}
              <strong>
                {String(melhorHora).padStart(2, "0")}h às{" "}
                {String((melhorHora + 1) % 24).padStart(2, "0")}h
              </strong>
              . Bom sinal para a hora de postar.
            </>
          )}
        </p>

        <div className="mt-6 flex h-36 items-end gap-1">
          {horas.map((x) => (
            <div key={x.h} className="flex h-full flex-1 flex-col items-center justify-end">
              <div
                title={`${x.h}h: ${x.v} visitas`}
                className={`w-full rounded-t ${x.v === maxHora && maxHora ? "bg-gold" : "bg-navy/25"}`}
                style={{ height: `${maxHora ? Math.max(2, (x.v / maxHora) * 100) : 2}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-1 text-[10px] text-navy/40">
          {horas.map((x) => (
            <span key={x.h} className="flex-1 text-center">
              {x.h % 3 === 0 ? `${x.h}h` : ""}
            </span>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-7 gap-2">
          {dias.map((d) => (
            <div key={d.nome} className="text-center">
              <div className="flex h-24 items-end">
                <div
                  title={`${d.nome}: ${d.v} visitas`}
                  className={`w-full rounded-t ${d.v === maxDia && maxDia ? "bg-gold" : "bg-navy/25"}`}
                  style={{ height: `${maxDia ? Math.max(3, (d.v / maxDia) * 100) : 3}%` }}
                />
              </div>
              <p className="mt-1 text-xs font-semibold text-navy/70">{d.nome}</p>
              <p className="text-xs tabular-nums text-navy/50">{d.v}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
