import type { Metadata } from "next";
import { Container, DraftRibbon } from "@/components/epic/ui";

export const metadata: Metadata = { title: "Termos de uso", alternates: { canonical: "/termos" } };

/* RASCUNHO PARA REVISÃO JURÍDICA. */
export default function TermosPage() {
  return (
    <>
      <DraftRibbon texto="Rascunho para revisão jurídica antes de publicar." />
      <article className="grao">
        <Container estreito className="py-16 sm:py-24">
          <h1 className="entrada font-display text-[2.6rem] leading-tight text-grafite">Termos de uso</h1>
          <div className="mt-10 space-y-8 text-[17px] leading-relaxed text-grafite/90">
            <section>
              <h2 className="mb-3 font-display text-2xl text-grafite">Caráter educativo</h2>
              <p>
                O conteúdo, os Mapas, os Planos, os Kits e o Protocolo do EPIC247 têm finalidade educativa e
                comportamental. Não constituem diagnóstico, tratamento ou acompanhamento médico, psicológico ou
                nutricional, e não substituem profissionais de saúde.
              </p>
            </section>
            <section>
              <h2 className="mb-3 font-display text-2xl text-grafite">Compras e garantia</h2>
              <p>
                As compras são processadas pela plataforma de pagamento parceira. Você pode solicitar o
                cancelamento e o reembolso em até 7 dias a partir da compra, pela própria plataforma de pagamento.
              </p>
            </section>
            <section>
              <h2 className="mb-3 font-display text-2xl text-grafite">Plano personalizado</h2>
              <p>
                O Plano EPIC 7 Dias é gerado automaticamente a partir das suas respostas no Mapa. Ele não é uma
                análise individual feita por uma pessoa.
              </p>
            </section>
            <section>
              <h2 className="mb-3 font-display text-2xl text-grafite">Propriedade intelectual</h2>
              <p>
                Textos, métodos, Mapas, materiais e marca são de propriedade do EPIC247. O acesso aos produtos é
                pessoal e não pode ser revendido nem redistribuído.
              </p>
            </section>
          </div>
        </Container>
      </article>
    </>
  );
}
