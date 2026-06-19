"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { QUIZ_QUESTIONS } from "@/lib/quiz-data";
import { calcularResultado, MAX_SCORE_POR_DRENO, type QuizResult } from "@/lib/quiz-engine";
import { DRENOS } from "@/lib/drenos";

type Etapa = "intro" | "perguntas" | "captura" | "relatorio";

export default function QuizPage() {
  const [etapa, setEtapa] = useState<Etapa>("intro");
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [resultado, setResultado] = useState<QuizResult | null>(null);

  const total = QUIZ_QUESTIONS.length;
  const questao = QUIZ_QUESTIONS[indice];
  const progresso = Math.round((indice / total) * 100);

  function responder(opcaoIndex: number) {
    const novas = { ...respostas, [questao.id]: opcaoIndex };
    setRespostas(novas);

    if (indice + 1 < total) {
      setIndice(indice + 1);
    } else {
      setResultado(calcularResultado(novas));
      setEtapa("captura");
    }
  }

  function voltar() {
    if (indice > 0) setIndice(indice - 1);
    else setEtapa("intro");
  }

  return (
    <main className="min-h-screen bg-epic-dark px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm text-white/50 underline-offset-4 hover:text-white hover:underline"
        >
          ← Voltar para a página inicial
        </Link>

        <div className="mt-8">
          {etapa === "intro" && <Intro onStart={() => setEtapa("perguntas")} />}

          {etapa === "perguntas" && (
            <Pergunta
              indice={indice}
              total={total}
              progresso={progresso}
              onResponder={responder}
              onVoltar={voltar}
              selecionada={respostas[questao.id]}
            />
          )}

          {etapa === "captura" && resultado && (
            <Captura
              resultado={resultado}
              onConcluir={() => setEtapa("relatorio")}
            />
          )}

          {etapa === "relatorio" && resultado && <Relatorio resultado={resultado} />}
        </div>
      </div>
    </main>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center">
      <h1 className="text-balance text-3xl font-extrabold leading-tight sm:text-4xl">
        Você sabe muito, planeja bem e executa pouco?
      </h1>
      <p className="mx-auto mt-6 max-w-lg text-lg text-white/70">
        Em 2 minutos, descubra qual dos <strong className="text-white">5 Drenos</strong>{" "}
        está sugando sua energia agora. E o que mudar primeiro.
      </p>
      <button
        onClick={onStart}
        className="mt-10 inline-flex items-center justify-center rounded-xl bg-epic-amber px-8 py-4 text-lg font-bold text-epic-dark shadow-lg transition hover:brightness-110"
      >
        Começar diagnóstico →
      </button>
      <p className="mt-4 text-sm text-white/40">15 perguntas · sem respostas certas ou erradas</p>
    </div>
  );
}

function Pergunta({
  indice,
  total,
  progresso,
  onResponder,
  onVoltar,
  selecionada,
}: {
  indice: number;
  total: number;
  progresso: number;
  onResponder: (i: number) => void;
  onVoltar: () => void;
  selecionada?: number;
}) {
  const questao = QUIZ_QUESTIONS[indice];
  const letras = ["A", "B", "C", "D"];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm text-white/50">
        <span>
          Pergunta {indice + 1} de {total}
        </span>
        <span>{progresso}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-epic-accent transition-all duration-300"
          style={{ width: `${progresso}%` }}
        />
      </div>

      <h2 className="mt-8 text-2xl font-bold leading-snug">{questao.pergunta}</h2>

      <div className="mt-6 space-y-3">
        {questao.opcoes.map((opcao, i) => {
          const ativa = selecionada === i;
          return (
            <button
              key={i}
              onClick={() => onResponder(i)}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                ativa
                  ? "border-epic-accent bg-epic-accent/10"
                  : "border-white/10 bg-white/5 hover:border-epic-accent/50 hover:bg-white/10"
              }`}
            >
              <span
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                  ativa ? "bg-epic-accent text-epic-dark" : "bg-white/10 text-white/70"
                }`}
              >
                {letras[i]}
              </span>
              <span className="text-white/90">{opcao.texto}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onVoltar}
        className="mt-6 text-sm text-white/50 underline-offset-4 hover:text-white hover:underline"
      >
        ← Voltar
      </button>
    </div>
  );
}

function Captura({
  resultado,
  onConcluir,
}: {
  resultado: QuizResult;
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
      setErro(err instanceof Error ? err.message : "Algo deu errado. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="text-center">
      <span className="text-sm font-semibold uppercase tracking-wide text-epic-accent">
        Diagnóstico concluído
      </span>
      <h1 className="mt-3 text-balance text-3xl font-extrabold leading-tight">
        {dreno.headline}
      </h1>
      <p className="mx-auto mt-5 max-w-lg text-white/70">
        Receba agora o relatório completo do seu Dreno Dominante e os{" "}
        <strong className="text-white">4 próximos passos práticos</strong> para destravar
        sua energia.
      </p>

      <form onSubmit={enviar} className="mx-auto mt-8 max-w-sm space-y-3 text-left">
        <input
          type="text"
          placeholder="Seu primeiro nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-epic-accent"
        />
        <input
          type="email"
          required
          placeholder="Seu melhor e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-epic-accent"
        />
        {erro && <p className="text-sm text-red-400">{erro}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-xl bg-epic-amber px-6 py-4 text-lg font-bold text-epic-dark shadow-lg transition hover:brightness-110 disabled:opacity-60"
        >
          {enviando ? "Enviando..." : "Receber meu relatório completo"}
        </button>
        <p className="text-center text-xs text-white/40">
          Seus dados estão seguros. Sem spam.
        </p>
      </form>
    </div>
  );
}

function Relatorio({ resultado }: { resultado: QuizResult }) {
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
    <div>
      <div className="text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-epic-accent">
          Seu relatório
        </span>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight">
          {dominante.headline}
        </h1>
      </div>

      <p className="mt-6 text-lg leading-relaxed text-white/80">
        {dominante.descricao}
      </p>

      {/* Mapa de Drenos */}
      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
          Seu mapa de Drenos
        </h2>
        <div className="mt-4 space-y-3">
          {barras.map(({ dreno, score, pct }) => (
            <div key={dreno.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">{dreno.nome}</span>
                <span className="text-white/50">{score}/{MAX_SCORE_POR_DRENO}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: dreno.cor }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-white/40">
          Dreno secundário: <strong className="text-white/70">{secundario.nome}</strong>
        </p>
      </div>

      {/* 4 próximos passos */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Seus 4 próximos passos práticos</h2>
        <ol className="mt-4 space-y-3">
          {dominante.passos.map((passo, i) => (
            <li key={i} className="flex items-start gap-4 rounded-xl bg-white/5 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-epic-accent text-sm font-bold text-epic-dark">
                {i + 1}
              </span>
              <span className="text-white/90">{passo}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA para a oferta */}
      <div className="mt-10 rounded-2xl border border-epic-amber/30 bg-epic-amber/10 p-6 text-center">
        <h2 className="text-xl font-bold">Pronto para resolver isso de verdade?</h2>
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
      </div>
    </div>
  );
}
