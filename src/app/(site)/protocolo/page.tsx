import type { Metadata } from "next";
import Link from "next/link";
import BotaoCheckout from "@/components/epic/BotaoCheckout";
import JsonLd from "@/components/epic/JsonLd";
import { produtoLd } from "@/lib/epic/seo";
import Depoimentos from "@/components/epic/Depoimentos";
import Visualizacao from "@/components/epic/Visualizacao";
import { Container, PrimaryCTA, SectionTitle, TextCTA } from "@/components/epic/ui";
import { MANIFESTO } from "@/lib/epic/content/home";
import { PROTOCOLO } from "@/lib/epic/content/produtos";
import { formatPrice } from "@/lib/epic/products";
import { perfilAtual } from "@/lib/epic/server/perfil";
import { produto, vendavel } from "@/lib/epic/server/produtos";
import { dimensoesNavegaveis } from "@/lib/epic/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Protocolo EPIC247",
  description:
    "As 10 dimensões da Infraestrutura Humana em um sistema: Manuais, Workbooks, ferramentas, sequência recomendada e mapa de progresso.",
  alternates: { canonical: "/protocolo" },
};

export default async function ProtocoloPage() {
  const [p, perfil] = await Promise.all([produto("protocol"), perfilAtual()]);
  const dims = dimensoesNavegaveis();
  const jaTem = Boolean(perfil?.protocol_purchased);

  return (
    <>
      <Visualizacao nome="ViewProtocolOffer" dados={{ product_id: "protocol" }} />
      {p && <JsonLd dados={produtoLd(p, "/protocolo", String(metadata.description))} />}

      <section className="grao border-b border-linha">
        <Container className="pb-20 pt-14 sm:pt-20">
          <p className="font-mono text-sm text-latao-escuro">Protocolo EPIC247</p>
          <h1 className="mt-4 max-w-4xl font-display text-[2.8rem] font-normal leading-[1.05] text-grafite sm:text-[4.4rem]">
            10 dimensões. Um sistema.
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-grafite/80">
            Você pode começar por uma dimensão específica. Mas algumas mudanças exigem olhar o sistema inteiro.
          </p>
        </Container>
      </section>

      {/* Manifesto (aprovado) */}
      <section className="bg-tinta text-papel">
        <Container estreito className="py-20 sm:py-28">
          <div className="space-y-4 font-display text-[1.3rem] leading-relaxed text-papel/85 sm:text-[1.5rem]">
            {MANIFESTO.abertura.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
          <ol className="my-12 space-y-2 border-y border-papel/15 py-8">
            {dims.map((d) => (
              <li key={d.id} className="flex gap-4 font-display text-[1.25rem] sm:text-[1.4rem]">
                <span className="pt-1.5 font-mono text-xs text-latao">{String(d.order).padStart(2, "0")}</span>
                <Link href={d.href} className="hover:underline hover:decoration-latao hover:underline-offset-4">
                  {d.manifestoLine}
                </Link>
              </li>
            ))}
          </ol>
          <div className="space-y-4 font-display text-[1.3rem] leading-relaxed text-papel/85 sm:text-[1.5rem]">
            {MANIFESTO.fechamento.map((l) => (
              <p key={l}>{l}</p>
            ))}
            <p className="pt-4 text-papel">{MANIFESTO.promessa}</p>
          </div>
        </Container>
      </section>

      {/* O que é */}
      <section>
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionTitle numero="01">Um sistema, não um pacote de arquivos.</SectionTitle>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-grafite/80">
              O Protocolo é a jornada estruturada pelas dez dimensões. Você pode começar pela que mais pede
              atenção hoje e seguir a sequência recomendada a partir dela.
            </p>
          </div>
          <ol className="border-t border-linha">
            {PROTOCOLO.composicao.map((c, i) => (
              <li key={c} className="flex gap-4 border-b border-linha py-4">
                <span className="pt-1 font-mono text-xs text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-xl text-grafite">{c}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Oferta */}
      <section className="border-y border-linha bg-papel-claro">
        <Container className="grid gap-10 py-20 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <SectionTitle numero="02">Protocolo EPIC247</SectionTitle>
            <p className="mt-4 text-grafite/75">Acesso ao sistema completo das 10 dimensões.</p>
          </div>
          <div>
            {p && <p className="font-display text-5xl text-grafite">{formatPrice(p.price_list)}</p>}
            <p className="mt-2 text-sm text-mineral-escuro">Pix ou cartão.</p>
            <div className="mt-6">
              {jaTem ? (
                <p className="text-grafite/80">Você já tem o Protocolo. O acesso está no seu e-mail.</p>
              ) : (
                p && <BotaoCheckout productId="protocol" rotulo="Quero o Protocolo EPIC247" disponivel={vendavel(p)} />
              )}
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="flex flex-col gap-6 py-20 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl font-display text-2xl leading-snug text-grafite">
            Ainda não sabe por qual dimensão começar?
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <PrimaryCTA href="/mapa">Descubra seu ponto de fricção</PrimaryCTA>
            <TextCTA href="/mentoria">Conhecer a Mentoria</TextCTA>
          </div>
        </Container>
      </section>
      <Depoimentos lugar="protocolo" />
    </>
  );
}
