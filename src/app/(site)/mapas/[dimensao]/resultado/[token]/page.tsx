import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CapturaResultado from "@/components/epic/CapturaResultado";
import EscolhaPrioridade from "@/components/epic/EscolhaPrioridade";
import FeedbackResultado from "@/components/epic/FeedbackResultado";
import MarcaMao from "@/components/epic/MarcaMao";
import EixosMapa from "@/components/epic/EixosMapa";
import Visualizacao from "@/components/epic/Visualizacao";
import { C, Container, PrimaryCTA, TextCTA } from "@/components/epic/ui";
import { pendente } from "@/lib/epic/content/copy";
import { DIMENSIONS, isDimensionId, type DimensionId } from "@/lib/epic/dimensions";
import { relacaoDoPar } from "@/lib/epic/maps/relacoes";
import { getDimensionalMap } from "@/lib/epic/maps";
import type { DimensionalResult } from "@/lib/epic/maps/types";
import { formatPrice } from "@/lib/epic/products";
import { withTx } from "@/lib/epic/server/db";
import { recomporResultado, resultadoPorToken } from "@/lib/epic/server/mapas";
import { ofertasPermitidas, perfilAtual } from "@/lib/epic/server/perfil";
import { listarProdutos, vendavel } from "@/lib/epic/server/produtos";
import { dimensaoHref } from "@/lib/epic/site";

export const dynamic = "force-dynamic";

// Resultado pessoal: nunca indexado (RF-058).
export const metadata: Metadata = {
  title: "Seu resultado",
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ dimensao: string; token: string }> };

const RESULTADO_BAIXO = {
  titulo: pendente("Nenhuma área concentra uma fricção relevante neste momento."),
  texto: pendente(
    "Suas respostas sugerem que esta dimensão está relativamente estável hoje. Isso não significa que nada precise de atenção: talvez a fricção esteja em outro lugar. O Mapa de Fricção ajuda a descobrir por onde começar."
  ),
};

/** Sublinha à mão o nome do padrão dentro do título (uma marcação por tela). */
function comMarca(titulo: string, nome: string) {
  const k = titulo.lastIndexOf(nome);
  if (k < 0) return titulo;
  return (
    <>
      {titulo.slice(0, k)}
      <MarcaMao atraso={750}>{nome}</MarcaMao>
      {titulo.slice(k + nome.length)}
    </>
  );
}

