import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { getReport } from "./report-content";
import type { DrenoId } from "./drenos";

const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 56;
const CONTENT_W = A4.w - MARGIN * 2;

const NAVY = rgb(24 / 255, 40 / 255, 72 / 255);
const GOLD = rgb(192 / 255, 152 / 255, 64 / 255);
const BODY = rgb(0.2, 0.2, 0.25);
const MUTED = rgb(0.45, 0.45, 0.5);
const WHITE = rgb(1, 1, 1);

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function generateDrenoReportPdf(id: DrenoId): Promise<Uint8Array> {
  const report = getReport(id);
  const doc = await PDFDocument.create();
  doc.setTitle(`Relatório de Energia · ${report.titulo}`);
  doc.setAuthor("EPIC247 · Módulo Energia");

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let pageNum = 0;
  let page: PDFPage;
  let y = 0;

  function addContentPage() {
    page = doc.addPage([A4.w, A4.h]);
    pageNum += 1;
    // rodapé
    page.drawText("EPIC247 · Módulo Energia", {
      x: MARGIN,
      y: 32,
      size: 8,
      font,
      color: MUTED,
    });
    const num = String(pageNum);
    page.drawText(num, {
      x: A4.w - MARGIN - font.widthOfTextAtSize(num, 8),
      y: 32,
      size: 8,
      font,
      color: MUTED,
    });
    y = A4.h - MARGIN;
  }

  function ensure(space: number) {
    if (y - space < MARGIN + 24) addContentPage();
  }

  function heading(text: string) {
    ensure(40);
    y -= 26;
    page.drawText(text, { x: MARGIN, y, size: 16, font: bold, color: NAVY });
    y -= 6;
    page.drawRectangle({ x: MARGIN, y, width: 38, height: 2.5, color: GOLD });
    y -= 10;
  }

  function paragraph(text: string, size = 11, color = BODY) {
    const lines = wrap(text, font, size, CONTENT_W);
    const leading = size * 1.5;
    for (const line of lines) {
      ensure(leading);
      y -= leading;
      page.drawText(line, { x: MARGIN, y, size, font, color });
    }
    y -= 6;
  }

  function step(n: number, text: string) {
    const size = 11;
    const leading = size * 1.5;
    const indent = 26;
    const lines = wrap(text, font, size, CONTENT_W - indent);
    ensure(leading * lines.length + 6);
    // bolinha com número
    const top = y - leading;
    page.drawCircle({ x: MARGIN + 8, y: top + 3, size: 9, color: GOLD });
    page.drawText(String(n), {
      x: MARGIN + 8 - bold.widthOfTextAtSize(String(n), 9) / 2,
      y: top,
      size: 9,
      font: bold,
      color: NAVY,
    });
    lines.forEach((line, i) => {
      y -= leading;
      page.drawText(line, { x: MARGIN + indent, y, size, font, color: BODY });
      void i;
    });
    y -= 8;
  }

  // ── Capa ──────────────────────────────────────────────────────
  const cover = doc.addPage([A4.w, A4.h]);
  cover.drawRectangle({ x: 0, y: 0, width: A4.w, height: A4.h, color: NAVY });
  cover.drawText("EPIC247", { x: MARGIN, y: A4.h - 100, size: 30, font: bold, color: WHITE });
  cover.drawText("247", {
    x: MARGIN + bold.widthOfTextAtSize("EPIC", 30),
    y: A4.h - 100,
    size: 30,
    font: bold,
    color: GOLD,
  });
  cover.drawText("MÓDULO ENERGIA", {
    x: MARGIN,
    y: A4.h - 124,
    size: 11,
    font,
    color: rgb(0.7, 0.75, 0.85),
  });

  cover.drawRectangle({ x: MARGIN, y: A4.h / 2 + 60, width: 60, height: 3, color: GOLD });
  cover.drawText("Relatório de Energia", {
    x: MARGIN,
    y: A4.h / 2 + 24,
    size: 14,
    font,
    color: rgb(0.8, 0.84, 0.92),
  });
  // nome do dreno (pode quebrar)
  const titleLines = wrap(report.titulo, bold, 40, CONTENT_W);
  let ty = A4.h / 2 - 20;
  for (const line of titleLines) {
    cover.drawText(line, { x: MARGIN, y: ty, size: 40, font: bold, color: GOLD });
    ty -= 46;
  }
  cover.drawText("Seu Dreno Dominante", {
    x: MARGIN,
    y: ty - 6,
    size: 13,
    font,
    color: rgb(0.7, 0.75, 0.85),
  });

  cover.drawText("Gerado automaticamente após o seu diagnóstico dos 5 Drenos.", {
    x: MARGIN,
    y: 60,
    size: 9,
    font,
    color: rgb(0.6, 0.65, 0.75),
  });

  // ── Conteúdo ──────────────────────────────────────────────────
  addContentPage();
  cover && void cover;

  for (const secao of report.secoes) {
    heading(secao.titulo);
    for (const p of secao.paragrafos) paragraph(p);

    // injeta os passos logo após a seção "Seu plano de ação"
    if (secao.titulo.toLowerCase().includes("plano de ação")) {
      y -= 4;
      report.passos.forEach((p, i) => step(i + 1, p));
    }
  }

  return doc.save();
}
