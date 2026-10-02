import Link from "next/link";
import type { ReactNode } from "react";
import IdeiasLista from "@/components/epic/IdeiasLista";
import MarcaMao from "@/components/epic/MarcaMao";
import { CapasKit } from "@/components/epic/ObjetosEditoriais";
import PosicaoDimensao from "@/components/epic/PosicaoDimensao";
import { Container, PrimaryCTA, SectionTitle, TextCTA } from "@/components/epic/ui";
import { fraseCaso, type BlocoCopy, type CardCopy } from "@/lib/epic/content/copy-final";
import { DIMENSION_IDS, DIMENSIONS, type DimensionId } from "@/lib/epic/dimensions";
import { formatPrice, type Product } from "@/lib/epic/products";
import type { ItemConteudo } from "@/lib/epic/server/conteudo";
import { dimensaoHref } from "@/lib/epic/site";

// Template canônico da página de dimensão (Copy Final §10-§19, Blueprint §8).
// Cada bloco do documento vira uma seção, na ordem do documento. O layout
// muda por tipo de bloco; o texto é sempre o do documento.

export interface ContextoDimensao {
  dim: DimensionId;
  mapaHref: string;
  plano: Product | null;
  kit: Product | null;
  protocolo: Product | null;
  ideias: ItemConteudo[];
  repertorio: ItemConteudo[];
  filmeReserva: string;
}

const atraso = (ms: number) => ({ "--atraso": `${ms}ms` }) as React.CSSProperties;
const tiraPontoVirgula = (s: string) => s.replace(/;$/, "");

/** Para onde vai cada CTA do documento. Pelo texto do botão, depois pelo bloco. */
export function hrefDoCta(rotulo: string, bloco: BlocoCopy["tipo"], ctx: ContextoDimensao): string {
  const r = rotulo.toLowerCase();
  if (/^entend/.test(r)) return "#entenda";
  if (r.includes("protocolo")) return "/protocolo";
  if (r.includes("plano")) return `/plano/${ctx.dim}`;
  if (r.includes("kit")) return `/kit/${ctx.dim}`;
  if (r.includes("repertório")) return "/ideias/repertorio";
  if (r.includes("conteúdo")) return `/ideias?dimensao=${ctx.dim}`;
  if (r.includes("dimens")) return "/dimensoes";
  if (r.includes("explorar o epic247")) return "/";
  const outra = DIMENSION_IDS.find((id) => r === `explorar ${DIMENSIONS[id].name.toLowerCase()}`);
  if (outra) return dimensaoHref(outra) ?? "/dimensoes";
  if (r.includes("mapa") || r.includes("vazando") || bloco === "hero" || bloco === "fechamento") return ctx.mapaHref;
  return ctx.mapaHref;
}

