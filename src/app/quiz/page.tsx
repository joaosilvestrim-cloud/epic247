"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { QUIZ_QUESTIONS } from "@/lib/quiz-data";
import {
  calcularResultado,
  MAX_SCORE_POR_DRENO,
  type QuizResult,
} from "@/lib/quiz-engine";
import { DRENOS } from "@/lib/drenos";
import { Aurora, CountUp, EnergyRing } from "@/components/quiz-visuals";

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

  const total = QUIZ_QUESTIONS.length;
  const questao = QUIZ_QUESTIONS[indice];
  const energia = calcularEnergia(respostas);
  const heat = 1 - energia / 100;

  function responder(opcaoIndex: number) {
    if (travado) return;
    const peso = questao.opcoes[opcaoIndex].peso;
    const novas = { ...respostas, [questao.id]: opcaoIndex };

    setTravado(true);
    setRespostas(novas);
    if (peso > 0) setFlash({ peso, key: questao.id });

    window.setTimeout(() => {
      setFlash(null);
      if (indice + 1 < total) {
        setIndice(indice + 1);
      } else {
        setResultado(calcularResultado(novas));
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
        <Link
          href="/"
          className="text-sm text-white/40 underline-offset-4 transition hover:text-white hover:underline"
        >
          ← Início
        </Link>

        <div className="flex flex-1 flex-col justify-center py-6">
          <AnimatePresence mode="wait">
            {etapa === "intro" && (
              <Intro key="intro" onStart={() => setEtapa("perguntas")} />
            )}

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
        className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-epic-accent/15 animate-pulse-glow"
      >
        <span className="text-5xl">⚡</span>
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
      <EnergyRing value={energia} size={88} stroke={8} label="Energia" />
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
        className="mx-auto"
      >
        <EnergyRing value={energia} size={150} label="Bateria Vital" />
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

/* ────────────────────────── Relatório ────────────────────────── */
function Relatorio({
  resultado,
  energia,
}: {
  resultado: QuizResult;
  energia: number;
}) {
  const dominante = DRENOS[resultado.dominante];
  const secundario = DRENOS[resultado.secundario];

  const barras = useMemo(
    () =>
      resultado.ranking.map((id) => ({
        dreno: DRENOS[id],
        score: resultado.scores[id],
        pct: Math.round((resultado.scores[id] / MAX_SCORE_POR_DRENO) * 100),
      })),
    [resultado]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-epic-accent">
          Seu relatório
        </span>
        <h1
          className="mt-3 font-display text-3xl font-black leading-tight"
          style={{ color: dominante.cor }}
        >
          {dominante.headline}
        </h1>
      </div>

      <p className="mt-6 text-lg leading-relaxed text-white/80">
        {dominante.descricao}
      </p>

      {/* Mapa de Drenos com barras animadas */}
      <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
            Seu mapa de Drenos
          </h2>
          <span className="text-sm text-white/50">
            Bateria Vital: <CountUp to={energia} className="font-bold text-white" />%
          </span>
        </div>
        <div className="mt-5 space-y-4">
          {barras.map(({ dreno, score, pct }, i) => (
            <div key={dreno.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">{dreno.nome}</span>
                <span className="text-white/50">
                  {score}/{MAX_SCORE_POR_DRENO}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: dreno.cor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.15 * i, duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-white/40">
          Dreno secundário:{" "}
          <strong className="text-white/70">{secundario.nome}</strong>
        </p>
      </div>

      {/* 4 próximos passos */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Seus 4 próximos passos práticos</h2>
        <div className="mt-4 space-y-3">
          {dominante.passos.map((passo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i + 0.2 }}
              className="flex items-start gap-4 rounded-xl bg-white/[0.04] p-4"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-epic-accent text-sm font-bold text-epic-dark">
                {i + 1}
              </span>
              <span className="text-white/90">{passo}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 rounded-2xl border border-epic-amber/30 bg-epic-amber/10 p-6 text-center"
      >
        <h2 className="text-xl font-bold">Pronto para recarregar de verdade?</h2>
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
