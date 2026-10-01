"use client";

import { useId, useState } from "react";
import { enviar } from "@/lib/epic/client/track";

export default function NewsletterForm({ claro = false }: { claro?: boolean }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [aceite, setAceite] = useState(false);
  const [estado, setEstado] = useState<"livre" | "enviando" | "ok">("livre");
  const [erro, setErro] = useState<string | null>(null);

  async function enviarForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEstado("enviando");
    const isca = (new FormData(e.currentTarget).get("website") as string) ?? "";
    try {
      await enviar("/api/v2/newsletter", { email, consent: aceite, website: isca });
      setEstado("ok");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível agora.");
      setEstado("livre");
    }
  }

  if (estado === "ok") {
    return (
      <p className={`text-sm ${claro ? "text-grafite" : "text-papel/85"}`} role="status">
        Pronto. A próxima carta chega no seu e-mail.
      </p>
    );
  }

  return (
    <form onSubmit={enviarForm} className="space-y-3" noValidate>
      <p className={`text-sm leading-relaxed ${claro ? "text-grafite/75" : "text-papel/70"}`}>
        Ideias para viver melhor, sem avalanche de e-mails.
      </p>
      <label htmlFor={`${id}-email`} className="sr-only">
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
          className={`min-w-0 flex-1 rounded-[var(--radius-epic)] border px-3 py-2.5 text-base focus:border-latao sm:text-sm ${claro ? "border-linha bg-papel-claro text-grafite placeholder:text-mineral" : "border-papel/20 bg-transparent text-papel placeholder:text-papel/40"}`}
        />
        <button
          type="submit"
          disabled={estado === "enviando"}
          className={`rounded-[var(--radius-epic)] px-4 text-sm font-semibold transition-colors disabled:opacity-60 ${claro ? "bg-grafite text-papel hover:bg-tinta" : "bg-papel text-tinta hover:bg-papel-claro"}`}
        >
          {estado === "enviando" ? "..." : "Assinar"}
        </button>
      </div>
      {/* isca para robôs: invisível para pessoas */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className={`flex items-start gap-2 text-xs leading-snug ${claro ? "text-grafite/70" : "text-papel/65"}`}>
        <input
          type="checkbox"
          checked={aceite}
          onChange={(e) => setAceite(e.target.checked)}
          className="mt-0.5 accent-[var(--color-latao)]"
        />
        <span>
          Quero receber a newsletter do EPIC247. Posso sair quando quiser. Veja a{" "}
          <a href="/privacidade" className="underline underline-offset-2">
            política de privacidade
          </a>
          .
        </span>
      </label>
      {erro && (
        <p className="text-xs text-[#e8b4a0]" role="alert">
          {erro}
        </p>
      )}
    </form>
  );
}
