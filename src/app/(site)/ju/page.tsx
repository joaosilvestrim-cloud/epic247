import type { Metadata } from "next";
import Image from "next/image";
import IdeiasLista from "@/components/epic/IdeiasLista";
import { C, Container, PrimaryCTA, SectionTitle, TextCTA } from "@/components/epic/ui";
import { pendente, type Copy } from "@/lib/epic/content/copy";
import { HOME } from "@/lib/epic/content/home";
import { listarConteudos } from "@/lib/epic/server/conteudo";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ju Ferreira",
  description: "Engenheira, mestre em Administração e criadora do EPIC247.",
  alternates: { canonical: "/ju" },
};

// Biografia aprovada no site do Ciclo 1. Para o 2.0, a copy da página da Ju
// está PENDENTE no Blueprint (§30): fica como rascunho até nova aprovação.
const BIO: Copy[] = [
  pendente("Ju Ferreira é engenheira de formação."),
  pendente(
    "Não à toa. Durante anos, ela acreditou que a solução para qualquer problema era mais esforço, mais método, mais controle. Era o tipo de pessoa que sofria se tirava 9 em vez de 10, não por ego, mas porque achava que precisava."
  ),
  pendente(
    "O resultado foi previsível: alto desempenho por fora, exaustão crônica por dentro. Estava sempre fazendo, mas raramente chegando."
  ),
  pendente(
    "O ponto de virada não foi um livro, nem uma palestra. Foi perceber que o obstáculo não era falta de método. Era excesso de trava interna."
  ),
  pendente(
    "A partir daí, começou a construir o que viria a ser o EPIC247: não como professora ensinando teoria, mas como engenheira resolvendo um problema real. O dela."
  ),
  pendente(
    "Organizou o que aprendeu na prática. Testou. Ajustou. Eliminou o que não resistia ao dia ruim. Manteve o que funcionava mesmo quando a motivação tinha ido embora."
  ),
  pendente(
    "Hoje, além do EPIC247, Ju atua na intersecção de saúde, educação e tecnologia, é mestre em Administração e mãe de duas meninas gêmeas que, segundo ela, ensinam mais sobre resiliência do que qualquer módulo."
  ),
];

export default async function JuPage() {
  const [settings, ideias] = await Promise.all([getSettings(), listarConteudos({ limite: 4 })]);

  return (
    <>
      <section className="grao border-b border-linha">
        <Container className="grid items-end gap-12 pb-20 pt-14 sm:pt-20 md:grid-cols-[1fr_20rem] md:gap-16">
          <div>
            <p className="font-mono text-sm text-latao-escuro">Ju Ferreira</p>
            <h1 className="entrada mt-5 font-display text-[2.2rem] font-normal leading-[1.15] text-grafite sm:text-[3rem]">
              {HOME.ju.mensagem}
            </h1>
          </div>
          {settings.juPhotoUrl && (
            <div className="foto-revela relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-epic)]">
              <Image src={settings.juPhotoUrl} alt="Ju Ferreira" fill sizes="20rem" className="object-cover" priority />
            </div>
          )}
        </Container>
      </section>

      <section>
        <Container estreito className="py-20">
          <div className="prosa revelar-lista space-y-5 text-lg leading-relaxed text-grafite/85">
            {BIO.map((p, i) => (
              <p key={i} className={i === 0 ? "font-display text-2xl text-grafite" : ""}>
                <C v={p} />
              </p>
            ))}
          </div>
          <p className="mt-8 font-mono text-sm text-mineral-escuro">Engenheira · Mestre em Administração</p>
        </Container>
      </section>

      <section className="bg-papel-escuro">
        <Container className="py-20">
          <SectionTitle numero="01" className="mb-10">
            O que a Ju tem pensado
          </SectionTitle>
          <IdeiasLista itens={ideias} />
        </Container>
      </section>

      <section>
        <Container className="flex flex-col gap-6 py-20 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-lg font-display text-2xl leading-snug text-grafite">
            Quer trabalhar com a Ju de perto?
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <PrimaryCTA href="/mentoria">Conhecer a Mentoria</PrimaryCTA>
            <TextCTA href="/mapa">Começar pelo Mapa</TextCTA>
          </div>
        </Container>
      </section>
    </>
  );
}
