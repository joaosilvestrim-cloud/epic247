import type { Metadata } from "next";
import FormMentoria from "@/components/epic/FormMentoria";
import Depoimentos from "@/components/epic/Depoimentos";
import JsonLd from "@/components/epic/JsonLd";
import MarcaMao from "@/components/epic/MarcaMao";
import { VagasMentoria } from "@/components/epic/ObjetosEditoriais";
import Visualizacao from "@/components/epic/Visualizacao";
import { C, Container, PrimaryCTA, SectionTitle, TextCTA } from "@/components/epic/ui";
import { temCopy } from "@/lib/epic/content/copy";
import { MENTORIA_FORM, MENTORIA_PAGINA as M, MENTORIA_SEO } from "@/lib/epic/content/mentoria";
import { SITE } from "@/lib/epic/seo";
import { perfilAtual } from "@/lib/epic/server/perfil";
import { formatPrice } from "@/lib/epic/products";
import { capacidadeMentoria, listarProdutos } from "@/lib/epic/server/produtos";

export const dynamic = "force-dynamic";

// SEO (Blueprint §57.9 e §57.18): index,follow, canonical limpo, sem dado do
// formulário em metadata. AVAILABLE e WAITLIST são a mesma URL.
export const metadata: Metadata = {
  title: { absolute: MENTORIA_SEO.title },
  description: MENTORIA_SEO.description,
  alternates: { canonical: "/mentoria" },
  openGraph: {
    title: MENTORIA_SEO.ogTitle,
    description: MENTORIA_SEO.ogDescription,
    type: "website",
    url: "/mentoria",
    siteName: "EPIC247",
    locale: "pt_BR",
  },
};

// WebPage + BreadcrumbList no piloto (RC1 §10). Sem Product: a venda passa
// por confirmação de vaga antes do checkout.
const LD = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Mentoria EPIC Individual",
    description: MENTORIA_SEO.description,
    url: `${SITE}/mentoria`,
    inLanguage: "pt-BR",
    isPartOf: { "@type": "WebSite", name: "EPIC247", url: SITE },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "EPIC247", item: SITE },
      { "@type": "ListItem", position: 2, name: "Mentoria", item: `${SITE}/mentoria` },
    ],
  },
];

type Props = { searchParams: Promise<{ pagamento?: string }> };

// A marca à mão sublinha o "próximo movimento" do título da Copy Final.
const MARCA = "próximo movimento";
const [antesMarca, depoisMarca] = M.hero.titulo.split(MARCA);

const eyebrow = "font-mono text-sm text-latao-escuro";
const texto = "text-lg leading-relaxed text-grafite/80";

