"use client";

// Marketing e mídia do site no admin 2.0: tags de rastreamento, Conversions
// API e upload da foto da Ju. Saiu do painel do Ciclo 1 (auditoria NC-15):
// o 2.0 não depende mais de nada do legado.

import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { SETTING_KEYS, type TrackingSettings } from "@/lib/settings";

export function UploadCard({
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

interface CampoTag {
  chave: string;
  label: string;
  exemplo: string;
  ajuda: string;
  valor: string | null;
  segredo?: boolean;
}

export function MarketingView({
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
