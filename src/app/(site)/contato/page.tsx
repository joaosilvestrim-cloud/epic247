import type { Metadata } from "next";
import FormContato from "@/components/epic/FormContato";
import { Container, TextCTA } from "@/components/epic/ui";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com o EPIC247.",
  alternates: { canonical: "/contato" },
};

export default function ContatoPage() {
  return (
    <section className="grao min-h-[70vh]">
      <Container className="grid gap-14 py-16 sm:py-24 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
        <div>
          <h1 className="font-display text-[2.8rem] font-normal leading-[1.05] text-grafite sm:text-[3.8rem]">Fale com a gente.</h1>
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-grafite/80">
            Dúvida sobre um produto, parceria ou imprensa. Respondemos por e-mail.
          </p>
          <div className="mt-10 space-y-3 text-[15px]">
            <p>
              <TextCTA href="/mentoria">Interesse na Mentoria</TextCTA>
            </p>
            <p>
              <TextCTA href="/mapa">Começar pelo Mapa de Fricção</TextCTA>
            </p>
          </div>
        </div>
        <FormContato />
      </Container>
    </section>
  );
}
