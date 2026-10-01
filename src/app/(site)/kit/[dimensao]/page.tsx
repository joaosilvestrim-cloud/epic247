import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BotaoCheckout from "@/components/epic/BotaoCheckout";
import JsonLd from "@/components/epic/JsonLd";
import { produtoLd } from "@/lib/epic/seo";
import Visualizacao from "@/components/epic/Visualizacao";
import { Container, DraftRibbon, TextCTA } from "@/components/epic/ui";
import { FUNCAO_KIT } from "@/lib/epic/content/produtos";
import { DIMENSION_IDS, DIMENSIONS, isDimensionId, mapPath } from "@/lib/epic/dimensions";
import { getDimensionalMap } from "@/lib/epic/maps";
import { formatPrice } from "@/lib/epic/products";
import { ofertasPermitidas, perfilAtual } from "@/lib/epic/server/perfil";
import { produto, vendavel } from "@/lib/epic/server/produtos";
import { dimensaoVisivel, mapaVisivel } from "@/lib/epic/site";

type Props = { params: Promise<{ dimensao: string }> };

export function generateStaticParams() {
  return DIMENSION_IDS.map((dimensao) => ({ dimensao }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao)) return {};
  return {
    title: `Kit EPIC ${DIMENSIONS[dimensao].name}`,
    description: `Manual + Workbook + ferramentas práticas para trabalhar ${DIMENSIONS[dimensao].name.toLowerCase()}.`,
    alternates: { canonical: `/kit/${dimensao}` },
  };
}

export default async function KitPage({ params }: Props) {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao) || !dimensaoVisivel(dimensao)) notFound();
  const d = DIMENSIONS[dimensao];
  const cfg = getDimensionalMap(dimensao);
  const [p, perfil] = await Promise.all([produto(`kit_${dimensao}`), perfilAtual()]);
  if (!p) notFound();
  const regras = ofertasPermitidas(perfil, dimensao);

  return (
    <>
      <Visualizacao nome="ViewKitOffer" dados={{ product_id: p.product_id, dimension: dimensao }} />
      <JsonLd dados={produtoLd(p, `/kit/${dimensao}`, `Manual + Workbook + ferramentas práticas para trabalhar ${d.name.toLowerCase()}.`)} />
      {!vendavel(p) && <DraftRibbon texto="Rascunho. Este produto ainda não está à venda (sem checkout ativo)." />}
      <section className="grao border-b border-linha">
        <Container className="grid gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div>
            <p className="font-mono text-sm text-latao-escuro">
              Dimensão {String(d.order).padStart(2, "0")} · {d.name}
            </p>
            <h1 className="mt-4 font-display text-[2.6rem] font-normal leading-[1.08] text-grafite sm:text-[3.6rem]">
              {p.product_name}
            </h1>
            <p className="mt-6 text-xl text-grafite/85">Manual + Workbook + ferramentas práticas.</p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-grafite/75">Para {FUNCAO_KIT[dimensao]}</p>
          </div>
          <div className="self-end rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-8">
            <p className="font-display text-5xl text-grafite">{formatPrice(p.price_list)}</p>
            <p className="mt-2 text-sm text-mineral-escuro">Pagamento único. Pix ou cartão.</p>
            <div className="mt-8">
              {!regras.kit ? (
                <p className="text-grafite/80">
                  {regras.jaTemProtocolo
                    ? `Você já tem o Protocolo: o conteúdo de ${d.name} já está com você.`
                    : "Você já tem este Kit. O acesso está no seu e-mail."}
                </p>
              ) : (
                <BotaoCheckout productId={p.product_id} rotulo={`Quero o Kit ${d.name}`} disponivel={vendavel(p)} />
              )}
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-12 py-20 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <h2 className="font-display text-[1.9rem] leading-tight text-grafite sm:text-[2.4rem]">
            As cinco áreas que o Kit aprofunda
          </h2>
          <ol className="border-t border-linha">
            {cfg.axes.map((a, i) => (
              <li key={a.key} className="flex gap-4 border-b border-linha py-3.5">
                <span className="pt-1 font-mono text-xs text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-xl text-grafite">{a.label}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {mapaVisivel(dimensao) && (
        <section className="bg-papel-escuro">
          <Container estreito className="py-16">
            <p className="font-display text-2xl leading-snug text-grafite">
              Quer saber por qual área de {d.name.toLowerCase()} começar?
            </p>
            <p className="mt-4">
              <TextCTA href={mapPath(dimensao)}>Fazer o {cfg.title}, gratuito</TextCTA>
            </p>
          </Container>
        </section>
      )}
    </>
  );
}
