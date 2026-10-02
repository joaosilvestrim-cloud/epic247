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
//
// Movimento (Brand §10): a escolha se preenche num gesto, a pergunta sai
// para o lado em que a pessoa está indo e a próxima entra do outro. Voltar
// inverte a direção. Tudo curto; com movimento reduzido, troca direto.

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
type Direcao = "frente" | "tras";

const chaveLocal = (id: string) => `epic_mapa_${id}`;
const espera = (ms: number) => new Promise<void>((ok) => window.setTimeout(ok, ms));

/** Tempos do gesto. Com movimento reduzido, zero. */
function tempos() {
  const reduzido = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reduzido ? { marca: 0, saida: 0, intro: 0, etapa: 350 } : { marca: 300, saida: 200, intro: 260, etapa: 750 };
}

export default function MapRunner(p: Props) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("intro");
  const [ocupado, setOcupado] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [direcao, setDirecao] = useState<Direcao>("frente");
  const [introSaindo, setIntroSaindo] = useState(false);
  const [mapaId, setMapaId] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Respostas>({});
  const [indice, setIndice] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [iniciando, setIniciando] = useState(false);
  const [confirmarRecomeco, setConfirmarRecomeco] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const quartisEnviados = useRef(new Set<number>());
  const tituloPergunta = useRef<HTMLHeadingElement>(null);
  const raiz = useRef<HTMLDivElement>(null);
  const total = p.perguntas.length;

  useEffect(() => {
    rastrear("ViewMapEntry", { map_type: p.mapType });
  }, [p.mapType]);

  // Foco no enunciado a cada pergunta (leitor de tela e teclado) e, no
  // celular, a pergunta volta para o topo se a pessoa tinha rolado.
  useEffect(() => {
    if (estado !== "question") return;
    tituloPergunta.current?.focus({ preventScroll: true });
    const topo = raiz.current?.getBoundingClientRect().top ?? 0;
    if (topo < 0) raiz.current?.scrollIntoView({ block: "start", behavior: "smooth" });
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
      // A abertura sai de cena antes da primeira pergunta entrar.
      setIntroSaindo(true);
      await espera(tempos().intro);
      setIntroSaindo(false);
      setRespostas(r);
      setIndice(Math.min(i, total - 1));
      setDirecao("frente");
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
    setDirecao("frente");
    if (mapaId) {
      salvarLocal(mapaId, {}, 0);
      void enviar("/api/v2/mapas/progresso", { map_result_id: mapaId, answers: {}, step: 0 }).catch(() => {});
    }
    setEstado("question");
  }

  /**
   * Conclusão: o servidor calcula enquanto a tela mostra as etapas. Um
   * mínimo de tempo para a assinatura se desenhar; depois, o resultado
   * entra em cortina (transição "revelar-resultado").
   */
  async function concluir(r: Respostas) {
    if (!mapaId) return;
    setEstado("calculating");
    setEtapa(0);
    setErro(null);
    const t = tempos();
    const passos = window.setInterval(() => setEtapa((e) => Math.min(e + 1, 1)), t.etapa);
    try {
      const [d] = await Promise.all([
        enviar<{ token: string; event_id: string }>("/api/v2/mapas/concluir", { map_result_id: mapaId, answers: r }),
        espera(t.etapa * 2),
      ]);
      window.clearInterval(passos);
      setEtapa(2);
      if (d.event_id) espelhar("CompleteMap", d.event_id, { map_type: p.mapType });
      try {
        sessionStorage.removeItem(chaveLocal(mapaId));
      } catch {
        /* ignora */
      }
      await espera(t.etapa * 0.6);
      router.push(`${p.caminhoResultado}/${d.token}`, { transitionTypes: ["revelar-resultado"] });
    } catch (e) {
      window.clearInterval(passos);
      setErro(e instanceof Error && e.message ? e.message : MICRO.erro.texto);
      setEstado("error");
    }
  }

  async function responder(valor: string | number) {
    if (!mapaId || ocupado) return;
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

    // Um toque curto no celular confirma a escolha (onde o aparelho deixa).
    try {
      navigator.vibrate?.(8);
    } catch {
      /* ignora */
    }

    // Gesto: a escolha se preenche, a pergunta sai, a próxima entra.
    const t = tempos();
    setOcupado(true);
    await espera(t.marca);
    if (proximo >= total) {
      setOcupado(false);
      void concluir(novas);
      return;
    }
    setDirecao("frente");
    setSaindo(true);
    await espera(t.saida);
    setIndice(proximo);
    setSaindo(false);
    setOcupado(false);
  }

  async function voltar() {
    if (indice === 0 || ocupado) return;
    setOcupado(true);
    setDirecao("tras");
    setSaindo(true);
    await espera(tempos().saida);
    setIndice((i) => Math.max(0, i - 1));
    setSaindo(false);
    setOcupado(false);
  }

  // Teclado: números (ou letras, nos Mapas de alternativas A, B, C…)
  // escolhem; seta para a esquerda ou Backspace voltam.
  useEffect(() => {
    if (estado !== "question") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const alvo = e.target as HTMLElement | null;
      if (alvo && /^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName)) return;
      const opcoes = p.perguntas[indice].opcoes;
      if (e.key === "ArrowLeft" || e.key === "Backspace") {
        e.preventDefault();
        void voltar();
        return;
      }
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= opcoes.length) {
        e.preventDefault();
        void responder(opcoes[n - 1].valor);
        return;
      }
      const letra = opcoes.find((o) => typeof o.valor === "string" && o.valor.toLowerCase() === e.key.toLowerCase());
      if (letra) {
        e.preventDefault();
        void responder(letra.valor);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const respondidas = useMemo(
    () => p.perguntas.filter((q) => respostas[q.id] !== undefined).length,
    [p.perguntas, respostas]
  );

  // ── Telas ──

  if (estado === "intro") {
    return (
      <div ref={raiz} className={`mx-auto max-w-2xl scroll-mt-24 ${introSaindo ? "cena-sai" : ""}`}>
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
          aria-busy={iniciando}
          className="entrada group mt-10 inline-flex items-center gap-3 rounded-[var(--radius-epic)] bg-grafite px-7 py-4 text-[15px] font-semibold text-papel transition-[background-color,transform] hover:bg-tinta active:scale-[0.98] disabled:opacity-80"
        >
          {iniciando ? MICRO.carregando.generico : MICRO.mapa.comecar}
          <span
            aria-hidden
            className={`h-px bg-latao transition-all duration-500 ${iniciando ? "w-10 animate-[carregar_1.1s_var(--ease-traco)_infinite]" : "w-5 group-hover:w-8"}`}
          />
        </button>
        <p className="mt-4 text-sm text-mineral-escuro">{MICRO.mapa.entrada}</p>
        <p role="alert" className="mt-4 text-sm text-[#9a3b2a] empty:hidden">
          {erro}
        </p>
        <p className="mt-12 max-w-xl border-t border-linha pt-5 text-sm leading-relaxed text-mineral-escuro">
          {p.aviso}
        </p>
      </div>
    );
  }

  if (estado === "resume") {
    return (
      <div ref={raiz} className="cena-entra mx-auto max-w-2xl">
        <p className="font-mono text-sm text-latao-escuro">
          {respondidas} de {total} respondidas
        </p>
        <Progresso total={total} feitas={respondidas} atual={-1} />
        <h1 className="mt-8 font-display text-[2.2rem] leading-tight text-grafite">{MICRO.mapa.retomadaTitulo}</h1>
        <p className="mt-4 text-lg text-grafite/80">{MICRO.mapa.depois}</p>
        {confirmarRecomeco ? (
          <div className="cena-entra mt-10 rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-6" role="alertdialog" aria-live="assertive">
            <p className="text-grafite">{MICRO.mapa.recomecarConfirma}</p>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={() => setConfirmarRecomeco(false)}
                className="rounded-[var(--radius-epic)] bg-grafite px-6 py-3 text-[15px] font-semibold text-papel hover:bg-tinta"
              >
                {MICRO.mapa.manter}
              </button>
              <button type="button" onClick={recomecar} className="link-traco text-[15px]">
                {MICRO.mapa.recomecar}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => setEstado("question")}
              className="group inline-flex items-center gap-3 rounded-[var(--radius-epic)] bg-grafite px-7 py-4 text-[15px] font-semibold text-papel hover:bg-tinta"
            >
              {MICRO.mapa.retomar}
              <span aria-hidden className="h-px w-5 bg-latao transition-all group-hover:w-8" />
            </button>
            <button type="button" onClick={() => setConfirmarRecomeco(true)} className="link-traco text-[15px]">
              {MICRO.mapa.recomecar}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (estado === "calculating") {
    const etapas = [p.calculando ?? MICRO.mapa.processando, MICRO.carregando.resultado, MICRO.mapa.pronto];
    return (
      <div ref={raiz} className="cena-entra mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center py-16 text-center" role="status" aria-live="polite">
        <div className="w-48">
          <SinalFriccao escuro={false} tempo />
        </div>
        <div className="relative mt-10 h-16 w-full">
          {etapas.map((t, i) => (
            <p
              key={t + i}
              aria-hidden={i !== etapa}
              // A frase que sai some rápido; a que entra espera ela sair (sem sobrepor).
              className={`absolute inset-x-0 font-display text-2xl text-grafite transition-[opacity,transform] [transition-timing-function:var(--ease-saida)] ${
                i === etapa
                  ? "opacity-100 duration-500 delay-200"
                  : i < etapa
                    ? "-translate-y-3 opacity-0 duration-200"
                    : "translate-y-3 opacity-0 duration-200"
              }`}
            >
              {t}
            </p>
          ))}
        </div>
        <ol aria-hidden className="mt-2 flex gap-2">
          {etapas.map((t, i) => (
            <li key={t + i} className={`h-[3px] w-8 rounded-full transition-colors duration-500 ${i <= etapa ? "bg-latao" : "bg-linha"}`} />
          ))}
        </ol>
      </div>
    );
  }

  if (estado === "error") {
    return (
      <div ref={raiz} className="cena-entra mx-auto max-w-2xl" role="alert">
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
              setDirecao("tras");
              setEstado("question");
            }}
            className="link-traco text-[15px]"
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
  const classeCena = saindo
    ? direcao === "frente" ? "pergunta-sai-frente" : "pergunta-sai-tras"
    : direcao === "frente" ? "pergunta-entra-frente" : "pergunta-entra-tras";
  const letras = pergunta.opcoes.some((o) => typeof o.valor === "string");

  return (
    <div ref={raiz} className="mx-auto max-w-2xl scroll-mt-24">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-sm text-mineral-escuro" aria-live="polite">
          Pergunta{" "}
          <span className="relative inline-block min-w-[1.3em] overflow-hidden text-center align-bottom text-grafite">
            <span key={indice} className="numero-troca inline-block">
              {indice + 1}
            </span>
          </span>{" "}
          de {total}
        </p>
        <button
          type="button"
          onClick={voltar}
          disabled={indice === 0}
          className="group flex items-center gap-2 text-sm text-mineral-escuro transition-opacity hover:text-grafite disabled:pointer-events-none disabled:opacity-0"
        >
          <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          {MICRO.mapa.voltar}
        </button>
      </div>
      <Progresso total={total} feitas={indice} atual={indice} />

      <div key={pergunta.id} className={classeCena}>
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
                  disabled={ocupado}
                  onClick={() => responder(o.valor)}
                  style={{ "--atraso": `${60 + i * 45}ms` } as React.CSSProperties}
                  className={`opcao opcao-entra group relative flex w-full items-start gap-4 overflow-hidden rounded-[var(--radius-epic)] border px-5 py-4 text-left transition-[border-color,color,transform,box-shadow] duration-200 active:scale-[0.99] disabled:cursor-default ${
                    marcada
                      ? "border-grafite text-papel"
                      : "border-linha bg-papel-claro text-grafite hover:border-latao hover:shadow-[0_10px_24px_-20px_rgba(23,22,20,0.45)] sm:hover:translate-x-1"
                  }`}
                >
                  {/* O preenchimento da escolha: um gesto da esquerda para a direita. */}
                  <span
                    aria-hidden
                    className={`absolute inset-0 origin-left bg-grafite transition-transform duration-300 [transition-timing-function:var(--ease-saida)] ${
                      marcada ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                  <span
                    className={`relative pt-0.5 font-mono text-xs transition-colors ${marcada ? "text-latao" : "text-latao-escuro"}`}
                  >
                    {typeof o.valor === "string" ? o.valor : String(i + 1)}
                  </span>
                  <span className="relative text-[16px] leading-snug">{o.rotulo}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
      <p className="mt-6 hidden text-xs text-mineral sm:block [@media(pointer:coarse)]:hidden">
        Teclado: {letras ? "letras" : `1 a ${pergunta.opcoes.length}`} escolhem, ← volta.
      </p>
    </div>
  );
}

/** Progresso em segmentos: uma linha por pergunta, a atual marcada em grafite. */
function Progresso({ total, feitas, atual }: { total: number; feitas: number; atual: number }) {
  return (
    <div
      className="mt-3 flex gap-[3px]"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={feitas}
      aria-label="Progresso do Mapa"
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-linha">
          <span
            className={`absolute inset-0 origin-left rounded-full transition-transform duration-500 [transition-timing-function:var(--ease-saida)] ${
              i === atual ? "scale-x-100 bg-grafite/45" : i < feitas ? "scale-x-100 bg-latao" : "scale-x-0 bg-latao"
            }`}
          />
        </span>
      ))}
    </div>
  );
}