function Lista({ itens, escuro = false }: { itens: string[]; escuro?: boolean }) {
  return (
    <ul className={`revelar-lista border-t ${escuro ? "border-papel/15" : "border-linha"}`}>
      {itens.map((i) => (
        <li
          key={i}
          className={`flex gap-4 border-b py-3.5 leading-relaxed ${escuro ? "border-papel/15 text-papel/85" : "border-linha text-grafite/85"}`}
        >
          <span aria-hidden className="mt-[0.7em] h-px w-4 shrink-0 bg-latao" />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

function Destaque({ linhas, escuro = false }: { linhas: string[]; escuro?: boolean }) {
  return (
    <blockquote className={`revelar border-l border-latao pl-6 font-display text-[1.45rem] leading-snug sm:text-[1.7rem] ${escuro ? "text-papel" : "text-grafite"}`}>
      {linhas.map((l) => (
        <p key={l}>{l}</p>
      ))}
    </blockquote>
  );
}

export default async function MentoriaPage({ searchParams }: Props) {
  const [vagas, perfil, sp, produtos] = await Promise.all([capacidadeMentoria(), perfilAtual(), searchParams, listarProdutos()]);
  // Preço exibido vem do catálogo (fonte comercial vigente, editável no admin),
  // não do texto: o "R$..." da Copy é trocado pelo valor atual do produto.
  const precoDe = (id: string) => {
    const p = produtos.find((x) => x.product_id === id);
    return p ? formatPrice(p.price_list) : null;
  };
  const comPreco = (texto: string, id: string) => {
    const v = precoDe(id);
    return v ? texto.replace(/R\$\s?[\d.]+(,\d{2})?/, v) : texto;
  };
  // Mentoria ativa: sem campanha de aquisição como CTA principal (Microcopy §31, RF-041).
  const cliente = Boolean(perfil?.mentoring_purchased);
  const espera = !vagas.disponivel;
  const ctaPrincipal = espera ? M.investimento.ctaEspera : M.investimento.ctaDisponivel;
  const livres = Math.max(0, vagas.capacidade - vagas.ocupadas);

  return (
    <>
      <Visualizacao nome="ViewMentoring" dados={{ product_id: "mentoring" }} />
      {LD.map((d) => (
        <JsonLd key={d["@type"]} dados={d} />
      ))}

      {/* 1. Hero */}
      <section className="grao border-b border-linha">
        <Container className="pb-20 pt-14 sm:pt-20">
          <p className={`entrada-suave ${eyebrow}`}>{M.hero.eyebrow}</p>
          <h1 className="entrada mt-4 max-w-4xl font-display text-[2.4rem] font-normal leading-[1.08] text-grafite sm:text-[3.5rem]">
            {antesMarca}
            <MarcaMao>{MARCA}</MarcaMao>
            {depoisMarca}
          </h1>
          <p className={`mt-8 max-w-2xl ${texto}`}>{M.hero.sub}</p>
          {!cliente && (
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <PrimaryCTA href="#participar">{espera ? M.investimento.ctaEspera : M.hero.cta}</PrimaryCTA>
              <TextCTA href="#como-funciona">{M.hero.ctaSecundario}</TextCTA>
            </div>
          )}
          <p className="mt-6 text-sm text-mineral-escuro">{M.hero.micro}</p>
        </Container>
      </section>

      {/* 2. Reconhecimento */}
      <section>
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionTitle numero="01">{M.reconhecimento.titulo}</SectionTitle>
            <div className={`revelar mt-6 max-w-md space-y-3 ${texto}`}>
              {M.reconhecimento.abertura.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
          </div>
          <div className="space-y-10">
            <Lista itens={M.reconhecimento.cenas} />
            <Destaque linhas={M.reconhecimento.fechamento} />
          </div>
        </Container>
      </section>

      {/* 3. O que é */}
      <section className="border-t border-linha bg-papel-claro">
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <p className={`mb-4 ${eyebrow}`}>{M.oQueE.eyebrow}</p>
            <SectionTitle numero="02">{M.oQueE.titulo}</SectionTitle>
            <div className={`revelar mt-6 max-w-md space-y-4 ${texto}`}>
              {M.oQueE.texto.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
          </div>
          <div className="space-y-10">
            <div>
              <p className="mb-4 text-grafite">{M.oQueE.encontrosIntro}</p>
              <Lista itens={M.oQueE.encontros} />
            </div>
            <Destaque linhas={M.oQueE.destaque} />
          </div>
        </Container>
      </section>

      {/* 4. Formato do piloto */}
      <section id="como-funciona" className="scroll-mt-20 border-t border-linha">
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <SectionTitle numero="03">{M.formato.titulo}</SectionTitle>
          <div>
            <p className="mb-4 text-grafite">{M.formato.intro}</p>
            <ol className="revelar-lista border-t border-linha">
              {M.formato.itens.map((f, i) => (
                <li key={f} className="flex gap-4 border-b border-linha py-4">
                  <span className="pt-1 font-mono text-xs text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-xl text-grafite">{f}</span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* 5. Como o processo se organiza */}
      <section className="border-t border-linha bg-papel-claro">
        <Container className="py-20 sm:py-28">
          <SectionTitle numero="04" className="max-w-3xl">{M.processo.titulo}</SectionTitle>
          <ol className="revelar-lista mt-12 grid gap-px overflow-hidden rounded-[var(--radius-epic)] border border-linha bg-linha sm:grid-cols-2 lg:grid-cols-3">
            {M.processo.etapas.map((e, i) => (
              <li key={e.nome} className="bg-papel-claro p-6">
                <p className="font-mono text-xs text-latao-escuro">Etapa {i + 1}</p>
                <h3 className="mt-2 font-display text-[1.35rem] leading-snug text-grafite">{e.nome}</h3>
                <p className="mt-3 leading-relaxed text-grafite/80">{e.texto}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 6. O papel das 10 dimensões */}
      <section className="bg-tinta text-papel">
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <p className="mb-4 font-mono text-sm text-latao">{M.dimensoes.eyebrow}</p>
            <SectionTitle numero="05" escuro>{M.dimensoes.titulo}</SectionTitle>
          </div>
          <div className="space-y-8">
            <div className="revelar space-y-4 text-lg leading-relaxed text-papel/80">
              {M.dimensoes.texto.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
            <Destaque linhas={[M.dimensoes.destaque]} escuro />
          </div>
        </Container>
      </section>

      {/* 7. Para quem faz sentido */}
      <section>
        <Container className="py-20 sm:py-28">
          <SectionTitle numero="06" className="max-w-3xl">{M.paraQuem.titulo}</SectionTitle>
          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h3 className="mb-4 font-display text-[1.35rem] text-grafite">{M.paraQuem.simIntro}</h3>
              <Lista itens={M.paraQuem.sim} />
            </div>
            <div>
              <h3 className="mb-4 font-display text-[1.35rem] text-grafite">{M.paraQuem.naoIntro}</h3>
              <Lista itens={M.paraQuem.nao} />
            </div>
          </div>
        </Container>
      </section>

      {/* 8. Mentoria x Protocolo */}
      <section className="border-t border-linha bg-papel-claro">
        <Container className="py-20 sm:py-28">
          <SectionTitle numero="07" className="max-w-3xl">{M.comparacao.titulo}</SectionTitle>
          <div className="revelar-lista mt-12 grid gap-6 md:grid-cols-2">
            {M.comparacao.colunas.map((c) => (
              <article key={c.nome} className="flex flex-col rounded-[var(--radius-epic)] border border-linha bg-papel p-7">
                <h3 className="font-display text-[1.6rem] leading-tight text-grafite">{c.nome}</h3>
                <dl className="mt-6 flex-1 space-y-5">
                  <div>
                    <dt className="font-mono text-xs text-latao-escuro">Formato</dt>
                    <dd className="mt-1 leading-relaxed text-grafite/85">{c.formato}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs text-latao-escuro">Indicado para</dt>
                    <dd className="mt-1 leading-relaxed text-grafite/85">{c.indicado}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs text-latao-escuro">{c.precoRotulo}</dt>
                    <dd className="mt-1 font-display text-2xl text-grafite">
                      {comPreco(c.preco, c.href === "/protocolo" ? "protocol" : "mentoring")}
                    </dd>
                  </div>
                </dl>
                {c.href && (
                  <div className="mt-6">
                    <TextCTA href={c.href}>Conhecer o Protocolo</TextCTA>
                  </div>
                )}
              </article>
            ))}
          </div>
          <div className="revelar mt-10 max-w-2xl space-y-1 text-grafite/80">
            {M.comparacao.fechamento.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
        </Container>
      </section>

      {/* 9. O que você recebe */}
      <section className="border-t border-linha">
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <SectionTitle numero="08">{M.recebe.titulo}</SectionTitle>
          <div>
            <p className="mb-4 text-grafite">{M.recebe.intro}</p>
            <Lista itens={M.recebe.itens} />
          </div>
        </Container>
      </section>

      {/* 10. Sobre o Plano EPIC individual */}
      <section className="border-t border-linha bg-papel-claro">
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <p className={`mb-4 ${eyebrow}`}>{M.plano.eyebrow}</p>
            <SectionTitle numero="09">{M.plano.titulo}</SectionTitle>
          </div>
          <div className="space-y-8">
            <div className={`revelar space-y-4 ${texto}`}>
              {M.plano.texto.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
            <Destaque linhas={M.plano.destaque} />
          </div>
        </Container>
      </section>

      {/* 11. Capacidade e vagas: escassez real, sem contagem regressiva */}
      <section className="border-t border-linha">
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <p className={`mb-4 ${eyebrow}`}>{M.vagas.eyebrow}</p>
            <SectionTitle numero="10">{M.vagas.titulo}</SectionTitle>
            <div className={`revelar mt-6 max-w-md space-y-3 ${texto}`}>
              {M.vagas.texto.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
          </div>
          <div className="space-y-8 self-end">
            <div className="rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-7">
              <VagasMentoria capacidade={vagas.capacidade} ocupadas={Math.min(vagas.ocupadas, vagas.capacidade)} />
              <p className="mt-4 text-grafite">
                {espera
                  ? "As vagas deste ciclo estão preenchidas."
                  : `${livres} de ${vagas.capacidade} ${vagas.capacidade === 1 ? "vaga aberta" : "vagas abertas"} neste ciclo.`}
              </p>
              {espera && <p className="mt-2 text-sm leading-relaxed text-mineral-escuro">{M.vagas.listaEspera}</p>}
            </div>
            <Destaque linhas={[M.vagas.destaque]} />
          </div>
        </Container>
      </section>

      {/* 12. Investimento e formulário (mesma URL para AVAILABLE e WAITLIST) */}
      <section id="participar" className="scroll-mt-20 border-t border-linha bg-papel-escuro">
        <Container className="grid gap-14 py-20 sm:py-28 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div>
            <p className={`mb-4 ${eyebrow}`}>{M.investimento.eyebrow}</p>
            <h2 className="revelar font-display text-[1.9rem] font-normal leading-[1.15] text-grafite sm:text-[2.4rem]">
              {comPreco(M.investimento.titulo, "mentoring")}
            </h2>
            <p className="mb-3 mt-8 text-grafite">{M.investimento.intro}</p>
            <Lista itens={M.investimento.itens} />
            <p className="mt-6 text-grafite">
              {M.investimento.pagamentoRotulo} {M.investimento.pagamento}
            </p>
            <div className="mt-6 space-y-1 text-sm leading-relaxed text-mineral-escuro">
              {M.investimento.micro.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
          </div>

          <div id="formulario" className="scroll-mt-20 rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-7 sm:p-9">
            {sp.pagamento === "indisponivel" && (
              <p role="status" className="mb-6 border-l border-latao pl-4 text-sm leading-relaxed text-grafite">
                Este link de pagamento não está mais ativo. Se precisar, fale com a gente pelo{" "}
                <a href="/contato" className="underline underline-offset-2">contato</a>.
              </p>
            )}
            {cliente ? (
              <div role="status">
                <p className="font-display text-[1.7rem] leading-snug text-grafite">
                  Pagamento confirmado. Sua participação na Mentoria EPIC Individual está confirmada.
                </p>
                <p className="mt-3 leading-relaxed text-grafite/75">
                  Para combinar os próximos passos ou tirar uma dúvida, responda o e-mail da Mentoria ou escreva pelo{" "}
                  <a href="/contato" className="underline underline-offset-4">contato</a>.
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-[1.7rem] leading-snug text-grafite">
                  {espera ? MENTORIA_FORM.tituloEspera : MENTORIA_FORM.tituloInteresse}
                </h2>
                {espera && <p className="mt-3 leading-relaxed text-grafite/75">{MENTORIA_FORM.textoEspera}</p>}
                <div className="mt-8">
                  <FormMentoria listaDeEspera={espera} />
                </div>
              </>
            )}
          </div>
        </Container>
      </section>

      {/* 13. Ju */}
      <section className="border-t border-linha">
        <Container estreito className="py-20 sm:py-28">
          <SectionTitle numero="11">{M.ju.titulo}</SectionTitle>
          <p className={`revelar mt-6 ${texto}`}>{M.ju.texto}</p>
          <div className="mt-8">
            <TextCTA href="/ju">{M.ju.cta}</TextCTA>
          </div>
        </Container>
      </section>

      {/* 14. O que a Mentoria não é */}
      <section className="border-t border-linha bg-papel-claro">
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionTitle numero="12">{M.naoE.titulo}</SectionTitle>
            <p className={`revelar mt-6 max-w-md ${texto}`}>{M.naoE.complemento}</p>
          </div>
          <div className="space-y-10">
            <div>
              <p className="mb-4 text-grafite">{M.naoE.intro}</p>
              <Lista itens={M.naoE.itens} />
            </div>
            <Destaque linhas={[M.naoE.destaque]} />
          </div>
        </Container>
      </section>

      {/* 15. FAQ */}
      <section className="border-t border-linha">
        <Container estreito className="py-20 sm:py-28">
          <SectionTitle numero="13">Perguntas frequentes</SectionTitle>
          <div className="revelar-lista mt-10 border-t border-linha">
            {M.faq.filter((f) => temCopy(f.r)).map((f) => (
              <details key={f.p} className="group border-b border-linha py-5">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 font-display text-[1.25rem] leading-snug text-grafite">
                  {f.p}
                  <span aria-hidden className="font-mono text-sm text-latao-escuro group-open:hidden">+</span>
                  <span aria-hidden className="hidden font-mono text-sm text-latao-escuro group-open:inline">−</span>
                </summary>
                <p className="mt-3 leading-relaxed text-grafite/80">
                  <C v={f.r} />
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <Depoimentos lugar="mentoria" />

      {/* 16. Fechamento */}
      <section className="bg-tinta text-papel">
        <Container estreito className="py-20 sm:py-28">
          <h2 className="revelar font-display text-[2rem] font-normal leading-[1.12] text-papel sm:text-[2.8rem]">
            {M.fechamento.titulo}
          </h2>
          <p className="revelar mt-6 text-lg leading-relaxed text-papel/80">{M.fechamento.sub}</p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            {!cliente && <PrimaryCTA href="#participar" escuro>{ctaPrincipal}</PrimaryCTA>}
            <TextCTA href="/mapa" escuro>{M.fechamento.ctaSecundario}</TextCTA>
          </div>
          <p className="mt-14 font-display text-xl text-papel/70">{M.fechamento.marca}</p>
        </Container>
      </section>
    </>
  );
}
