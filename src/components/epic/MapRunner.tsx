"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { enviar, espelhar, rastrear } from "@/lib/epic/client/track";
import { MICRO } from "@/lib/epic/content/microcopy";
import SinalFriccao from "./SinalFriccao";

// MapEngine na tela (Blueprint §10). Um componente para os 11 Mapas.
// Estados: intro → (resume) → question → calculating → (error).
// O resultado NUNCA é calculado aqui: o servidor recalcula a partir das
// respostas e devolve só o token do resultado.

export interface PerguntaRunner {
  id: string;
  texto: string;
  opcoes: { valor: string | number; rotulo: string }[];
}

interface Props {
  mapType: string;
  titulo: string;
  tempo: string;
  resumo: string;
  aviso: string;
  /** Áreas que o Mapa lê (nomes dos eixos nos documentos), mostradas na abertura. */
  areas?: string[];
  perguntas: PerguntaRunner[];
  /** Ex.: "/mapas/energia/resultado" ou "/mapa/resultado" */
  caminhoResultado: string;
  /** Frase de cálculo própria do Mapa (Copy Final, microcopy por dimensão). */
  calculando?: string;
}

type Estado = "intro" | "resume" | "question" | "calculating" | "error";
type Respostas = Record<string, string | number>;

const chaveLocal = (id: string) => `epic_mapa_${id}`;

