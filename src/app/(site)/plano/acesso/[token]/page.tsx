import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BotaoImprimir from "@/components/epic/BotaoImprimir";
import { Container, PrimaryCTA, TextCTA } from "@/components/epic/ui";
import { DIMENSIONS, mapPath } from "@/lib/epic/dimensions";
import { withTx } from "@/lib/epic/server/db";
import { listarConteudos, TIPO_ROTA } from "@/lib/epic/server/conteudo";
import { planoPorToken, registrarRetornoDia7 } from "@/lib/epic/server/planos";
import type { TipoBloco } from "@/lib/epic/plano/estrutura";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Seu Plano EPIC", robots: { index: false, follow: false } };

type Props = { params: Promise<{ token: string }> };

export default async function PlanoAcessoPage({ params }: Props) {
  const { token } = await params;
  const g = await withTx((q) => planoPorToken(q, token)).catch(() => null);
  if (!g) notFound();
  if (g.content) await withTx((q) => registrarRetornoDia7(q, g)).catch(() => null);

  // Compra aprovada, mas o Mapa ainda não foi feito: o Plano espera por ele.
  if (g.processing_status !== "generated" || !g.content) {
    const dim = g.product_id.replace("plan_", "") as keyof typeof DIMENSIONS;
    const nome = DIMENSIONS[dim]?.name ?? "";
    return (
      <section className="grao min-h-[60vh]">
        <Container estreito className="py-24">
          <p className="font-mono text-sm text-latao-escuro">Plano EPIC {nome} 7 Dias</p>
          <h1 className="mt-4 font-display text-[2.4rem] leading-tight text-grafite">Falta um passo.</h1>
          <p className="mt-4 text-lg text-grafite/80">
            Para personalizar o seu Plano, precisamos das suas respostas no Mapa de {nome}. Assim que você
            concluir, o Plano aparece aqui e chega no seu e-mail.
          </p>
          {DIMENSIONS[dim] && (
            <div className="mt-8">
              <PrimaryCTA href={mapPath(dim)}>Fazer o Mapa de {nome}</PrimaryCTA>
            </div>
          )}
        </Container>
      </section>
    );
  }

  const p = g.content;
  const [rec] = await listarConteudos({ dimensao: p.dimensao, limite: 1 });
  const recomendado = rec ? { titulo: rec.title, url: `/ideias/${TIPO_ROTA[rec.content_type]}/${rec.slug}` } : null;
  return (
    <article className="pb-16">
      <section className="grao border-b border-linha">
        <Container estreito className="pb-12 pt-14 sm:pt-20">
          <p className="font-mono text-sm text-latao-escuro">{p.personalizacao}</p>
          <h1 className="mt-4 font-display text-[2.4rem] font-normal leading-[1.1] text-grafite sm:text-[3.2rem]">
            {p.titulo}
          </h1>
          <p className="mt-5 text-lg text-grafite/80">
            Seu padrão predominante neste momento:{" "}
            <strong className="font-semibold text-grafite">{p.padrao.nome}</strong>
            {p.padrao.nomeEditorial ? ` (${p.padrao.nomeEditorial})` : ""}. Também apareceu: {p.secundario.nome}.
          </p>
          <div className="mt-6 print:hidden">
            <BotaoImprimir />
          </div>
        </Container>
      </section>

      <Container estreito className="space-y-12 pt-12">
        {(p.estrutura ?? ESTRUTURA_ANTIGA).map((b) => {
          switch (b.tipo) {
            case "foco":
              return (
                <Secao key={b.titulo} titulo={b.titulo}>
                  <p className="font-display text-2xl leading-snug text-grafite">{p.foco}</p>
                </Secao>
              );
            case "observar":
              return (
                <Secao key={b.titulo} titulo={b.titulo}>
                  <blockquote className="border-l border-latao pl-5 font-display text-xl leading-snug text-grafite">
                    {p.padraoAObservar}
                  </blockquote>
                  <p className="mt-5 text-grafite/80">O sinal mais forte nas suas respostas:</p>
                  <p className="mt-2 text-grafite">{p.sinalMaisForte}</p>
                </Secao>
              );
            case "reduzir":
              return p.reduzir ? (
                <Secao key={b.titulo} titulo={b.titulo}>
                  <p className="text-lg text-grafite">{p.reduzir}</p>
                </Secao>
              ) : (
                <Campo key={b.titulo} titulo={b.titulo} />
              );
            case "movimentos":
              return (
                <Secao key={b.titulo} titulo={b.titulo}>
                  <ol className="space-y-3">
                    {p.movimentos.map((m, i) => (
                      <li key={i} className="flex gap-4">
                        <span className="pt-1 font-mono text-xs text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-lg text-grafite">{m}</span>
                      </li>
                    ))}
                  </ol>
                </Secao>
              );
            case "pratica":
              return (
                <Secao key={b.titulo} titulo={b.titulo}>
                  <p className="text-lg text-grafite">{p.pratica}</p>
                  {!p.estrutura && p.gatilho && <p className="mt-3 text-grafite/80">Gatilho: {p.gatilho}</p>}
                  {!p.estrutura && p.retomada && <p className="mt-3 text-grafite/80">Regra de retomada: {p.retomada}</p>}
                </Secao>
              );
            case "gatilho":
              return p.gatilho ? (
                <Secao key={b.titulo} titulo={b.titulo}><p className="text-lg text-grafite">{p.gatilho}</p></Secao>
              ) : (
                <Campo key={b.titulo} titulo={b.titulo} />
              );
            case "retomada":
              return p.retomada ? (
                <Secao key={b.titulo} titulo={b.titulo}><p className="text-lg text-grafite">{p.retomada}</p></Secao>
              ) : (
                <Campo key={b.titulo} titulo={b.titulo} />
              );
            case "pergunta":
              return (
                <div key={b.titulo} className="space-y-12">
                  <OsSeteDias dias={p.dias} />
                  <Secao titulo={b.titulo}>
                    <p className="font-display text-xl leading-snug text-grafite">{p.pergunta}</p>
                  </Secao>
                </div>
              );
            case "conteudo":
              return recomendado ? (
                <Secao key={b.titulo} titulo={b.titulo}>
                  <TextCTA href={recomendado.url}>{recomendado.titulo}</TextCTA>
                </Secao>
              ) : null;
            case "revisao":
              return (
                <Secao key={b.titulo} titulo={b.titulo}>
                  <ul className="space-y-2">
                    {p.revisaoDia7.map((r) => (
                      <li key={r} className="border-l border-latao pl-4 text-grafite">{r}</li>
                    ))}
                  </ul>
                </Secao>
              );
            case "proximo":
              return (
                <Secao key={b.titulo} titulo={b.titulo}>
                  <p className="text-lg text-grafite">{p.proximoPasso}</p>
                  <p className="mt-4 print:hidden">
                    <TextCTA href={`/kit/${p.dimensao}`}>Conhecer o Kit</TextCTA>
                  </p>
                </Secao>
              );
            default:
              return <Campo key={b.titulo} titulo={b.titulo} />;
          }
        })}

        <p className="border-t border-linha pt-6 text-sm leading-relaxed text-mineral-escuro">
          Plano gerado automaticamente a partir das suas respostas, em caráter educativo. Não é análise individual
          nem substitui avaliação ou acompanhamento profissional.
        </p>
      </Container>
    </article>
  );
}

