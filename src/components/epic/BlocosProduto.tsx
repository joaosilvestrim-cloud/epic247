import Link from "next/link";
import type { ReactNode } from "react";
import { Container, SectionTitle } from "@/components/epic/ui";

// Peças comuns às páginas de Plano, Kit e Protocolo (Copy Final §20, §25, §26).

export function Lista({ itens, className = "" }: { itens: string[]; className?: string }) {
  return (
    <ul className={`revelar-lista space-y-2.5 ${className}`}>
      {itens.map((i) => (
        <li key={i} className="flex gap-4 text-[17px] leading-relaxed text-grafite/85">
          <span aria-hidden className="mt-[0.8em] h-px w-4 shrink-0 bg-latao" />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

export function Paragrafos({ linhas, className = "" }: { linhas: string[]; className?: string }) {
  return (
    <div className={`space-y-3 text-lg leading-relaxed text-grafite/80 ${className}`}>
      {linhas.map((l) => (
        <p key={l}>{l}</p>
      ))}
    </div>
  );
}

/** Seção de texto em duas colunas: título à esquerda, conteúdo à direita. */
export function SecaoTexto({
  numero,
  titulo,
  children,
  fundo = "",
  id,
}: {
  numero?: string;
  titulo: ReactNode;
  children: ReactNode;
  fundo?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 ${fundo}`}>
      <Container className="grid gap-10 py-20 sm:py-24 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <SectionTitle numero={numero}>{titulo}</SectionTitle>
        <div className="revelar lg:pt-2">{children}</div>
      </Container>
    </section>
  );
}

export interface OpcaoEscada {
  nome: string;
  preco: string | null;
  texto: string;
  href: string;
  cta: string;
  atual?: boolean;
}

/** Plano x Kit x Protocolo: a profundidade de cada degrau, sem empurrar. */
export function Escada({ opcoes }: { opcoes: OpcaoEscada[] }) {
  return (
    <ol className="revelar-lista mt-12 grid gap-px overflow-hidden rounded-[var(--radius-epic)] border border-linha bg-linha md:grid-cols-3">
      {opcoes.map((o) => (
        <li key={o.nome} className={`flex flex-col p-7 ${o.atual ? "bg-papel-claro" : "bg-papel"}`}>
          <span className="font-display text-xl text-grafite">{o.nome}</span>
          {o.preco && <span className="mt-1 font-mono text-sm text-latao-escuro">{o.preco}</span>}
          <span className="mt-4 flex-1 text-[15px] leading-relaxed text-mineral-escuro">{o.texto}</span>
          {o.atual ? (
            <span className="mt-6 text-[13px] text-mineral-escuro">Você está aqui</span>
          ) : (
            <Link href={o.href} className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-grafite hover:text-tinta">
              {o.cta}
              <span aria-hidden className="h-px w-5 bg-latao" />
            </Link>
          )}
        </li>
      ))}
    </ol>
  );
}

/** FAQ visível (só usa marcação de FAQ porque as perguntas estão na página). */
export function Faq({ itens }: { itens: { p: string; r: string }[] }) {
  return (
    <div className="revelar-lista divide-y divide-linha border-y border-linha">
      {itens.map((f) => (
        <details key={f.p} className="group py-5">
          <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 font-display text-[1.2rem] text-grafite [&::-webkit-details-marker]:hidden">
            {f.p}
            <span aria-hidden className="font-mono text-sm text-latao-escuro transition-transform duration-300 group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-grafite/80">{f.r}</p>
        </details>
      ))}
    </div>
  );
}
