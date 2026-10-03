import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/epic/JsonLd";
import { Container, PrimaryCTA, SectionTitle } from "@/components/epic/ui";
import { copyText } from "@/lib/epic/content/copy";
import { CARD_DIMENSAO } from "@/lib/epic/content/home";
import { MEGA_MENU, PERGUNTA_MENU } from "@/lib/epic/content/navegacao";
import { DIMENSIONS, mapPath } from "@/lib/epic/dimensions";
import { formatPrice } from "@/lib/epic/products";
import { metadados, webPageLd } from "@/lib/epic/seo";
import { listarProdutos, vendavel } from "@/lib/epic/server/produtos";
import { dimensoesNavegaveis, mapaVisivel } from "@/lib/epic/site";

export const revalidate = 60;

// Índice das 10 dimensões: destino de "Explorar as 10 dimensões" e dos
// CTAs de Plano e Kit da Home (Copy Final §4, bloco 7). Texto do mega-menu.
const DESCRICAO = "As 10 dimensões da Infraestrutura Humana. Comece pela que mais conversa com o que está acontecendo agora.";

export const metadata: Metadata = metadados({
  titulo: "As 10 dimensões",
  descricao: DESCRICAO,
  caminho: "/dimensoes",
});

export default async function DimensoesPage() {
  const [produtos] = await Promise.all([listarProdutos()]);
  const dims = dimensoesNavegaveis();
  const preco = (tipo: "plan" | "kit") => {
    const p = produtos.find((x) => x.product_type === tipo);
    return p ? formatPrice(p.price_list) : null;
  };
  const aVenda = (id: string) => vendavel(produtos.find((p) => p.product_id === id));

  return (
    <>
      <JsonLd dados={webPageLd({ nome: "As 10 dimensões", descricao: DESCRICAO, caminho: "/dimensoes", tipo: "CollectionPage" })} />

      <section className="grao border-b border-linha">
        <Container className="pb-16 pt-14 sm:pt-20">
          <p className="entrada-suave font-mono text-sm text-latao-escuro">Dimensões</p>
          <h1 className="entrada mt-4 max-w-4xl font-display text-[2.4rem] font-normal leading-[1.08] text-grafite sm:text-[3.6rem]">
            {copyText(MEGA_MENU.titulo)}
          </h1>
          <p className="entrada mt-6 max-w-2xl text-lg text-grafite/75" style={{ "--atraso": "160ms" } as React.CSSProperties}>
            {copyText(MEGA_MENU.apoio)}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <span className="text-[15px] text-mineral-escuro">{copyText(MEGA_MENU.fimPergunta)}</span>
            <PrimaryCTA href="/mapa">Descubra seu ponto de fricção</PrimaryCTA>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16 sm:py-20">
          <ol className="revelar-lista divide-y divide-linha border-y border-linha">
            {dims.map((d) => (
              <li key={d.id} className="grid gap-4 py-8 lg:grid-cols-[4rem_14rem_1fr_15rem] lg:gap-8">
                <span className="font-mono text-sm text-latao-escuro">{String(d.order).padStart(2, "0")}</span>
                <Link href={d.href} className="font-display text-[1.8rem] leading-none text-grafite hover:underline hover:decoration-latao hover:underline-offset-4">
                  {d.name}
                </Link>
                <span>
                  <span className="block font-display text-[1.12rem] italic leading-snug text-grafite/90">
                    {copyText(PERGUNTA_MENU[d.id])}
                  </span>
                  <span className="mt-2 block text-[15px] leading-relaxed text-mineral-escuro">{CARD_DIMENSAO[d.id].texto}</span>
                </span>
                <span className="flex flex-col gap-2 text-[14px]">
                  <Link href={d.href} className="font-medium text-grafite hover:text-tinta">
                    Explorar {d.name}
                  </Link>
                  {mapaVisivel(d.id) && (
                    <Link href={mapPath(d.id)} className="text-grafite/80 hover:text-tinta">
                      Fazer meu Mapa de {d.name}
                    </Link>
                  )}
                  {aVenda(`plan_${d.id}`) && (
                    <Link href={`/plano/${d.id}`} className="text-mineral-escuro hover:text-grafite">
                      Plano EPIC 7 Dias
                    </Link>
                  )}
                  {aVenda(`kit_${d.id}`) && (
                    <Link href={`/kit/${d.id}`} className="text-mineral-escuro hover:text-grafite">
                      Kit EPIC {d.name}
                    </Link>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Destino dos CTAs "Entender o Plano" e "Explorar os Kits" da Home. */}
      <section className="border-t border-linha bg-papel-claro">
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-2 lg:gap-16">
          <div id="plano" className="scroll-mt-24">
            <SectionTitle numero="01">Plano EPIC 7 Dias</SectionTitle>
            {preco("plan") && <p className="mt-3 font-mono text-sm text-latao-escuro">{preco("plan")}</p>}
            <p className="revelar mt-5 max-w-md text-lg leading-relaxed text-grafite/80">
              Um plano curto, personalizado a partir das suas respostas, para transformar reconhecimento em uma semana de movimento intencional.
            </p>
          </div>
          <div id="kits" className="scroll-mt-24">
            <SectionTitle numero="02">Kit EPIC da Dimensão</SectionTitle>
            {preco("kit") && <p className="mt-3 font-mono text-sm text-latao-escuro">{preco("kit")}</p>}
            <p className="revelar mt-5 max-w-md text-lg leading-relaxed text-grafite/80">
              Manual, workbook e ferramentas práticas para aprofundar uma dimensão específica.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
              {dims
                .filter((d) => aVenda(`kit_${d.id}`))
                .map((d) => (
                  <li key={d.id}>
                    <Link href={`/kit/${d.id}`} className="border-b border-latao/60 text-grafite hover:border-grafite">
                      {DIMENSIONS[d.id].name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
