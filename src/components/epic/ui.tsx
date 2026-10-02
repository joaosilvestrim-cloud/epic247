import Link from "next/link";
import type { ReactNode } from "react";
import { copyText, IS_PRODUCTION, type Copy } from "@/lib/epic/content/copy";

/** Renderiza copy aprovada; rascunho só em staging, marcado (RF-087). */
export function C({ v }: { v: Copy | null | undefined }) {
  if (v == null) return null;
  if (typeof v === "string") return <>{v}</>;
  if ("proposta" in v) return <>{copyText(v)}</>;
  if (IS_PRODUCTION) return null;
  return (
    <span className="copy-pendente" title="Copy pendente de aprovação">
      {v.pendente}
    </span>
  );
}

export function Container({
  children,
  className = "",
  estreito = false,
}: {
  children: ReactNode;
  className?: string;
  estreito?: boolean;
}) {
  return (
    <div className={`mx-auto w-full px-5 sm:px-8 ${estreito ? "max-w-3xl" : "max-w-[76rem]"} ${className}`}>
      {children}
    </div>
  );
}

/**
 * CTA principal: bloco sólido de grafite, sem brilho nem pulso.
 * O destaque vem do contraste e de um filete de latão no hover.
 */
export function PrimaryCTA({
  href,
  children,
  escuro = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  escuro?: boolean;
  className?: string;
}) {
  const cores = escuro
    ? "bg-papel text-tinta hover:bg-papel-claro"
    : "bg-grafite text-papel hover:bg-tinta";
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 rounded-[var(--radius-epic)] px-6 py-3.5 text-[15px] font-semibold transition-[background-color,transform] duration-200 active:scale-[0.98] ${cores} ${className}`}
    >
      <span>{children}</span>
      <span
        aria-hidden
        className="h-px w-5 bg-latao transition-all duration-300 group-hover:w-8"
      />
    </Link>
  );
}

/** CTA secundário: texto com sublinhado de latão. */
export function TextCTA({
  href,
  children,
  escuro = false,
}: {
  href: string;
  children: ReactNode;
  escuro?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-block border-b border-latao pb-0.5 text-[15px] font-medium transition-[color,border-color] duration-200 hover:border-grafite ${
        escuro ? "text-papel hover:text-papel-claro" : "text-grafite hover:text-tinta"
      }`}
    >
      {children}
    </Link>
  );
}

/** Título de seção editorial. Sem eyebrow em caixa alta: número em mono. */
export function SectionTitle({
  numero,
  children,
  escuro = false,
  className = "",
}: {
  numero?: string;
  children: ReactNode;
  escuro?: boolean;
  className?: string;
}) {
  return (
    <div className={`revelar ${className}`}>
      {numero && (
        <div className="mb-4 flex items-center gap-3">
          <span className={`font-mono text-sm ${escuro ? "text-latao" : "text-latao-escuro"}`}>{numero}</span>
          <span className="filete w-10" />
        </div>
      )}
      <h2
        className={`font-display text-[1.9rem] font-normal leading-[1.15] sm:text-[2.6rem] ${
          escuro ? "text-papel" : "text-grafite"
        }`}
      >
        {children}
      </h2>
    </div>
  );
}

/** Faixa que só aparece em staging para página ainda não publicada. */
export function DraftRibbon({ texto = "Rascunho. Esta página ainda não está publicada." }: { texto?: string }) {
  if (IS_PRODUCTION) return null;
  return (
    <div className="border-b border-latao/40 bg-papel-escuro">
      <Container>
        <p className="py-2 font-mono text-xs text-mineral-escuro">{texto}</p>
      </Container>
    </div>
  );
}
