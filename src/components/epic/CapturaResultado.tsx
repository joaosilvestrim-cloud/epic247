"use client";

import { useId, useState } from "react";
import { enviar, espelhar } from "@/lib/epic/client/track";
import { MICRO } from "@/lib/epic/content/microcopy";

/**
 * Captura pós-resultado (RF-016, Copy Final §6 e §27.11). Nunca bloqueia o
 * resultado, que já está na tela. O aceite de marketing é separado e
 * opcional (RF-061): receber o próprio resultado não inscreve ninguém.
 * Título, texto e botão vêm da microcopy do Mapa da dimensão, quando existe.
 */
export default function CapturaResultado({
  token,
  mapType,
  titulo = "Quer guardar seu mapa e receber a leitura completa?",
  texto = "Deixe seu nome e e-mail. Seu resultado principal já é seu. O e-mail serve para enviar a leitura completa e recomendações.",
  botao = "Enviar meu mapa completo",
  jaConhecido = false,
}: {
  token: string;
  mapType: string;
  titulo?: string;
  texto?: string;
  botao?: string;
  jaConhecido?: boolean;
}) {
  const id = useId();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [estado, setEstado] = useState<"livre" | "enviando" | "ok">("livre");
  const [erro, setErro] = useState<string | null>(null);

  async function submeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    if (!email.trim()) return setErro(MICRO.form.emailVazio);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErro(MICRO.form.emailInvalido);
    setEstado("enviando");
    const isca = (new FormData(e.currentTarget).get("website") as string) ?? "";
    try {
      const d = await enviar<{ event_id?: string }>("/api/v2/mapas/capturar", {
        token,
        first_name: nome,
        email,
        marketing,
        website: isca,
      });
      if (d.event_id) espelhar("SubmitMapEmail", d.event_id, { map_type: mapType });
      setEstado("ok");
    } catch {
      setErro(MICRO.form.falha);
      setEstado("livre");
    }
  }

  if (estado === "ok") {
    return (
      <div role="status" className="rounded-[var(--radius-epic)] border border-latao/50 bg-papel-claro p-7">
        <p className="font-display text-2xl text-grafite">{MICRO.captura.sucesso}</p>
        <p className="mt-2 text-grafite/80">Se não aparecer em alguns minutos no e-mail {email}, confira a caixa de spam.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submeter} noValidate className="rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-7 sm:p-9">
      <h2 className="font-display text-[1.7rem] leading-tight text-grafite">{titulo}</h2>
      <p className="mt-3 whitespace-pre-line text-grafite/75">{texto}</p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-nome`} className="mb-1.5 block text-sm font-medium text-grafite">
            Como podemos chamar você?
          </label>
          <input
            id={`${id}-nome`}
            autoComplete="given-name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-[var(--radius-epic)] border border-linha bg-papel px-4 py-3 text-grafite focus:border-grafite"
          />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-medium text-grafite">
            Seu melhor e-mail
          </label>
          <input
            id={`${id}-email`}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro ? `${id}-erro` : undefined}
            className="w-full rounded-[var(--radius-epic)] border border-linha bg-papel px-4 py-3 text-grafite focus:border-grafite"
          />
        </div>
      </div>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {!jaConhecido && (
        <label className="mt-5 flex items-start gap-3 text-sm leading-snug text-grafite/80">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--color-grafite)]"
          />
          <span>{MICRO.consentimento.editorial}</span>
        </label>
      )}

      <p id={`${id}-erro`} role="alert" className="mt-4 text-sm text-[#9a3b2a] empty:hidden">
        {erro}
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="rounded-[var(--radius-epic)] bg-grafite px-7 py-3.5 text-[15px] font-semibold text-papel transition-colors hover:bg-tinta disabled:opacity-50"
        >
          {estado === "enviando" ? MICRO.form.enviando : botao}
        </button>
        <p className="text-xs text-mineral-escuro">
          Usamos seus dados conforme a{" "}
          <a href="/privacidade" className="underline underline-offset-2">
            política de privacidade
          </a>
          .
        </p>
      </div>
    </form>
  );
}
