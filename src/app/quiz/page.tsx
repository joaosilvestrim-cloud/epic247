"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { QUIZ_QUESTIONS } from "@/lib/quiz-data";
import {
  calcularResultado,
  MAX_SCORE_POR_DRENO,
  type QuizResult,
} from "@/lib/quiz-engine";
import { DRENOS, type DrenoId } from "@/lib/drenos";
import {
  Aurora,
  CountUp,
  DrenoRadar,
  VitalBattery,
} from "@/components/quiz-visuals";
import { playStart, playTick, playComplete } from "@/lib/sound";
import { trackLead } from "@/lib/analytics";

type Etapa = "intro" | "perguntas" | "captura" | "relatorio";

const PESO_MAX_TOTAL = QUIZ_QUESTIONS.length * 3; // 45

/** Energia (0..100) com base nas respostas já dadas — quanto mais severa, mais drena. */
function calcularEnergia(respostas: Record<number, number>): number {
  let drain = 0;
  for (const q of QUIZ_QUESTIONS) {
    const i = respostas[q.id];
    if (i !== undefined) drain += q.opcoes[i].peso;
  }
  return Math.round(100 - (drain / PESO_MAX_TOTAL) * 100);
}

export default function QuizPage() {
  const [etapa, setEtapa] = useState<Etapa>("intro");
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [resultado, setResultado] = useState<QuizResult | null>(null);
  const [flash, setFlash] = useState<{ peso: number; key: number } | null>(null);
  const [travado, setTravado] = useState(false);
  const [som, setSom] = useState(true);

  const total = QUIZ_QUESTIONS.length;
  const questao = QUIZ_QUESTIONS[indice];
  const energia = calcularEnergia(respostas);
  const heat = 1 - energia / 100;

  function iniciar() {
    if (som) playStart();
    setEtapa("perguntas");
  }

  function responder(opcaoIndex: number) {
    if (travado) return;
    const peso = questao.opcoes[opcaoIndex].peso;
    const novas = { ...respostas, [questao.id]: opcaoIndex };

    setTravado(true);
    setRespostas(novas);
    if (som) playTick();
    if (peso > 0) setFlash({ peso, key: questao.id });

    window.setTimeout(() => {
      setFlash(null);
      if (indice + 1 < total) {
        setIndice(indice + 1);
      } else {
        setResultado(calcularResultado(novas));
        if (som) playComplete();
        setEtapa("captura");
      }
      setTravado(false);
    }, 620);
  }

  function voltar() {
    if (travado) return;
    if (indice > 0) setIndice(indice - 1);
    else setEtapa("intro");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-epic-dark text-white">
      <Aurora heat={etapa === "perguntas" ? heat : etapa === "intro" ? 0 : heat} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-white/40 underline-offset-4 transition hover:text-white hover:underline"
          >
            ← Início
          </Link>
          <button
            onClick={() => setSom((s) => !s)}
            aria-label={som ? "Desativar som" : "Ativar som"}
            title={som ? "Som ligado" : "Som desligado"}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/60 transition hover:text-white"
          >
            {som ? "🔊" : "🔇"}
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center py-6">
          <AnimatePresence mode="wait">
            {etapa === "intro" && <Intro key="intro" onStart={iniciar} />}

            {etapa === "perguntas" && (
              <motion.div
                key="perguntas"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <HUD indice={indice} total={total} energia={energia} />
                <Pergunta
                  indice={indice}
                  total={total}
                  onResponder={responder}
                  onVoltar={voltar}
                  selecionada={respostas[questao.id]}
                  flash={flash}
                />
              </motion.div>
            )}

            {etapa === "captura" && resultado && (
              <Captura
                key="captura"
                resultado={resultado}
                energia={energia}
                onConcluir={() => setEtapa("relatorio")}
              />
            )}

            {etapa === "relatorio" && resultado && (
              <Relatorio key="relatorio" resultado={resultado} energia={energia} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

/* ───────────────────────────── Intro ───────────────────────────── */
function Intro({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.1 }}
        className="mb-8 flex justify-center"
      >
        <VitalBattery value={100} height={170} width={96} label="Energia total" />
      </motion.div>

      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-epic-accent">
        Diagnóstico EPIC247
      </span>
      <h1 className="mt-4 text-balance font-display text-3xl font-black leading-tight sm:text-5xl">
        Você sabe muito, planeja bem
        <br />e executa pouco?
      </h1>
      <p className="mx-auto mt-6 max-w-md text-lg text-white/70">
        Em 2 minutos, descubra qual dos{" "}
        <strong className="text-white">5 Drenos</strong> está sugando sua energia
        agora. E o que mudar primeiro.
      </p>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="mt-10 inline-flex items-center justify-center rounded-2xl bg-epic-amber px-10 py-4 text-lg font-bold text-epic-dark shadow-[0_0_40px_-8px] shadow-epic-amber/60"
      >
        Iniciar diagnóstico →
      </motion.button>
      <p className="mt-4 text-sm text-white/40">
        15 perguntas · sua Bateria Vital revelada no final
      </p>
    </motion.div>
  );
}

/* ───────────────────────────── HUD ───────────────────────────── */
function HUD({
  indice,
  total,
  energia,
}: {
  indice: number;
  total: number;
  energia: number;
}) {
  const progresso = Math.round((indice / total) * 100);
  return (
    <div className="mb-8 flex items-center gap-5">
      <VitalBattery value={energia} height={118} width={62} label="Energia" />
      <div className="flex-1">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-semibold text-white/80">
            Pergunta {indice + 1} / {total}
          </span>
          <span className="text-white/40">{progresso}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-epic-accent to-epic-amber"
            animate={{ width: `${progresso}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <p className="mt-1.5 text-xs text-white/40">
          Cada resposta revela quanto de energia esse dreno consome.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────── Pergunta ─────────────────────────── */
function Pergunta({
  indice,
  total,
  onResponder,
  onVoltar,
  selecionada,
  flash,
}: {
  indice: number;
  total: number;
  onResponder: (i: number) => void;
  onVoltar: () => void;
  selecionada?: number;
  flash: { peso: number; key: number } | null;
}) {
  const questao = QUIZ_QUESTIONS[indice];
  const letras = ["A", "B", "C", "D"];

  return (
    <div className="relative">
      <AnimatePresence>
        {flash && (
          <motion.div
            key={`flash-${flash.key}`}
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: -56 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute -top-2 right-2 z-20 rounded-full bg-red-500/20 px-3 py-1 text-sm font-bold text-red-300"
          >
            −{flash.peso} ⚡ energia
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={questao.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.28 }}
        >
          <h2 className="text-2xl font-bold leading-snug sm:text-3xl">
            {questao.pergunta}
          </h2>

          <div className="mt-7 space-y-3">
            {questao.opcoes.map((opcao, i) => {
              const ativa = selecionada === i;
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i + 0.05 }}
                  whileHover={{ scale: 1.015, x: 4 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => onResponder(i)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left backdrop-blur-sm transition-colors ${
                    ativa
                      ? "border-epic-accent bg-epic-accent/15 shadow-[0_0_30px_-10px] shadow-epic-accent"
                      : "border-white/10 bg-white/[0.04] hover:border-epic-accent/50 hover:bg-white/[0.08]"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                      ativa
                        ? "bg-epic-accent text-epic-dark"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {letras[i]}
                  </span>
                  <span className="text-white/90">{opcao.texto}</span>
                </motion.button>
              );
            })}
          </div>

          <button
            onClick={onVoltar}
            className="mt-6 text-sm text-white/40 underline-offset-4 transition hover:text-white hover:underline"
          >
            ← Voltar
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────── Captura ─────────────────────────── */
function Captura({
  resultado,
  energia,
  onConcluir,
}: {
  resultado: QuizResult;
  energia: number;
  onConcluir: () => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const dreno = DRENOS[resultado.dominante];

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErro("Digite um e-mail válido.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          dominante: resultado.dominante,
          secundario: resultado.secundario,
          scores: resultado.scores,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Falha ao enviar.");
      }
      trackLead({ content_name: resultado.dominante });
      onConcluir();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Algo deu errado.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 110, damping: 12 }}
        className="flex justify-center"
      >
        <VitalBattery value={energia} height={210} width={116} label="Bateria Vital" />
      </motion.div>

      <span className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.25em] text-epic-accent">
        Diagnóstico concluído
      </span>
      <h1 className="mt-3 text-balance font-display text-3xl font-black leading-tight">
        {dreno.headline}
      </h1>
      <p
        className="mx-auto mt-4 max-w-md text-white/70"
      >
        Sua Bateria Vital está em{" "}
        <strong style={{ color: dreno.cor }}>{energia}%</strong>. Receba o relatório
        completo e os <strong className="text-white">4 próximos passos práticos</strong>{" "}
        para reverter isso.
      </p>

      <form onSubmit={enviar} className="mx-auto mt-8 max-w-sm space-y-3 text-left">
        <input
          type="text"
          placeholder="Seu primeiro nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-epic-accent"
        />
        <input
          type="email"
          required
          placeholder="Seu melhor e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-epic-accent"
        />
        {erro && <p className="text-sm text-red-400">{erro}</p>}
        <motion.button
          whileHover={{ scale: enviando ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={enviando}
          className="w-full rounded-xl bg-epic-amber px-6 py-4 text-lg font-bold text-epic-dark shadow-lg transition hover:brightness-110 disabled:opacity-60"
        >
          {enviando ? "Liberando relatório..." : "Desbloquear meu relatório"}
        </motion.button>
        <p className="text-center text-xs text-white/40">
          Seus dados estão seguros. Sem spam.
        </p>
      </form>
    </motion.div>
  );
}

/* ────────────────────────── Relatório (interativo) ────────────────────────── */
function Relatorio({
  resultado,
  energia,
}: {
  resultado: QuizResult;
  energia: number;
}) {
  const dominante = DRENOS[resultado.dominante];
  const secundario = DRENOS[resultado.secundario];

  // Dreno selecionado no radar (começa pelo dominante).
  const [selecionado, setSelecionado] = useState<DrenoId>(resultado.dominante);
  // Passos marcados, por dreno: chave `${drenoId}-${i}`.
  const [feitos, setFeitos] = useState<Record<string, boolean>>({});

  const sel = DRENOS[selecionado];
  const selScore = resultado.scores[selecionado];
  const isDominante = selecionado === resultado.dominante;

  const concluidos = sel.passos.filter((_, i) => feitos[`${selecionado}-${i}`]).length;
  const progresso = Math.round((concluidos / sel.passos.length) * 100);

  function alternar(id: DrenoId) {
    if (id !== selecionado) {
      setSelecionado(id);
      if (typeof window !== "undefined") playTick();
    }
  }

  function togglePasso(i: number) {
    const k = `${selecionado}-${i}`;
    setFeitos((f) => ({ ...f, [k]: !f[k] }));
    playTick();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-epic-accent">
          Seu relatório interativo
        </span>
        <h1
          className="mt-3 font-display text-3xl font-black leading-tight"
          style={{ color: dominante.cor }}
        >
          {dominante.headline}
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Bateria Vital:{" "}
          <CountUp to={energia} className="font-bold text-white" />% · Dreno
          secundário: <strong className="text-white/70">{secundario.nome}</strong>
        </p>
      </div>

      {/* Radar interativo */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
        <h2 className="mb-1 text-center text-sm font-semibold uppercase tracking-wide text-white/50">
          Radar de Drenos
        </h2>
        <p className="mb-2 text-center text-xs text-white/40">
          Toque em cada ponto para explorar o dreno
        </p>
        <div className="flex justify-center">
          <DrenoRadar
            scores={resultado.scores}
            selected={selecionado}
            onSelect={alternar}
            size={320}
          />
        </div>
      </div>

      {/* Painel de detalhe do dreno selecionado */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selecionado}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="mt-6 rounded-2xl border p-6"
          style={{
            borderColor: `${sel.cor}55`,
            backgroundColor: `${sel.cor}12`,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: sel.cor }}
              />
              <h3 className="font-display text-xl font-bold" style={{ color: sel.cor }}>
                {sel.nome}
              </h3>
            </div>
            {isDominante && (
              <span className="rounded-full bg-epic-amber/20 px-3 py-1 text-xs font-bold text-epic-amber">
                Dominante
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: sel.cor }}
                initial={{ width: 0 }}
                animate={{ width: `${(selScore / MAX_SCORE_POR_DRENO) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span className="text-sm text-white/50">
              {selScore}/{MAX_SCORE_POR_DRENO}
            </span>
          </div>

          <p className="mt-4 leading-relaxed text-white/80">{sel.descricao}</p>

          {/* Checklist de passos */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white/60">
                Plano de ação · {sel.passos.length} passos
              </h4>
              <span className="text-sm font-bold" style={{ color: sel.cor }}>
                {progresso}%
              </span>
            </div>
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: sel.cor }}
                animate={{ width: `${progresso}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>

            <div className="space-y-2">
              {sel.passos.map((passo, i) => {
                const checado = !!feitos[`${selecionado}-${i}`];
                return (
                  <motion.button
                    key={i}
                    onClick={() => togglePasso(i)}
                    whileTap={{ scale: 0.98 }}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                      checado
                        ? "border-transparent bg-white/[0.08]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold transition"
                      style={{
                        borderColor: sel.cor,
                        backgroundColor: checado ? sel.cor : "transparent",
                        color: checado ? "#0f1c34" : "transparent",
                      }}
                    >
                      ✓
                    </span>
                    <span
                      className={`text-sm ${
                        checado ? "text-white/50 line-through" : "text-white/90"
                      }`}
                    >
                      {passo}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {progresso === 100 && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 rounded-xl bg-epic-amber/15 p-3 text-center text-sm font-semibold text-epic-amber"
                >
                  🎉 Plano completo! Esse é o caminho para recarregar a sua energia.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 rounded-2xl border border-epic-amber/30 bg-epic-amber/10 p-6 text-center"
      >
        <h2 className="font-display text-xl font-bold">
          Pronto para recarregar de verdade?
        </h2>
        <p className="mt-2 text-white/70">
          O Módulo Energia te dá o sistema completo para reconstruir sua energia a
          partir do seu Dreno Dominante.
        </p>
        <Link
          href="/#oferta"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-epic-amber px-8 py-4 text-lg font-bold text-epic-dark shadow-lg transition hover:brightness-110"
        >
          Conhecer o Módulo Energia · R$97
        </Link>
      </motion.div>
    </motion.div>
  );
}
