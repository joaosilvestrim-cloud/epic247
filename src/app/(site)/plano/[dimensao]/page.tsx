import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BotaoCheckout from "@/components/epic/BotaoCheckout";
import JsonLd from "@/components/epic/JsonLd";
import { produtoLd } from "@/lib/epic/seo";
import Visualizacao from "@/components/epic/Visualizacao";
import { C, Container, DraftRibbon, TextCTA } from "@/components/epic/ui";
import { pendente } from "@/lib/epic/content/copy";
import { ESTRUTURA_PLANO } from "@/lib/epic/content/produtos";
import { DIMENSION_IDS, DIMENSIONS, isDimensionId, mapPath } from "@/lib/epic/dimensions";
import { formatPrice } from "@/lib/epic/products";
import { ofertasPermitidas, perfilAtual } from "@/lib/epic/server/perfil";
import { produto, vendavel } from "@/lib/epic/server/produtos";
import { dimensaoVisivel, mapaVisivel } from "@/lib/epic/site";

type Props = { params: Promise<{ dimensao: string }>; searchParams: Promise<{ r?: string }> };

export function generateStaticParams() {
  return DIMENSION_IDS.map((dimensao) => ({ dimensao }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao)) return {};
  return {
    title: `Plano EPIC ${DIMENSIONS[dimensao].name} 7 Dias`,
    description: "Um plano de 7 dias personalizado a partir das suas respostas no Mapa.",
    alternates: { canonical: `/plano/${dimensao}` },
  };
}

export default async function PlanoPage({ params, searchParams }: Props) {
  const { dimensao } = await params;
  const { r } = await searchParams;
  if (!isDimensionId(dimensao) || !dimensaoVisivel(dimensao)) notFound();
  const d = DIMENSIONS[dimensao];
  const [p, perfil] = await Promise.all([produto(`plan_${dimensao}`), perfilAtual()]);
  if (!p) notFound();
  const regras = ofertasPermitidas(perfil, dimensao);
  const jaTem = perfil?.plans_owned.includes(dimensao);

  return (
    <>
      <Visualizacao nome="ViewPlanOffer" dados={{ product_id: p.product_id, dimension: dimensao }} />
      <JsonLd dados={produtoLd(p, `/plano/${dimensao}`, `Plano de 7 dias personalizado a partir das suas respostas no Mapa de ${d.name}.`)} />
      {!vendavel(p) && <DraftRibbon texto="Rascunho. Este produto ainda não está à venda (sem checkout ativo)." />}
      <section className="grao border-b border-linha">
        <Container className="grid gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div>
            <p className="font-mono text-sm text-latao-escuro">7 dias · {d.name}</p>
            <h1 className="mt-4 font-display text-[2.6rem] font-normal leading-[1.08] text-grafite sm:text-[3.6rem]">
              {p.product_name}
            </h1>
            <p className="mt-6 text-xl text-grafite/85">Personalizado a partir das suas respostas.</p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-grafite/75">
              <C
                v={pendente(
                  `O seu Mapa mostrou onde está a fricção em ${d.name.toLowerCase()}. O Plano transforma esse resultado em sete dias de prática: um foco, um padrão para observar e movimentos pequenos o bastante para acontecer.`
                )}
              />
            </p>
          </div>
          <div className="self-end rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-8">
            <p className="font-display text-5xl text-grafite">{formatPrice(p.price_list)}</p>
            <p className="mt-2 text-sm text-mineral-escuro">Pagamento único. Pix ou cartão.</p>
            <div className="mt-8">
              {regras.jaTemProtocolo ? (
                <p className="text-grafite/80">Você já tem o Protocolo: o módulo de {d.name} já está com você.</p>
              ) : jaTem ? (
                <p className="text-grafite/80">Você já tem este Plano. O link de acesso está no seu e-mail.</p>
              ) : (
                <BotaoCheckout
                  productId={p.product_id}
                  token={r}
                  rotulo={`Quero meu Plano EPIC ${d.name}`}
                  disponivel={vendavel(p)}
                />
              )}
            </div>
            {!r && mapaVisivel(dimensao) && (
              <p className="mt-6 text-sm leading-relaxed text-mineral-escuro">
                Ainda não fez o Mapa de {d.name}? Pode comprar agora e fazer depois: o Plano fica pronto assim que
                você terminar. Ou{" "}
                <a href={mapPath(dimensao)} className="underline underline-offset-2">
                  faça o Mapa primeiro
                </a>
                .
              </p>
            )}
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-12 py-20 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <h2 className="font-display text-[1.9rem] leading-tight text-grafite sm:text-[2.4rem]">
              O que tem no seu Plano
            </h2>
            <p className="mt-4 text-grafite/75">
              Cada parte é preenchida a partir do seu padrão principal, do secundário e das suas respostas.
            </p>
          </div>
          <ol className="border-t border-linha">
            {ESTRUTURA_PLANO[dimensao].map((item, i) => (
              <li key={item} className="flex gap-4 border-b border-linha py-3.5">
                <span className="pt-1 font-mono text-xs text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[17px] text-grafite">{item}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-papel-escuro">
        <Container estreito className="py-16">
          <p className="text-grafite/80">
            O Plano é gerado automaticamente a partir das suas respostas. Ele não é uma análise individual nem
            substitui acompanhamento profissional. Se quiser um olhar humano, conheça a Mentoria.
          </p>
          <p className="mt-4">
            <TextCTA href="/mentoria">Conhecer a Mentoria</TextCTA>
          </p>
        </Container>
      </section>
    </>
  );
}
