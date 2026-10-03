import type { Metadata } from "next";
import { Container, PrimaryCTA } from "@/components/epic/ui";

export const metadata: Metadata = { title: "Pagamento confirmado", robots: { index: false, follow: false } };

/**
 * Para onde a Kiwify devolve depois do pagamento (CR-01, pós-compra). A volta
 * do navegador não libera nada: o acesso só existe depois do webhook aprovado.
 */
export default function CompraConfirmadaPage() {
  return (
    <section className="grao min-h-[70vh]">
      <Container estreito className="py-20 sm:py-28">
        <p className="font-mono text-sm text-latao-escuro">EPIC247</p>
        <h1 className="mt-4 font-display text-[2.4rem] font-normal leading-[1.1] text-grafite sm:text-[3.2rem]">
          Pagamento confirmado. Estamos preparando seu acesso.
        </h1>
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-grafite/85">
          Em instantes você recebe um e-mail com o link para o Meu EPIC, a sua área no site. É lá que ficam o seu
          Plano, os seus Kits e o Protocolo.
        </p>
        <p className="mt-3 max-w-xl text-[15px] text-mineral-escuro">
          Pagou com boleto ou Pix e ainda não compensou? O acesso é liberado assim que o pagamento for confirmado.
        </p>
        <div className="mt-8">
          <PrimaryCTA href="/meu-epic">Acessar meu EPIC</PrimaryCTA>
        </div>
      </Container>
    </section>
  );
}