/** Linhas do documento: "• item" em sequência vira lista; o resto, parágrafo. */
function Linhas({ linhas, className = "", lista = "" }: { linhas?: string[]; className?: string; lista?: string }) {
  if (!linhas?.length) return null;
  const grupos: (string | string[])[] = [];
  for (const l of linhas) {
    if (l.startsWith("•")) {
      const ult = grupos[grupos.length - 1];
      const item = tiraPontoVirgula(l.replace(/^•\s*/, ""));
      if (Array.isArray(ult)) ult.push(item);
      else grupos.push([item]);
    } else grupos.push(l);
  }
  return (
    <div className={`space-y-3 ${className}`}>
      {grupos.map((g, i) =>
        Array.isArray(g) ? (
          <ul key={i} className={`space-y-1.5 pl-1 ${lista}`}>
            {g.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-latao" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>{g}</p>
        )
      )}
    </div>
  );
}

function Eyebrow({ b, escuro = false }: { b: BlocoCopy; escuro?: boolean }) {
  const e = b.eyebrow?.[0];
  if (!e) return null;
  return (
    <p className={`revelar mb-4 font-display text-lg italic ${escuro ? "text-latao" : "text-latao-escuro"}`}>{fraseCaso(e)}</p>
  );
}

function Ctas({ b, ctx, escuro = false }: { b: BlocoCopy; ctx: ContextoDimensao; escuro?: boolean }) {
  const p = b.cta?.[0];
  const s = b.cta2?.[0];
  if (!p && !s) return null;
  return (
    <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
      {p && (
        <PrimaryCTA href={hrefDoCta(p, b.tipo, ctx)} escuro={escuro}>
          {p}
        </PrimaryCTA>
      )}
      {s && (
        <TextCTA href={hrefDoCta(s, b.tipo, ctx)} escuro={escuro}>
          {s}
        </TextCTA>
      )}
    </div>
  );
}

function Micro({ linhas, escuro = false }: { linhas?: string[]; escuro?: boolean }) {
  if (!linhas?.length) return null;
  return <p className={`mt-4 text-sm ${escuro ? "text-papel/60" : "text-mineral-escuro"}`}>{linhas.join(" ")}</p>;
}

function Nota({ linhas, escuro = false }: { linhas?: string[]; escuro?: boolean }) {
  if (!linhas?.length) return null;
  return (
    <p className={`mt-8 max-w-2xl border-l pl-4 text-[13px] leading-relaxed ${escuro ? "border-papel/25 text-papel/55" : "border-linha text-mineral-escuro"}`}>
      {linhas.join(" ")}
    </p>
  );
}

function Fechamento({ linhas, escuro = false }: { linhas?: string[]; escuro?: boolean }) {
  if (!linhas?.length) return null;
  return (
    <div className={`revelar mt-12 max-w-2xl font-display text-[1.3rem] italic leading-snug ${escuro ? "text-papel/85" : "text-grafite/85"}`}>
      {linhas.map((l) => (
        <p key={l}>{l}</p>
      ))}
    </div>
  );
}

function Titulo({ b, numero, escuro = false, className = "" }: { b: BlocoCopy; numero?: string; escuro?: boolean; className?: string }) {
  if (!b.titulo?.length) return null;
  return (
    <SectionTitle numero={numero} escuro={escuro} className={`max-w-3xl ${className}`}>
      {b.titulo.join(" ")}
    </SectionTitle>
  );
}

function Preco({ produto, b }: { produto: Product | null; b: BlocoCopy }) {
  const valor = produto ? formatPrice(produto.price_list) : b.preco?.[0];
  if (!valor) return null;
  return <p className="font-display text-4xl text-grafite">{valor}</p>;
}

/** As quatro leituras do resultado como escala: do mais estável ao principal ponto. */
function EscalaLeituras({ itens }: { itens: string[] }) {
  return (
    <ol className="revelar-lista mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
      {itens.map((i, k) => (
        <li key={i}>
          <span aria-hidden className="block h-1.5 rounded-full bg-linha">
            <span className="block h-1.5 rounded-full bg-latao" style={{ width: `${25 * (k + 1)}%`, opacity: 0.35 + k * 0.2 }} />
          </span>
          <span className="mt-3 block text-[15px] leading-snug text-grafite/85">{i.charAt(0).toUpperCase() + i.slice(1)}</span>
        </li>
      ))}
    </ol>
  );
}

function ListasTituladas({ b, colunas = false }: { b: BlocoCopy; colunas?: boolean }) {
  if (!b.listas?.length) return null;
  const leituras = b.listas.find((l) => l.titulo === "Leituras");
  const outras = b.listas.filter((l) => l !== leituras);
  return (
    <>
    {leituras && (
      <div className="mt-10">
        <p className="font-mono text-xs text-latao-escuro">{leituras.titulo}</p>
        <EscalaLeituras itens={leituras.itens.map(tiraPontoVirgula)} />
      </div>
    )}
    <div className={`mt-10 grid gap-10 ${colunas && outras.length > 1 ? "md:grid-cols-2" : ""}`}>
      {outras.map((l) => (
        <div key={l.titulo}>
          <p className="font-mono text-xs text-latao-escuro">{l.titulo}</p>
          <ul className="revelar-lista mt-4 divide-y divide-linha border-y border-linha">
            {l.itens.map((i) => (
              <li key={i} className="py-2.5 text-[15px] text-grafite/85">
                {tiraPontoVirgula(i)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    </>
  );
}

function CardEixo({ c, i }: { c: CardCopy; i: number }) {
  return (
    <li className="flex flex-col border-t border-grafite/80 pt-5">
      <span className="font-mono text-xs text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
      <span className="mt-2 font-display text-[1.45rem] leading-tight text-grafite">{c.titulo}</span>
      {c.pergunta && <span className="mt-3 font-display text-[1.08rem] italic leading-snug text-grafite/85">{c.pergunta}</span>}
      {c.texto && <span className="mt-3 text-[15px] leading-relaxed text-mineral-escuro">{c.texto}</span>}
    </li>
  );
}

function CardPerfil({ c }: { c: CardCopy }) {
  return (
    <li className="flex flex-col rounded-[var(--radius-epic)] border border-linha bg-papel p-6 sm:p-7">
      <span className="font-display text-xl text-grafite">{c.titulo}</span>
      {c.perfil && <span className="mt-1 font-display text-[15px] italic text-latao-escuro">{c.perfil}</span>}
      {c.reconhecimento && <span className="mt-4 text-[15px] leading-relaxed text-grafite/80">{c.reconhecimento}</span>}
      {c.primeiro && (
        <span className="mt-5 border-t border-linha pt-4 text-[15px] leading-relaxed text-grafite">
          <span className="mb-1 block font-mono text-[11px] text-mineral-escuro">Primeiro movimento</span>
          {c.primeiro}
        </span>
      )}
    </li>
  );
}

/** "Energia → Mentalidade → ..." com a dimensão atual marcada. */
function Sequencia({ texto, atual }: { texto: string; atual: DimensionId }) {
  const nomes = texto.split("→").map((s) => s.trim());
  return (
    <ol className="revelar-lista mt-10 flex flex-wrap gap-x-3 gap-y-2 font-display text-lg sm:text-xl">
      {nomes.map((n, i) => {
        const esta = n === DIMENSIONS[atual].name;
        return (
          <li key={n} className="flex items-center gap-3">
            <span className={esta ? "text-grafite" : "text-mineral-escuro"}>{esta ? <MarcaMao rolagem>{n}</MarcaMao> : n}</span>
            {i < nomes.length - 1 && <span aria-hidden className="text-latao">→</span>}
          </li>
        );
      })}
    </ol>
  );
}

function Secao({ fundo, children, id }: { fundo: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className={`scroll-mt-24 ${fundo}`}>
      <Container className="py-20 sm:py-24">{children}</Container>
    </section>
  );
}

export function BlocoDimensao({ b, ctx, numero }: { b: BlocoCopy; ctx: ContextoDimensao; numero?: string }) {
  const d = DIMENSIONS[ctx.dim];
  switch (b.tipo) {
    case "hero":
      return (
        <section className="grao border-b border-linha">
          <Container className="grid gap-12 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20">
            <div>
              <p className="entrada-suave font-mono text-sm text-latao-escuro">
                Dimensão {String(d.order).padStart(2, "0")} de 10
              </p>
              <h1 className="entrada mt-4 font-display text-[3.2rem] font-normal leading-none text-grafite sm:text-[5.5rem]">
                {d.name}
              </h1>
              <p className="entrada mt-5 font-display text-[1.2rem] italic text-grafite/70 sm:text-[1.35rem]" style={atraso(140)}>
                <MarcaMao atraso={800}>{d.manifestoLine}</MarcaMao>
              </p>
              {b.titulo && (
                <p className="entrada mt-8 max-w-3xl font-display text-[1.6rem] leading-[1.25] text-grafite sm:text-[2.2rem]" style={atraso(260)}>
                  {b.titulo.join(" ")}
                </p>
              )}
              <div className="entrada mt-6 max-w-2xl space-y-2 text-lg text-grafite/75" style={atraso(380)}>
                {b.sub?.map((s) => <p key={s}>{s}</p>)}
              </div>
              {b.apoio && (
                <div className="mt-5 max-w-2xl font-display text-[1.15rem] italic text-grafite/85">
                  {b.apoio.map((s) => <p key={s}>{s}</p>)}
                </div>
              )}
              <Ctas b={b} ctx={ctx} />
              <Micro linhas={b.micro} />
            </div>
            <PosicaoDimensao atual={ctx.dim} />
          </Container>
        </section>
      );

    case "reconhecimento":
      return (
        <Secao fundo="bg-papel-escuro">
          <Eyebrow b={b} />
          <Titulo b={b} numero={numero} />
          <Linhas linhas={b.texto} className="revelar mt-8 max-w-2xl font-display text-[1.2rem] leading-snug text-grafite/85" />
          {b.cenas && (
            <ul className="revelar-lista mt-12 grid gap-x-14 gap-y-8 md:grid-cols-2">
              {b.cenas.map((c) => (
                <li key={c} className="border-l border-latao pl-5 font-display text-[1.22rem] leading-snug text-grafite/90">
                  {c}
                </li>
              ))}
            </ul>
          )}
          <Fechamento linhas={b.fechamento} />
        </Secao>
      );

    case "significado":
    case "livre":
      return (
        <Secao fundo={b.tipo === "livre" ? "border-y border-linha bg-papel-claro" : ""} id={b.tipo === "significado" ? "entenda" : undefined}>
          <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
            <div>
              <Eyebrow b={b} />
              <Titulo b={b} numero={numero} />
              <Linhas linhas={b.texto} className="revelar mt-7 max-w-xl text-lg leading-relaxed text-grafite/80" />
            </div>
            {b.destaque && (
              <blockquote className="revelar self-center traco-lateral pl-6 font-display text-[1.45rem] leading-snug text-grafite sm:text-[1.7rem]">
                {b.destaque.map((l) => <p key={l}>{l}</p>)}
              </blockquote>
            )}
          </div>
          <Fechamento linhas={b.fechamento} />
        </Secao>
      );

    case "pontos":
      return (
        <Secao fundo="border-y border-linha bg-papel-claro">
          <Titulo b={b} numero={numero} />
          <Linhas linhas={b.sub} className="revelar mt-5 max-w-2xl text-lg text-grafite/75" />
          <ol className="revelar-lista mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-6">
            {b.cards?.map((c, i) => <CardEixo key={c.titulo} c={c} i={i} />)}
          </ol>
          <Fechamento linhas={b.fechamento} />
        </Secao>
      );

    case "mapa":
      return (
        <section className="grao bg-tinta text-papel">
          <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <div>
              <Eyebrow b={b} escuro />
              {b.titulo && <p className="font-display text-[2rem] leading-tight sm:text-[2.7rem]">{b.titulo.join(" ")}</p>}
              <Ctas b={b} ctx={ctx} escuro />
              <Micro linhas={b.micro} escuro />
            </div>
            <div>
              <Linhas linhas={b.texto} className="text-[17px] leading-relaxed text-papel/80" />
              <Nota linhas={b.nota} escuro />
            </div>
          </Container>
        </section>
      );

    case "resultado":
      return (
        <Secao fundo="">
          <Eyebrow b={b} />
          <Titulo b={b} numero={numero} />
          <Linhas linhas={b.texto} className="revelar mt-7 max-w-2xl text-lg leading-relaxed text-grafite/80" />
          {b.exemplo && (
            <p className="revelar mt-10 max-w-2xl font-display text-[1.5rem] italic leading-snug text-grafite">{b.exemplo.join(" ")}</p>
          )}
          <Linhas linhas={b.apoio} className="mt-4 max-w-2xl text-[15px] text-mineral-escuro" />
          <ListasTituladas b={b} colunas />
          <Nota linhas={b.nota} />
          <Ctas b={b} ctx={ctx} />
        </Secao>
      );

    case "movimento":
      return (
        <Secao fundo="bg-papel-escuro">
          <Eyebrow b={b} />
          <Titulo b={b} numero={numero} />
          <Linhas linhas={b.texto} className="revelar mt-7 max-w-2xl text-lg leading-relaxed text-grafite/80" />
          {b.cards && (
            <ul className="revelar-lista mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {b.cards.map((c) => <CardPerfil key={c.titulo} c={c} />)}
            </ul>
          )}
          <Fechamento linhas={b.fechamento} />
        </Secao>
      );

    case "plano":
    case "kit": {
      const produto = b.tipo === "plano" ? ctx.plano : ctx.kit;
      return (
        <Secao fundo={b.tipo === "plano" ? "border-y border-linha bg-papel-claro" : ""}>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <div>
              <Eyebrow b={b} />
              <Titulo b={b} numero={numero} />
              <Linhas linhas={b.texto} className="revelar mt-7 max-w-xl text-lg leading-relaxed text-grafite/80" />
              {b.destaque && (
                <div className="mt-6 max-w-xl font-display text-[1.1rem] italic text-grafite/85">
                  {b.destaque.map((l) => <p key={l}>{l}</p>)}
                </div>
              )}
              {b.tipo === "kit" && (
                <div className="mt-12 hidden sm:block">
                  <CapasKit dimensao={ctx.dim} />
                </div>
              )}
            </div>
            <div>
              <ListasTituladas b={b} />
              <div className="mt-10 flex flex-col gap-6">
                <Preco produto={produto} b={b} />
                {b.cta?.[0] && <PrimaryCTA href={hrefDoCta(b.cta[0], b.tipo, ctx)}>{b.cta[0]}</PrimaryCTA>}
              </div>
              <Micro linhas={b.micro} />
            </div>
          </div>
        </Secao>
      );
    }

    case "editorial":
      return (
        <Secao fundo="" id="ideias">
          <Eyebrow b={b} />
          <Titulo b={b} numero={numero} />
          <Linhas linhas={b.texto} className="revelar mt-7 max-w-2xl text-lg leading-relaxed text-grafite/80" />
          {ctx.ideias.length > 0 ? (
            <div className="mt-12">
              <IdeiasLista itens={ctx.ideias} />
            </div>
          ) : (
            <ListasTituladas b={b} colunas />
          )}
          <Ctas b={b} ctx={ctx} />
        </Secao>
      );

    case "repertorio": {
      // Em Energia o título do bloco é o próprio filme ("Livre").
      const tituloEhFilme = !b.filme && (b.titulo?.[0]?.length ?? 99) < 40;
      const filme = b.filme?.[0] ?? (tituloEhFilme ? b.titulo![0] : ctx.filmeReserva);
      return (
        <Secao fundo="bg-papel-escuro">
          <Eyebrow b={b} />
          {!tituloEhFilme && <Titulo b={b} numero={numero} />}
          <div className="revelar mt-10 grid gap-8 md:grid-cols-[auto_1fr] md:items-start md:gap-14">
            <div className="traco-lateral pl-6">
              <p className="font-mono text-xs text-latao-escuro">No cinema</p>
              <p className="mt-2 font-display text-[2.2rem] leading-tight text-grafite">{filme}</p>
            </div>
            <Linhas linhas={b.texto} className="max-w-xl text-lg leading-relaxed text-grafite/80" />
          </div>
          {ctx.repertorio.length > 0 && (
            <div className="mt-12">
              <IdeiasLista itens={ctx.repertorio} />
            </div>
          )}
          <Ctas b={b} ctx={ctx} />
        </Secao>
      );
    }

    case "conexoes":
      return (
        <Secao fundo="">
          <Eyebrow b={b} />
          <Titulo b={b} numero={numero} />
          <Linhas linhas={b.texto} className="revelar mt-7 max-w-2xl text-lg leading-relaxed text-grafite/80" />
          {b.conexoes && (
            <ul className="revelar-lista mt-12 divide-y divide-linha border-y border-linha">
              {b.conexoes.map((c) => {
                const alvo =
                  DIMENSION_IDS.find((id) => id !== ctx.dim && c.titulo.split("+").map((s) => s.trim()).includes(DIMENSIONS[id].name)) ?? null;
                const href = alvo ? dimensaoHref(alvo) : null;
                const conteudo = (
                  <>
                    <span className="font-display text-xl text-grafite group-hover:underline group-hover:decoration-latao group-hover:underline-offset-4">
                      {c.titulo}
                    </span>
                    <span className="text-[15px] leading-relaxed text-mineral-escuro">{c.texto}</span>
                  </>
                );
                return (
                  <li key={c.titulo}>
                    {href ? (
                      <Link href={href} className="group grid gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-8">
                        {conteudo}
                      </Link>
                    ) : (
                      <div className="grid gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-8">{conteudo}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <Ctas b={b} ctx={ctx} />
        </Secao>
      );

    case "protocolo":
      return (
        <Secao fundo="border-t border-linha">
          <Eyebrow b={b} />
          <Titulo b={b} numero={numero} />
          <Linhas linhas={b.texto} className="revelar mt-7 max-w-2xl text-lg leading-relaxed text-grafite/80" />
          {b.destaque?.[0]?.includes("→") && <Sequencia texto={b.destaque[0]} atual={ctx.dim} />}
          {ctx.protocolo && <p className="mt-10 font-display text-3xl text-grafite">{formatPrice(ctx.protocolo.price_list)}</p>}
          <Ctas b={b} ctx={ctx} />
        </Secao>
      );

    case "fechamento":
      return (
        <section className="grao bg-tinta text-papel">
          <Container estreito className="py-24 text-center">
            {b.titulo && <p className="font-display text-[1.9rem] leading-snug sm:text-[2.5rem]">{b.titulo.join(" ")}</p>}
            {b.sub && <p className="mx-auto mt-5 max-w-xl text-lg text-papel/75">{b.sub.join(" ")}</p>}
            <div className="flex justify-center">
              <Ctas b={b} ctx={ctx} escuro />
            </div>
            <Micro linhas={b.micro} escuro />
            {b.marca && <p className="mt-12 font-display italic text-latao">{b.marca.join(" ")}</p>}
          </Container>
        </section>
      );

    default:
      return null;
  }
}