/** Planos gerados antes da versão 1.1 (sem estrutura própria) seguem a ordem antiga. */
const ESTRUTURA_ANTIGA: { titulo: string; tipo: TipoBloco }[] = [
  { titulo: "Seu foco dos próximos 7 dias", tipo: "foco" },
  { titulo: "O padrão a observar", tipo: "observar" },
  { titulo: "Uma coisa para reduzir", tipo: "reduzir" },
  { titulo: "Três movimentos simples", tipo: "movimentos" },
  { titulo: "Prática diária mínima", tipo: "pratica" },
  { titulo: "Pergunta de reflexão", tipo: "pergunta" },
  { titulo: "Revisão no dia 7", tipo: "revisao" },
  { titulo: "Próximo passo", tipo: "proximo" },
];

/** Bloco que o documento pede e que a pessoa preenche (caderno de trabalho, também no impresso). */
function Campo({ titulo }: { titulo: string }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="mb-3 font-mono text-sm text-latao-escuro">{titulo}</h2>
      <div aria-hidden className="space-y-7 pt-4">
        <div className="border-b border-linha" />
        <div className="border-b border-linha" />
      </div>
    </section>
  );
}

function OsSeteDias({ dias }: { dias: { dia: number; titulo: string; acao: string }[] }) {
  return (
    <Secao titulo="Os 7 dias">
      <ol className="divide-y divide-linha border-y border-linha">
        {dias.map((d) => (
          <li key={d.dia} className="grid gap-2 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
            <span>
              <span className="font-mono text-xs text-latao-escuro">Dia {d.dia}</span>
              <span className="block font-display text-lg text-grafite">{d.titulo}</span>
            </span>
            <span className="text-[17px] leading-relaxed text-grafite/90">{d.acao}</span>
          </li>
        ))}
      </ol>
    </Secao>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="mb-4 font-mono text-sm text-latao-escuro">{titulo}</h2>
      {children}
    </section>
  );
}
