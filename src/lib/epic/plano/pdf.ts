// PDF do Plano EPIC 7 Dias (CR-01A, decisão D7). Gerado no servidor a partir
// do Plano persistido: a fonte do produto continua sendo o Plano no Meu EPIC,
// o PDF é só a representação dele. Mesma ordem de blocos da página.

import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import type { TipoBloco } from "./estrutura";
import type { Plano } from "./gerador";

const A4 = { w: 595.28, h: 841.89 };
const M = { x: 56, topo: 64, base: 72 };
const LARG = A4.w - M.x * 2;
const COR = {
  grafite: rgb(0.169, 0.165, 0.157),
  apoio: rgb(0.4, 0.384, 0.365),
  latao: rgb(0.549, 0.455, 0.271),
  linha: rgb(0.847, 0.8, 0.733),
};

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

/** As fontes padrão do PDF só conhecem o alfabeto latino: o resto vira equivalente simples. */
function limpar(t: string, fonte: PDFFont): string {
  const troca: Record<string, string> = { "→": "->", "←": "<-", "≥": ">=", "≤": "<=", " ": " ", " ": " ", "​": "" };
  let out = "";
  for (const ch of t.replace(/\r/g, "")) {
    const c = troca[ch] ?? ch;
    try {
      fonte.encodeText(c);
      out += c;
    } catch {
      out += "";
    }
  }
  return out;
}

function quebrar(texto: string, fonte: PDFFont, tam: number, largura: number): string[] {
  const linhas: string[] = [];
  for (const par of texto.split("\n")) {
    let atual = "";
    for (const palavra of par.split(/\s+/).filter(Boolean)) {
      const tentativa = atual ? `${atual} ${palavra}` : palavra;
      if (fonte.widthOfTextAtSize(tentativa, tam) <= largura) atual = tentativa;
      else {
        if (atual) linhas.push(atual);
        atual = palavra;
      }
    }
    linhas.push(atual);
  }
  return linhas;
}

