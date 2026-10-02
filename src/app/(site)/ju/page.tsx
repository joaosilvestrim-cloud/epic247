import type { Metadata } from "next";
import Image from "next/image";
import IdeiasLista from "@/components/epic/IdeiasLista";
import JsonLd from "@/components/epic/JsonLd";
import MarcaMao from "@/components/epic/MarcaMao";
import { Container, PrimaryCTA, TextCTA } from "@/components/epic/ui";
import { JU, type SecaoJu } from "@/lib/epic/content/ju";
import { metadados, SITE } from "@/lib/epic/seo";
import { listarConteudos } from "@/lib/epic/server/conteudo";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

// SEO da Copy Final §22; Person só com dado biográfico público (Blueprint v1.2 §57.10).
export const metadata: Metadata = metadados({
  titulo: JU.seo.titulo,
  tituloAbsoluto: true,
  descricao: JU.seo.descricao,
  caminho: "/ju",
  ogTipo: "profile",
});

const PESSOA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ju Ferreira",
  url: `${SITE}/ju`,
  description: JU.seo.descricao,
  worksFor: { "@type": "Organization", name: "EPIC247", url: SITE },
};

/** Linha curta vira ritmo (uma palavra, uma frase); a longa é parágrafo. */
function Linha({ texto }: { texto: string }) {
  const curta = texto.length <= 42;
  return <p className={curta ? "font-display text-[1.25rem] leading-snug text-grafite" : ""}>{texto}</p>;
}

function Secao({ s, numero }: { s: SecaoJu; numero: number }) {
  const id = s.titulo === "O EPIC247" ? "epic247" : undefined;
  return (
    <section id={id} className="scroll-mt-24 border-t border-linha">
      <Container className="grid gap-8 py-16 sm:py-20 lg:grid-cols-[16rem_1fr] lg:gap-16">
        <div className="revelar">
          <p className="font-mono text-sm text-latao-escuro">{String(numero).padStart(2, "0")}</p>
          <h2 className="mt-3 font-display text-[1.6rem] leading-tight text-grafite">{s.titulo}</h2>
        </div>
        <div className="max-w-2xl">
          <div className="revelar space-y-3 text-[17px] leading-relaxed text-grafite/85">
            {s.linhas.map((l) => (
              <Linha key={l} texto={l} />
            ))}
          </div>
          {s.destaque && (
            <p className="revelar mt-10 border-l-2 border-latao pl-6 font-display text-[1.6rem] leading-snug text-grafite sm:text-[1.9rem]">
              {s.destaque}
            </p>
          )}
          {s.depois && (
            <div className="revelar mt-8 space-y-3 text-[17px] leading-relaxed text-grafite/85">
              {s.depois.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
          )}
          {s.cta && (
            <p className="mt-10">
              <TextCTA href={s.cta.href}>{s.cta.label}</TextCTA>
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}

export default async function JuPage() {
  const [settings, ideias] = await Promise.all([getSettings(), listarConteudos({ limite: 4 })]);
  const h = JU.hero;

  return (
    <>
      <JsonLd dados={PESSOA} />

      {/* 1 · Hero */}
      <section className="grao border-b border-linha">
        <Container className="grid items-end gap-12 pb-20 pt-14 sm:pt-20 md:grid-cols-[1fr_20rem] md:gap-16">
          <div>
            <p className="entrada-suave font-mono text-sm text-latao-escuro">{h.nome}</p>
            <h1 className="entrada mt-5 font-display text-[2rem] font-normal leading-[1.18] text-grafite sm:text-[2.7rem]">
              {h.titulo}
            </h1>
            <div className="entrada mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-grafite/80" style={{ "--atraso": "180ms" } as React.CSSProperties}>
              {h.texto.map((t) => (
                <p key={t}>{t}</p>
              ))}
              <p className="font-display text-[1.35rem] italic leading-snug text-grafite">
                <MarcaMao atraso={1100}>{h.pergunta}</MarcaMao>
              </p>
              <p>{h.depois}</p>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <PrimaryCTA href={h.ctaPrimario.href}>{h.ctaPrimario.label}</PrimaryCTA>
              <TextCTA href={h.ctaSecundario.href}>{h.ctaSecundario.label}</TextCTA>
            </div>
          </div>
          {settings.juPhotoUrl && (
            <div className="foto-revela relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-epic)]">
              <Image src={settings.juPhotoUrl} alt="Ju Ferreira" fill sizes="20rem" className="object-cover" priority />
            </div>
          )}
        </Container>
      </section>

      {/* 2 a 9 · A investigação, em primeira pessoa */}
      {JU.secoes.map((s, i) => (
        <Secao key={s.titulo} s={s} numero={i + 1} />
      ))}

      {/* 10 · Ideias */}
      <section className="bg-papel-escuro">
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div className="revelar">
            <h2 className="font-display text-[2rem] leading-tight text-grafite sm:text-[2.4rem]">{JU.ideias.titulo}</h2>
            <div className="mt-6 space-y-2 text-[17px] leading-relaxed text-grafite/80">
              {JU.ideias.linhas.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
            <p className="mt-8">
              <TextCTA href="/ideias">{JU.ideias.cta}</TextCTA>
            </p>
          </div>
          {ideias.length > 0 && <IdeiasLista itens={ideias} />}
        </Container>
      </section>

      {/* 11 · Trabalhar comigo */}
      <section className="grao bg-tinta text-papel">
        <Container className="grid gap-10 py-20 sm:py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <h2 className="revelar font-display text-[2rem] leading-tight sm:text-[2.4rem]">{JU.trabalhar.titulo}</h2>
          <div>
            <div className="space-y-2 text-[17px] leading-relaxed text-papel/80">
              {JU.trabalhar.linhas.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
            <div className="mt-10">
              <PrimaryCTA href="/mentoria" escuro>
                {JU.trabalhar.cta}
              </PrimaryCTA>
            </div>
          </div>
        </Container>
      </section>

      {/* 12 · Fechamento */}
      <section className="grao">
        <Container estreito className="py-24 text-center">
          <div className="revelar space-y-2 text-lg leading-relaxed text-grafite/80">
            {JU.fechamento.linhas.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
          <p className="revelar mx-auto mt-10 max-w-2xl font-display text-[1.8rem] leading-snug text-grafite sm:text-[2.3rem]">
            {JU.fechamento.pergunta}
          </p>
          <div className="mt-10 flex justify-center">
            <PrimaryCTA href="/mapa">{JU.fechamento.cta}</PrimaryCTA>
          </div>
        </Container>
      </section>
    </>
  );
}