export default function MapRunner(p: Props) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("intro");
  const [avancando, setAvancando] = useState(false);
  const [mapaId, setMapaId] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Respostas>({});
  const [indice, setIndice] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [iniciando, setIniciando] = useState(false);
  const [confirmarRecomeco, setConfirmarRecomeco] = useState(false);
  const quartisEnviados = useRef(new Set<number>());
  const tituloPergunta = useRef<HTMLHeadingElement>(null);
  const total = p.perguntas.length;

  useEffect(() => {
    rastrear("ViewMapEntry", { map_type: p.mapType });
  }, [p.mapType]);

  // Foco no enunciado a cada pergunta (leitor de tela e teclado).
  useEffect(() => {
    if (estado === "question") tituloPergunta.current?.focus();
  }, [estado, indice]);

  const salvarLocal = useCallback((id: string, r: Respostas, i: number) => {
    try {
      sessionStorage.setItem(chaveLocal(id), JSON.stringify({ r, i }));
    } catch {
      /* storage bloqueado: o servidor ainda guarda */
    }
  }, []);

  async function comecar() {
    setIniciando(true);
    setErro(null);
    try {
      const q = new URL(window.location.href).searchParams;
      const d = await enviar<{
        map_result_id: string; answers: Respostas; step: number; retomado: boolean; event_id: string;
      }>("/api/v2/mapas/iniciar", {
        map_type: p.mapType,
        utm_source: q.get("utm_source"),
        utm_medium: q.get("utm_medium"),
        utm_campaign: q.get("utm_campaign"),
        utm_content: q.get("utm_content"),
        landing_page: window.location.pathname,
        referrer: document.referrer || null,
      });
      setMapaId(d.map_result_id);
      // Respostas locais mais recentes vencem as do servidor (refresh no meio).
      let r = d.answers ?? {};
      let i = d.step ?? 0;
      try {
        const local = sessionStorage.getItem(chaveLocal(d.map_result_id));
        if (local) {
          const l = JSON.parse(local) as { r: Respostas; i: number };
          if (Object.keys(l.r).length >= Object.keys(r).length) {
            r = l.r;
            i = l.i;
          }
        }
      } catch {
        /* ignora */
      }
      setRespostas(r);
      setIndice(Math.min(i, total - 1));
      if (d.retomado) {
        espelhar("ResumeMap", d.event_id, { map_type: p.mapType });
        setEstado("resume");
      } else {
        espelhar("StartMap", d.event_id, { map_type: p.mapType });
        setEstado("question");
      }
    } catch (e) {
      setErro(e instanceof Error && e.message ? e.message : MICRO.erro.texto);
    } finally {
      setIniciando(false);
    }
  }

  function recomecar() {
    setConfirmarRecomeco(false);
    setRespostas({});
    setIndice(0);
    if (mapaId) {
      salvarLocal(mapaId, {}, 0);
      void enviar("/api/v2/mapas/progresso", { map_result_id: mapaId, answers: {}, step: 0 }).catch(() => {});
    }
    setEstado("question");
  }

  async function concluir(r: Respostas) {
    if (!mapaId) return;
    setEstado("calculating");
    setErro(null);
    try {
      const d = await enviar<{ token: string; event_id: string }>("/api/v2/mapas/concluir", {
        map_result_id: mapaId,
        answers: r,
      });
      if (d.event_id) espelhar("CompleteMap", d.event_id, { map_type: p.mapType });
      try {
        sessionStorage.removeItem(chaveLocal(mapaId));
      } catch {
        /* ignora */
      }
      router.push(`${p.caminhoResultado}/${d.token}`);
    } catch (e) {
      setErro(e instanceof Error && e.message ? e.message : MICRO.erro.texto);
      setEstado("error");
    }
  }

  function responder(valor: string | number) {
    if (!mapaId || avancando) return;
    const pergunta = p.perguntas[indice];
    const novas = { ...respostas, [pergunta.id]: valor };
    setRespostas(novas);
    const proximo = indice + 1;
    salvarLocal(mapaId, novas, Math.min(proximo, total - 1));
    void enviar("/api/v2/mapas/progresso", { map_result_id: mapaId, answers: novas, step: proximo }).catch(() => {});

    // Progresso por quartis, para não inundar o analytics (docs dos Mapas).
    const quartil = Math.floor((proximo / total) * 4);
    if (quartil >= 1 && quartil <= 3 && !quartisEnviados.current.has(quartil)) {
      quartisEnviados.current.add(quartil);
      rastrear("MapQuestionProgress", { map_type: p.mapType, question_index: proximo });
    }

    // Um instante com a escolha marcada antes de seguir: a pessoa vê o que respondeu.
    setAvancando(true);
    window.setTimeout(() => {
      setAvancando(false);
      if (proximo >= total) void concluir(novas);
      else setIndice(proximo);
    }, 260);
  }

  const respondidas = useMemo(
    () => p.perguntas.filter((q) => respostas[q.id] !== undefined).length,
    [p.perguntas, respostas]
  );

  // ── Telas ──

  if (estado === "intro") {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="entrada-suave font-mono text-sm text-latao-escuro">{p.tempo}</p>
        <h1 className="entrada mt-4 font-display text-[2.6rem] font-normal leading-[1.08] text-grafite sm:text-[3.4rem]">
          {p.titulo}
        </h1>
        <p className="entrada mt-6 text-lg leading-relaxed text-grafite/80" style={{ "--atraso": "150ms" } as React.CSSProperties}>
          {p.resumo}
        </p>
        {p.areas && p.areas.length > 0 && (
          <div className="mt-9">
            <p className="entrada-suave text-sm text-mineral-escuro" style={{ "--atraso": "220ms" } as React.CSSProperties}>
              O Mapa olha para cinco áreas:
            </p>
            <ol className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {p.areas.map((a, i) => (
                <li
                  key={a}
                  className="entrada flex items-center gap-2 font-display text-lg text-grafite"
                  style={{ "--atraso": `${300 + i * 90}ms` } as React.CSSProperties}
                >
                  <span aria-hidden className="h-3 w-px bg-latao" />
                  {a}
                </li>
              ))}
            </ol>
          </div>
        )}
        <button
          style={{ "--atraso": p.areas?.length ? "760ms" : "280ms" } as React.CSSProperties}
          type="button"
          onClick={comecar}
          disabled={iniciando}
          className="entrada group mt-10 inline-flex items-center gap-3 rounded-[var(--radius-epic)] bg-grafite px-7 py-4 text-[15px] font-semibold text-papel transition-[background-color,transform] hover:bg-tinta active:scale-[0.98] disabled:opacity-60"
        >
          {iniciando ? MICRO.carregando.generico : MICRO.mapa.comecar}
          <span aria-hidden className="h-px w-5 bg-latao transition-all group-hover:w-8" />
        </button>
        <p className="mt-4 text-sm text-mineral-escuro">{MICRO.mapa.entrada}</p>
        {erro && (
          <p role="alert" className="mt-4 text-sm text-[#9a3b2a]">
            {erro}
          </p>
        )}
        <p className="mt-12 max-w-xl border-t border-linha pt-5 text-sm leading-relaxed text-mineral-escuro">
          {p.aviso}
        </p>
      </div>
    );
  }

  if (estado === "resume") {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-sm text-latao-escuro">
          {respondidas} de {total} respondidas
        </p>
        <h1 className="mt-4 font-display text-[2.2rem] leading-tight text-grafite">{MICRO.mapa.retomadaTitulo}</h1>
        <p className="mt-4 text-lg text-grafite/80">{MICRO.mapa.depois}</p>
        {confirmarRecomeco ? (
          <div className="mt-10 rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-6" role="alertdialog" aria-live="assertive">
            <p className="text-grafite">{MICRO.mapa.recomecarConfirma}</p>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={() => setConfirmarRecomeco(false)}
                className="rounded-[var(--radius-epic)] bg-grafite px-6 py-3 text-[15px] font-semibold text-papel hover:bg-tinta"
              >
                {MICRO.mapa.manter}
              </button>
              <button type="button" onClick={recomecar} className="border-b border-latao pb-0.5 text-[15px]">
                {MICRO.mapa.recomecar}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => setEstado("question")}
              className="rounded-[var(--radius-epic)] bg-grafite px-7 py-4 text-[15px] font-semibold text-papel hover:bg-tinta"
            >
              {MICRO.mapa.retomar}
            </button>
            <button type="button" onClick={() => setConfirmarRecomeco(true)} className="border-b border-latao pb-0.5 text-[15px]">
              {MICRO.mapa.recomecar}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (estado === "calculating") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center py-16 text-center" role="status" aria-live="polite">
        <div className="w-48">
          <SinalFriccao escuro={false} tempo />
        </div>
        <p className="entrada-suave mt-8 font-display text-2xl text-grafite">{p.calculando ?? MICRO.mapa.processando}</p>
      </div>
    );
  }

  if (estado === "error") {
    return (
      <div className="mx-auto max-w-2xl" role="alert">
        <h1 className="font-display text-[2rem] leading-tight text-grafite">{MICRO.erro.titulo}</h1>
        <p className="mt-4 text-lg text-grafite/80">{erro}</p>
        <p className="mt-2 text-grafite/70">Suas {respondidas} respostas continuam salvas.</p>
        <div className="mt-8 flex flex-wrap gap-6">
          <button
            type="button"
            onClick={() => concluir(respostas)}
            className="rounded-[var(--radius-epic)] bg-grafite px-7 py-4 text-[15px] font-semibold text-papel hover:bg-tinta"
          >
            {MICRO.erro.tentar}
          </button>
          <button
            type="button"
            onClick={() => {
              setIndice(Math.max(0, total - 1));
              setEstado("question");
            }}
            className="border-b border-latao pb-0.5 text-[15px]"
          >
            Revisar respostas
          </button>
        </div>
      </div>
    );
  }

  // question
  const pergunta = p.perguntas[indice];
  const escolhida = respostas[pergunta.id];
  const pct = Math.round((indice / total) * 100);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-sm text-mineral-escuro" aria-live="polite">
          {MICRO.mapa.progresso(indice + 1, total)}
        </p>
        {indice > 0 && (
          <button
            type="button"
            onClick={() => setIndice((i) => Math.max(0, i - 1))}
            className="text-sm text-mineral-escuro hover:text-grafite"
          >
            {MICRO.mapa.voltar}
          </button>
        )}
      </div>
      <div
        className="mt-3 h-px w-full bg-linha"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={indice}
        aria-label="Progresso do Mapa"
      >
        <div className="h-px bg-latao transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div key={pergunta.id} className="pergunta-entra">
      <h1
        ref={tituloPergunta}
        tabIndex={-1}
        className="mt-10 font-display text-[1.65rem] font-normal leading-[1.3] text-grafite outline-none sm:text-[2.05rem]"
      >
        {pergunta.texto}
      </h1>

      <fieldset className="mt-9">
        <legend className="sr-only">Escolha uma resposta</legend>
        <div className="space-y-2.5">
          {pergunta.opcoes.map((o, i) => {
            const marcada = escolhida === o.valor;
            return (
              <button
                key={String(o.valor)}
                type="button"
                aria-pressed={marcada}
                disabled={avancando}
                onClick={() => responder(o.valor)}
                style={{ "--atraso": `${80 + i * 45}ms` } as React.CSSProperties}
                className={`opcao-entra flex w-full items-start gap-4 rounded-[var(--radius-epic)] border px-5 py-4 text-left transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.995] disabled:cursor-default ${
                  marcada
                    ? "border-grafite bg-grafite text-papel"
                    : "border-linha bg-papel-claro text-grafite hover:border-latao"
                }`}
              >
                <span className={`pt-0.5 font-mono text-xs ${marcada ? "text-latao" : "text-latao-escuro"}`}>
                  {typeof o.valor === "string" ? o.valor : String(i + 1)}
                </span>
                <span className="text-[16px] leading-snug">{o.rotulo}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
      </div>
    </div>
  );
}
