import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CapturaResultado from "@/components/epic/CapturaResultado";
import FeedbackResultado from "@/components/epic/FeedbackResultado";
import MarcaMao from "@/components/epic/MarcaMao";
import Visualizacao from "@/components/epic/Visualizacao";
import { Container, PrimaryCTA, TextCTA } from "@/components/epic/ui";
import { DIMENSIONS, mapPath, type DimensionId } from "@/lib/epic/dimensions";
import { FRICCAO } from "@/lib/epic/maps";
import type { FrictionResult } from "@/lib/epic/maps/types";
import { withTx } from "@/lib/epic/server/db";
import { recomporResultado, resultadoPorToken } from "@/lib/epic/server/mapas";
import { perfilAtual } from "@/lib/epic/server/perfil";
import { dimensaoHref, dimensaoVisivel, dimensionPath, mapaVisivel } from "@/lib/epic/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Seu ponto de fricção",
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ token: string }> };

export default async function ResultadoFriccaoPage({ params }: Params) {
  const { token } = await params;
  const salvo = await withTx((q) => resultadoPorToken(q, token)).catch(() => null);
  if (!salvo || salvo.map_type !== "friccao") notFound();

  const r = recomporResultado(salvo) as FrictionResult;
  const perfil = await perfilAtual();
  const p = r.primary;
  const s = r.secondary;
  const nome = (d: DimensionId) => DIMENSIONS[d].name;
  const proximas = r.kind !== "single";

  // Ranking só das 5 primeiras, sem números: evita falsa precisão (§3).
  // A ordem vem do motor (com desempate), para a 1ª barra ser sempre a do texto.
  const ranking = r.ranking.slice(0, 5);
  const valor = r.relativeScores ?? r.scores;
  const menor = r.relativeScores ? Math.min(...Object.values(r.relativeScores)) : 0;
  const maior = valor[ranking[0]];
  const largura = (d: DimensionId) =>
    maior - menor > 0 ? Math.max(8, ((valor[d] - menor) / (maior - menor)) * 100) : 100;

  const ctaPrincipal = mapaVisivel(p)
    ? { href: mapPath(p), label: FRICCAO.results[p].cta.replace(/\.$/, "") }
    : dimensaoVisivel(p)
      ? { href: dimensionPath(p), label: `Explorar ${nome(p)} no EPIC247` }
      : null;

  // Opções do resultado duplo: quem tem Mapa aprofundado no ar vem primeiro.
  const opcoes = [p, s]
    .map((dim) => ({ dim, href: dimensaoHref(dim), comMapa: mapaVisivel(dim) }))
    .filter((o): o is { dim: DimensionId; href: string; comMapa: boolean } => o.href !== null)
    .sort((a, b) => Number(b.comMapa) - Number(a.comMapa));

  return (
    <>
      <Visualizacao nome="ViewMapResult" dados={{ map_type: "friccao", dimension: p }} />

      <section className="grao border-b border-linha">
        <Container estreito className="pb-16 pt-14 sm:pt-20">
          <p className="entrada-suave font-mono text-sm text-latao-escuro">Mapa de Fricção EPIC</p>
          <h1 className="entrada mt-5 font-display text-[2.2rem] font-normal leading-[1.12] text-grafite sm:text-[3rem]">
            {(() => {
              // Sublinhado à mão no nome da dimensão (a única marcação da tela).
              const t = FRICCAO.results[p].title;
              const k = t.lastIndexOf(nome(p));
              return k < 0 ? t : (
                <>
                  {t.slice(0, k)}
                  <MarcaMao atraso={700}>{nome(p)}</MarcaMao>
                  {t.slice(k + nome(p).length)}
                </>
              );
            })()}
          </h1>
          {proximas && (
            <p className="mt-6 border-l border-latao pl-5 text-lg leading-relaxed text-grafite/85">
              {FRICCAO.dualMessage.replace("{A}", nome(p)).replace("{B}", nome(s))}
            </p>
          )}
          <p className="mt-8 text-lg leading-relaxed text-grafite/85">{FRICCAO.results[p].interpretation}</p>
          {/* Resultado duplo (Mapa de Fricção §6): as duas interpretações resumidas. */}
          {proximas && (
            <p className="mt-5 text-lg leading-relaxed text-grafite/75">
              <span className="font-display text-grafite">{nome(s)}.</span> {FRICCAO.results[s].interpretation}
            </p>
          )}
        </Container>
      </section>

      <section>
        <Container estreito className="py-14">
          <h2 className="mb-6 font-display text-xl italic text-mineral-escuro">Onde a fricção aparece mais</h2>
          <ol className="divide-y divide-linha border-y border-linha">
            {ranking.map((d, i) => (
              <li key={d} className="grid items-center gap-4 py-4 sm:grid-cols-[12rem_1fr]">
                <span className={`font-display text-lg ${i === 0 ? "text-tinta" : "text-grafite/80"}`}>
                  {nome(d)}
                  {i === 0 && <span className="ml-2 font-sans text-xs text-mineral-escuro">principal</span>}
                  {i === 1 && <span className="ml-2 font-sans text-xs text-mineral-escuro">relacionada</span>}
                </span>
                <span aria-hidden className="relative h-2 overflow-hidden rounded-full bg-papel-escuro">
                  <span
                    className={`barra-cresce absolute inset-y-0 left-0 rounded-full ${i === 0 ? "bg-grafite" : "bg-mineral"}`}
                    style={{ width: `${largura(d)}%`, "--atraso": `${200 + i * 120}ms` } as React.CSSProperties}
                  />
                </span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-papel-escuro">
        <Container estreito className="py-14">
          <p className="font-mono text-sm text-latao-escuro">Seu primeiro movimento</p>
          <p className="mt-4 font-display text-[1.45rem] leading-snug text-grafite sm:text-[1.7rem]">
            {FRICCAO.results[p].firstMove}
          </p>
          {proximas && (
            <p className="mt-6 text-grafite/75">
              E sobre {nome(s)}: {FRICCAO.results[s].firstMove}
            </p>
          )}
        </Container>
      </section>

      {/* Próximo passo: aprofundar na dimensão principal (Funis §9) */}
      <section>
        <Container estreito className="py-14">
          {proximas && opcoes.length > 0 ? (
            // Mapa de Fricção §6: começar pela que tem Mapa aprofundado ou pela que pesa mais agora.
            <div>
              <h2 className="font-display text-2xl text-grafite">Por onde você quer começar?</h2>
              <p className="mt-2 text-grafite/75">Escolha a que parece pesar mais agora. A outra continua aqui.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {opcoes.map((o) => (
                  <Link
                    key={o.dim}
                    href={o.href}
                    className="group flex flex-col justify-between gap-6 rounded-[var(--radius-epic)] border border-grafite bg-papel-claro p-6 transition-colors hover:bg-grafite hover:text-papel"
                  >
                    <span className="font-display text-2xl">{nome(o.dim)}</span>
                    <span className="text-sm opacity-80">{o.comMapa ? `Fazer o Mapa de ${nome(o.dim)}` : `Conhecer ${nome(o.dim)}`} →</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : ctaPrincipal && (
            <div className="flex flex-col gap-6 rounded-[var(--radius-epic)] bg-grafite p-8 text-papel sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md font-display text-2xl leading-snug">
                {mapaVisivel(p)
                  ? `Agora descubra o que está acontecendo dentro de ${nome(p)}.`
                  : `O Mapa profundo de ${nome(p)} ainda está chegando. Enquanto isso, conheça a dimensão.`}
              </p>
              <PrimaryCTA href={ctaPrincipal.href} escuro>
                {ctaPrincipal.label}
              </PrimaryCTA>
            </div>
          )}
          {!proximas && dimensaoVisivel(s) && (
            <p className="mt-6">
              <TextCTA href={mapaVisivel(s) ? mapPath(s) : dimensionPath(s)}>Conhecer {nome(s)}</TextCTA>
            </p>
          )}
        </Container>
      </section>

      {/* Feedback qualitativo do resultado (seção 17 dos Mapas, Fricção §10) */}
      <section className="border-t border-linha">
        <Container estreito className="py-12">
          <FeedbackResultado token={token} />
        </Container>
      </section>

      <section>
        <Container estreito className="pb-16">
          <CapturaResultado
            token={token}
            mapType="friccao"
            jaConhecido={Boolean(perfil?.email)}
            titulo="Quer receber seu resultado por e-mail?"
            texto={
              mapaVisivel(p)
                ? "Enviamos o resultado e o primeiro movimento para você guardar."
                : `Enviamos o resultado e avisamos quando o Mapa de ${nome(p)} estiver disponível.`
            }
            botao="Receber meu resultado"
          />
        </Container>
      </section>

      <section className="grao bg-tinta text-papel">
        <Container estreito className="py-14">
          <p className="text-sm leading-relaxed text-papel/60">{FRICCAO.disclaimer}</p>
          <p className="mt-3 text-sm leading-relaxed text-papel/60">
            Seu mapa sugere onde vale olhar primeiro. Não é diagnóstico, laudo nem avaliação psicológica ou médica.
          </p>
          <p className="mt-6">
            <Link href="/" className="border-b border-latao pb-0.5 text-sm text-papel/85">
              Voltar para o início
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