export default async function ResultadoDimensionalPage({ params }: Params) {
  const { dimensao, token } = await params;
  if (!isDimensionId(dimensao)) notFound();

  const salvo = await withTx((q) => resultadoPorToken(q, token)).catch(() => null);
  if (!salvo || salvo.map_type !== dimensao) notFound();

  const cfg = getDimensionalMap(dimensao);
  const r = recomporResultado(salvo) as DimensionalResult;
  const d = DIMENSIONS[dimensao];
  const [perfil, produtos] = await Promise.all([perfilAtual(), listarProdutos()]);
  const regras = ofertasPermitidas(perfil, dimensao);
  const plano = produtos.find((p) => p.product_id === `plan_${dimensao}`);
  const kit = produtos.find((p) => p.product_id === `kit_${dimensao}`);
  const principal = cfg.profiles[r.primary];
  const secundario = cfg.profiles[r.secondary];
  const rotulo = (k: string) => cfg.axes.find((a) => a.key === k)?.label ?? k;
  const destaque = r.kind === "tie" ? r.tiedTop : [r.primary];
  const relacionadas = cfg.related
    .map((x) => ({ ...x, href: dimensaoHref(x.dimension) }))
    .filter((x): x is typeof x & { href: string } => x.href !== null);
  const data = new Date(salvo.completed_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <Visualizacao nome="ViewMapResult" dados={{ map_type: dimensao, primary_pattern: r.primary }} />

      {/* 1-2 · Padrão predominante + reconhecimento */}
      <section className="grao border-b border-linha">
        <Container estreito className="pb-16 pt-14 sm:pt-20">
          <p className="font-mono text-sm text-latao-escuro">
            {cfg.title} · {data}
          </p>

          {r.kind === "low" ? (
            <>
              <h1 className="entrada mt-5 font-display text-[2.1rem] font-normal leading-[1.15] text-grafite sm:text-[2.8rem]">
                <C v={RESULTADO_BAIXO.titulo} />
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-grafite/80">
                <C v={RESULTADO_BAIXO.texto} />
              </p>
            </>
          ) : (
            <>
              {principal.editorialName && (
                <p className="mt-5 text-grafite/70">
                  Seu padrão predominante neste momento parece ser{" "}
                  <span className="font-display text-xl italic text-grafite">{principal.editorialName}</span>.
                </p>
              )}
              <h1 className="entrada mt-4 font-display text-[2.1rem] font-normal leading-[1.15] text-grafite sm:text-[2.8rem]">
                {comMarca(
                  cfg.generalTitle && r.kind === "single"
                    ? cfg.generalTitle.replace("{DRENO}", rotulo(r.primary))
                    : principal.title,
                  rotulo(r.primary)
                )}
              </h1>
              {cfg.generalSubtitle && <p className="mt-4 text-grafite/70">{cfg.generalSubtitle}</p>}
              {(r.kind === "tie" || r.kind === "close") && (
                <p className="mt-6 border-l border-latao pl-5 text-lg leading-relaxed text-grafite/85">
                  {cfg.dualMessage.replace("{A}", rotulo(r.primary)).replace("{B}", rotulo(r.secondary))}
                </p>
              )}
              {r.kind === "tie" && r.tiedTop.length > 1 && (
                <EscolhaPrioridade
                  token={token}
                  opcoes={r.tiedTop.map((k) => ({ chave: k, nome: rotulo(k) }))}
                  inicial={salvo.chosen_pattern}
                />
              )}
              {(r.kind === "tie" || r.kind === "close") && relacaoDoPar(dimensao, r.primary, r.secondary) && (
                <p className="mt-3 pl-5 text-[15px] leading-relaxed text-mineral-escuro">
                  {rotulo(r.primary)} e {rotulo(r.secondary)}: {relacaoDoPar(dimensao, r.primary, r.secondary)}
                </p>
              )}
              {/* Frase de reconhecimento como citação editorial: aspas grandes em latão. */}
              <blockquote className="entrada relative mt-12 pl-10 font-display text-[1.5rem] leading-snug text-grafite sm:pl-14 sm:text-[1.85rem]" style={{ "--atraso": "350ms" } as React.CSSProperties}>
                <span aria-hidden className="absolute -top-4 left-0 font-display text-[4.5rem] leading-none text-latao sm:-top-6 sm:text-[6rem]">“</span>
                {principal.recognition}
              </blockquote>
            </>
          )}
        </Container>
      </section>

      {/* 3 · As cinco áreas */}
      <section>
        <Container estreito className="py-14">
          <h2 className="mb-6 font-display text-xl italic text-mineral-escuro">As cinco áreas do seu mapa</h2>
          <EixosMapa eixos={r.axes} rotulos={cfg.axes} destaque={r.kind === "low" ? [] : destaque} mapa={dimensao} />
          <p className="mt-4 text-sm text-mineral-escuro">
            O mapa mostra onde existe mais fricção percebida neste momento. Não é uma nota nem uma medida de saúde.
          </p>
        </Container>
      </section>

      {r.kind !== "low" && (
        <>
          {/* 4 · Interpretação */}
          <section>
            <Container estreito className="pb-14">
              <h2 className="font-display text-[1.6rem] text-grafite">O que isso pode significar</h2>
              <p className="mt-4 text-lg leading-relaxed text-grafite/85">{principal.interpretation}</p>
              {r.kind !== "single" && (
                <div className="mt-8 border-t border-linha pt-6">
                  <p className="font-mono text-xs text-latao-escuro">Também muito próximo: {rotulo(r.secondary)}</p>
                  <p className="mt-2 leading-relaxed text-grafite/80">{secundario.interpretation}</p>
                </div>
              )}
            </Container>
          </section>

          {/* 5 · Primeiro movimento gratuito */}
          <section className="bg-papel-escuro">
            <Container estreito className="py-14">
              <p className="font-mono text-sm text-latao-escuro">Seu primeiro movimento</p>
              <p className="mt-4 font-display text-[1.45rem] leading-snug text-grafite sm:text-[1.7rem]">
                {principal.firstMove}
              </p>
            </Container>
          </section>
        </>
      )}

      {/* Feedback qualitativo do resultado (seção 17 dos Mapas, Fricção §10) */}
      <section className="border-t border-linha">
        <Container estreito className="py-12">
          <FeedbackResultado token={token} />
        </Container>
      </section>

      {/* 6 · Captura */}
      <section>
        <Container estreito className="py-14">
          <CapturaResultado token={token} mapType={dimensao} jaConhecido={Boolean(perfil?.email)} />
        </Container>
      </section>

      {/* 7-8 · Ofertas (com supressão) */}
      <section className="border-y border-linha bg-papel-claro">
        <Container estreito className="py-14">
          {regras.jaTemProtocolo ? (
            <div>
              <p className="font-mono text-sm text-latao-escuro">Você já tem o Protocolo EPIC247</p>
              <p className="mt-3 font-display text-2xl text-grafite">
                <C v={pendente(`Use este resultado para começar pelo módulo de ${d.name} do Protocolo.`)} />
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {regras.plano && plano && (vendavel(plano) || process.env.NEXT_PUBLIC_EPIC_ENV !== "production") && (
                <Link
                  href={`/plano/${dimensao}?r=${token}`}
                  className="group flex flex-col gap-4 rounded-[var(--radius-epic)] border border-grafite bg-grafite p-7 text-papel sm:flex-row sm:items-center sm:justify-between"
                >
                  <span>
                    <span className="block font-display text-2xl">{cfg.ctaPlan}</span>
                    <span className="mt-1 block text-sm text-papel/70">
                      Personalizado a partir das suas respostas. 7 dias, um foco, passos pequenos.
                    </span>
                  </span>
                  <span className="font-display text-3xl">{formatPrice(plano.price_list)}</span>
                </Link>
              )}
              {regras.kit && kit && (vendavel(kit) || process.env.NEXT_PUBLIC_EPIC_ENV !== "production") && (
                <Link
                  href={`/kit/${dimensao}`}
                  className="group flex flex-col gap-4 rounded-[var(--radius-epic)] border border-linha bg-papel p-7 transition-colors hover:border-latao sm:flex-row sm:items-center sm:justify-between"
                >
                  <span>
                    <span className="block font-display text-xl text-grafite">{cfg.ctaKit}</span>
                    <span className="mt-1 block text-sm text-mineral-escuro">Manual + Workbook + ferramentas práticas.</span>
                  </span>
                  <span className="font-display text-2xl text-grafite">{formatPrice(kit.price_list)}</span>
                </Link>
              )}
              {regras.plano && plano && <Visualizacao nome="ViewPlanOffer" dados={{ product_id: plano.product_id, dimension: dimensao }} />}
              {regras.kit && kit && <Visualizacao nome="ViewKitOffer" dados={{ product_id: kit.product_id, dimension: dimensao }} />}
            </div>
          )}
        </Container>
      </section>

      {/* 9 · Contexto Protocolo */}
      <section>
        <Container estreito className="py-14">
          <p className="font-display text-[1.5rem] leading-snug text-grafite">
            {d.name} é uma das 10 dimensões do EPIC247.
          </p>
          <p className="mt-3 text-grafite/80">
            Você pode começar por uma dimensão específica. Mas algumas mudanças exigem olhar o sistema inteiro.
          </p>
          {regras.protocolo && (
            <div className="mt-6">
              <TextCTA href="/protocolo">Conhecer o Protocolo</TextCTA>
            </div>
          )}
        </Container>
      </section>

      {/* 10 · Dimensões relacionadas */}
      {relacionadas.length > 0 && (
        <section className="bg-papel-escuro">
          <Container estreito className="py-14">
            <h2 className="font-display text-[1.5rem] text-grafite">Às vezes a fricção está em outro lugar</h2>
            <ul className="mt-6 divide-y divide-linha border-y border-linha">
              {relacionadas.map((x) => (
                <li key={x.dimension}>
                  <Link href={x.href} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                    <span className="font-display text-lg text-grafite">{DIMENSIONS[x.dimension as DimensionId].name}</span>
                    <span className="text-[15px] text-mineral-escuro">{x.when.charAt(0).toUpperCase() + x.when.slice(1)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Fechamento e responsabilidade */}
      {/* Claro: o rodapé escuro é a cena final; aqui, o fechamento do Mapa. */}
      <section className="grao border-t border-linha bg-papel-escuro">
        <Container estreito className="py-20">
          <p className="revelar font-display text-[1.6rem] leading-snug text-grafite sm:text-[2.1rem]">{cfg.closingPhrase}</p>
          {cfg.safetyNote && <p className="mt-8 border-l border-latao pl-5 text-sm leading-relaxed text-grafite/80">{cfg.safetyNote}</p>}
          <p className="mt-6 text-sm leading-relaxed text-mineral-escuro">{cfg.disclaimer}</p>
          <div className="mt-10">
            <PrimaryCTA href="/mapa">
              Fazer o Mapa de Fricção
            </PrimaryCTA>
          </div>
        </Container>
      </section>
    </>
  );
}
