"use client";

import { useId, useState } from "react";
import { enviar } from "@/lib/epic/client/track";
import { MICRO } from "@/lib/epic/content/microcopy";

/**
 * Inscrição na newsletter (Copy Final §5 e §27.24). Assinar é o próprio
 * aceite editorial, dito por extenso junto do botão.
 */
export default function NewsletterForm({
  claro = false,
  texto,
  consentimento,
}: {
  claro?: boolean;
  texto?: string | null;
  consentimento?: string | null;
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"livre" | "enviando" | "ok">("livre");
  const [erro, setErro] = useState<string | null>(null);

  async function enviarForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    if (!email.trim()) return setErro(MICRO.form.emailVazio);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErro(MICRO.form.emailInvalido);
    setEstado("enviando");
    const isca = (new FormData(e.currentTarget).get("website") as string) ?? "";
    try {
      await enviar("/api/v2/newsletter", { email, consent: true, website: isca });
      setEstado("ok");
    } catch {
      setErro(MICRO.newsletter.erro);
      setEstado("livre");
    }
  }

  if (estado === "ok") {
    return (
      <div role="status" className={`text-sm ${claro ? "text-grafite" : "text-papel/85"}`}>
        <p className="font-semibold">{MICRO.newsletter.sucesso}</p>
        <p className="mt-1">{MICRO.newsletter.sucessoTexto}</p>
      </div>
    );
  }

  const erroId = `${id}-erro`;
  return (
    <form onSubmit={enviarForm} className="space-y-3" noValidate>
      {texto && <p className={`text-sm leading-relaxed ${claro ? "text-grafite/75" : "text-papel/70"}`}>{texto}</p>}
      <label htmlFor={`${id}-email`} className={`block text-xs ${claro ? "text-grafite/70" : "text-papel/60"}`}>
        Seu e-mail
      </label>
      <div className="flex gap-2">
        <input
          id={`${id}-email`}
          type="email"
          required
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? erroId : undefined}
          className={`min-w-0 flex-1 rounded-[var(--radius-epic)] border px-3 py-2.5 text-base focus:border-latao sm:text-sm ${claro ? "border-linha bg-papel-claro text-grafite placeholder:text-mineral" : "border-papel/20 bg-transparent text-papel placeholder:text-papel/40"}`}
        />
        <button
          type="submit"
          disabled={estado === "enviando"}
          className={`shrink-0 rounded-[var(--radius-epic)] px-4 text-sm font-semibold transition-colors disabled:opacity-60 ${claro ? "bg-grafite text-papel hover:bg-tinta" : "bg-papel text-tinta hover:bg-papel-claro"}`}
        >
          {estado === "enviando" ? MICRO.form.enviando : MICRO.newsletter.cta}
        </button>
      </div>
      {/* isca para robôs: invisível para pessoas */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <p className={`text-xs leading-snug ${claro ? "text-grafite/65" : "text-papel/55"}`}>
        {consentimento ??
          "Ao assinar, você concorda em receber comunicações editoriais do EPIC247. Você pode sair a qualquer momento."}{" "}
        <a href="/privacidade" className="underline underline-offset-2">
          Política de privacidade
        </a>
        .
      </p>
      <p id={erroId} role="alert" className={`text-xs ${claro ? "text-[#9a3b1f]" : "text-[#e8b4a0]"}`}>
        {erro}
      </p>
    </form>
  );
}
