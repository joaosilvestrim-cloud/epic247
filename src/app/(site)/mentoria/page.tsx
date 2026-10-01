import type { Metadata } from "next";
import FormMentoria from "@/components/epic/FormMentoria";
import Visualizacao from "@/components/epic/Visualizacao";
import { C, Container, SectionTitle } from "@/components/epic/ui";
import { pendente } from "@/lib/epic/content/copy";
import { MENTORIA } from "@/lib/epic/content/produtos";
import { formatPrice } from "@/lib/epic/products";
import { capacidadeMentoria, produto } from "@/lib/epic/server/produtos";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mentoria EPIC",
  description: "Acompanhamento individual com a Ju: diagnóstico, 4 encontros em 6 semanas e Plano EPIC individual.",
  alternates: { canonical: "/mentoria" },
};

export default async function MentoriaPage() {
  const [vagas, p] = await Promise.all([capacidadeMentoria(), produto("mentoring")]);

  return (
    <>
      <Visualizacao nome="ViewMentoring" />

      <section className="grao border-b border-linha">
        <Container className="grid gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div>
            <p className="font-mono text-sm text-latao-escuro">Mentoria EPIC Individual</p>
            <h1 className="mt-4 font-display text-[2.6rem] font-normal leading-[1.08] text-grafite sm:text-[3.6rem]">
              <C v={pendente("Quando a mudança pede um olhar humano.")} />
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-grafite/80">
              <C
                v={pendente(
                  "Acompanhamento individual com a Ju, para quem quer acelerar uma mudança específica com estrutura, tarefas entre os encontros e alguém olhando junto."
                )}
              />
            </p>
          </div>
          <aside className="self-end rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-8">
            {p && <p className="font-display text-4xl text-grafite">{formatPrice(p.price_list)}</p>}
            <p className="mt-2 text-sm text-mineral-escuro">Valor do piloto.</p>
            <p className="mt-6 text-grafite">
              {vagas.disponivel
                ? `${vagas.capacidade - vagas.ocupadas} de ${vagas.capacidade} vagas abertas neste ciclo.`
                : "As vagas deste ciclo estão preenchidas."}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-mineral-escuro">
              A limitação é real: é a capacidade da Ju de acompanhar cada pessoa com qualidade. Novas vagas só
              abrem depois de avaliar essa capacidade.
            </p>
          </aside>
        </Container>
      </section>

      <section>
        <Container className="grid gap-12 py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <SectionTitle numero="01">Como funciona</SectionTitle>
          <ol className="border-t border-linha">
            {MENTORIA.formato.map((f, i) => (
              <li key={f} className="flex gap-4 border-b border-linha py-4">
                <span className="pt-1 font-mono text-xs text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-xl text-grafite">{f}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-linha bg-papel-escuro">
        <Container estreito className="py-20">
          <h2 className="font-display text-[2rem] leading-tight text-grafite">
            {vagas.disponivel ? "Quero conversar sobre a Mentoria" : "Entrar na lista de espera"}
          </h2>
          <p className="mt-3 text-grafite/75">
            {vagas.disponivel
              ? "Conte um pouco do seu momento. A equipe lê e responde com os próximos passos."
              : "Avisamos quando uma vaga abrir, sem prometer antes da hora."}
          </p>
          <div className="mt-8">
            <FormMentoria listaDeEspera={!vagas.disponivel} />
          </div>
        </Container>
      </section>
    </>
  );
}