export async function planoEmPdf(
  p: Plano,
  opts: { dimensaoNome: string; recomendado?: { titulo: string; url: string } | null } = { dimensaoNome: "" }
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Plano EPIC ${opts.dimensaoNome} 7 Dias`);
  doc.setAuthor("EPIC247");
  doc.setCreator("EPIC247");
  const corpo = await doc.embedFont(StandardFonts.Helvetica);
  const negrito = await doc.embedFont(StandardFonts.HelveticaBold);
  const serif = await doc.embedFont(StandardFonts.TimesRoman);

  let pag: PDFPage = doc.addPage([A4.w, A4.h]);
  let y = A4.h - M.topo;
  const nova = () => {
    pag = doc.addPage([A4.w, A4.h]);
    y = A4.h - M.topo;
  };
  const espaco = (h: number) => {
    if (y - h < M.base) nova();
  };
  const texto = (t: string, o: { fonte?: PDFFont; tam?: number; cor?: ReturnType<typeof rgb>; recuo?: number; entre?: number } = {}) => {
    const fonte = o.fonte ?? corpo;
    const tam = o.tam ?? 11;
    const alt = tam * (o.entre ?? 1.45);
    const recuo = o.recuo ?? 0;
    for (const l of quebrar(limpar(t, fonte), fonte, tam, LARG - recuo)) {
      espaco(alt);
      pag.drawText(l, { x: M.x + recuo, y: y - tam, size: tam, font: fonte, color: o.cor ?? COR.grafite });
      y -= alt;
    }
  };
  const titulo = (t: string) => {
    espaco(48);
    y -= 14;
    pag.drawLine({ start: { x: M.x, y }, end: { x: M.x + 28, y }, thickness: 1, color: COR.latao });
    y -= 8;
    texto(t, { fonte: negrito, tam: 10, cor: COR.latao });
    y -= 4;
  };
  const campo = () => {
    for (let i = 0; i < 2; i++) {
      espaco(26);
      y -= 24;
      pag.drawLine({ start: { x: M.x, y }, end: { x: M.x + LARG, y }, thickness: 0.6, color: COR.linha });
    }
    y -= 6;
  };

  // Capa curta: marca, personalização, título e padrão.
  texto("EPIC247", { fonte: negrito, tam: 12 });
  y -= 18;
  texto(p.personalizacao, { tam: 10, cor: COR.latao });
  y -= 4;
  texto(p.titulo, { fonte: serif, tam: 26, entre: 1.2 });
  y -= 6;
  texto(
    `Seu padrão predominante neste momento: ${p.padrao.nome}${p.padrao.nomeEditorial ? ` (${p.padrao.nomeEditorial})` : ""}. Também apareceu: ${p.secundario.nome}.`,
    { tam: 12, cor: COR.apoio }
  );
  y -= 8;

  for (const b of p.estrutura ?? ESTRUTURA_ANTIGA) {
    switch (b.tipo) {
      case "foco":
        titulo(b.titulo);
        texto(p.foco, { fonte: serif, tam: 16, entre: 1.3 });
        break;
      case "observar":
        titulo(b.titulo);
        texto(p.padraoAObservar, { fonte: serif, tam: 14, entre: 1.35 });
        y -= 4;
        texto("O sinal mais forte nas suas respostas:", { cor: COR.apoio });
        texto(p.sinalMaisForte);
        break;
      case "reduzir":
        titulo(b.titulo);
        if (p.reduzir) texto(p.reduzir, { tam: 12 });
        else campo();
        break;
      case "movimentos":
        titulo(b.titulo);
        p.movimentos.forEach((m, i) => {
          texto(`${String(i + 1).padStart(2, "0")}   ${m}`, { tam: 12 });
          y -= 2;
        });
        break;
      case "pratica":
        titulo(b.titulo);
        texto(p.pratica, { tam: 12 });
        if (!p.estrutura && p.gatilho) texto(`Gatilho: ${p.gatilho}`, { cor: COR.apoio });
        if (!p.estrutura && p.retomada) texto(`Regra de retomada: ${p.retomada}`, { cor: COR.apoio });
        break;
      case "gatilho":
        titulo(b.titulo);
        if (p.gatilho) texto(p.gatilho, { tam: 12 });
        else campo();
        break;
      case "retomada":
        titulo(b.titulo);
        if (p.retomada) texto(p.retomada, { tam: 12 });
        else campo();
        break;
      case "pergunta":
        titulo("Os 7 dias");
        for (const d of p.dias) {
          espaco(40);
          texto(`Dia ${d.dia}. ${d.titulo}`, { fonte: negrito, tam: 11 });
          texto(d.acao, { recuo: 0 });
          y -= 6;
        }
        titulo(b.titulo);
        texto(p.pergunta, { fonte: serif, tam: 14, entre: 1.35 });
        break;
      case "conteudo":
        if (opts.recomendado) {
          titulo(b.titulo);
          texto(opts.recomendado.titulo, { tam: 12 });
          texto(opts.recomendado.url, { tam: 9, cor: COR.apoio });
        }
        break;
      case "revisao":
        titulo(b.titulo);
        for (const r of p.revisaoDia7) {
          texto(`- ${r}`);
          campo();
        }
        break;
      case "proximo":
        titulo(b.titulo);
        texto(p.proximoPasso, { tam: 12 });
        break;
      default:
        titulo(b.titulo);
        campo();
    }
  }

  y -= 16;
  texto(
    "Plano gerado automaticamente a partir das suas respostas, em caráter educativo. Não é análise individual nem substitui avaliação ou acompanhamento profissional.",
    { tam: 9, cor: COR.apoio }
  );

  const paginas = doc.getPages();
  paginas.forEach((pg, i) => {
    const rodape = limpar(`EPIC247 · Plano EPIC ${opts.dimensaoNome} 7 Dias · página ${i + 1} de ${paginas.length}`, corpo);
    pg.drawText(rodape, { x: M.x, y: 36, size: 8, font: corpo, color: COR.apoio });
  });
  return doc.save();
}
