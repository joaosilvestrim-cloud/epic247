// Leitura de CSV exportado de planilha ou plataforma (Meta, Instagram,
// extrato de recebíveis). Sem dependência: separador ; , ou tab, aspas,
// BOM, número em formato brasileiro ou americano.

/** "Valor usado (BRL)" → "valor_usado_brl". */
export function chaveColuna(h: string): string {
  return h
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function separador(primeiraLinha: string): string {
  let fora = true;
  const n: Record<string, number> = { ";": 0, ",": 0, "\t": 0 };
  for (const c of primeiraLinha) {
    if (c === '"') fora = !fora;
    else if (fora && c in n) n[c]++;
  }
  const [melhor, qtd] = Object.entries(n).sort((a, b) => b[1] - a[1])[0];
  return qtd > 0 ? melhor : ",";
}

/** Linhas como objetos com a chave normalizada do cabeçalho. Linha vazia é pulada. */
export function lerCsv(texto: string): { colunas: string[]; linhas: Record<string, string>[] } {
  const t = texto.replace(/^﻿/, "");
  const fimPrimeira = t.search(/\r?\n/);
  const sep = separador(fimPrimeira === -1 ? t : t.slice(0, fimPrimeira));
  const registros: string[][] = [];
  let campo = "";
  let reg: string[] = [];
  let aspas = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (aspas) {
      if (c === '"' && t[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) { reg.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      reg.push(campo); registros.push(reg); reg = []; campo = "";
    } else campo += c;
  }
  if (campo !== "" || reg.length) { reg.push(campo); registros.push(reg); }
  const uteis = registros.filter((r) => r.some((v) => v.trim() !== ""));
  if (!uteis.length) return { colunas: [], linhas: [] };
  const colunas = uteis[0].map(chaveColuna);
  const linhas = uteis.slice(1).map((r) => {
    const o: Record<string, string> = {};
    colunas.forEach((c, i) => {
      if (c && !(c in o)) o[c] = (r[i] ?? "").trim();
    });
    return o;
  });
  return { colunas, linhas };
}

/**
 * Número de planilha: "1.234,56", "1,234.56", "1234.56", "R$ 12,50", "35%".
 * Só vírgula = decimal brasileiro. Só ponto em grupos de 3 ("12.345") = milhar.
 */
export function numero(v: string | null | undefined): number | null {
  if (v == null) return null;
  let s = String(v).replace(/R\$|%|\s/g, "").trim();
  if (!s || s === "-" || s === "--") return null;
  const neg = /^-/.test(s) || /^\(.*\)$/.test(s);
  s = s.replace(/^[-(]|\)$/g, "");
  const ponto = s.lastIndexOf(".");
  const virgula = s.lastIndexOf(",");
  if (ponto >= 0 && virgula >= 0) {
    s = ponto > virgula ? s.replace(/,/g, "") : s.replace(/\./g, "").replace(",", ".");
  } else if (virgula >= 0) {
    s = /^\d{1,3}(,\d{3}){2,}$/.test(s) ? s.replace(/,/g, "") : s.replace(/\./g, "").replace(",", ".");
  } else if (ponto >= 0 && /^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return neg ? -n : n;
}

export function inteiro(v: string | null | undefined): number | null {
  const n = numero(v);
  return n == null ? null : Math.round(n);
}

/** "2026-10-01", "2026-10-01T10:00", "01/10/2026" → "2026-10-01". */
export function data(v: string | null | undefined): string | null {
  if (!v) return null;
  const s = v.trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return valida(m[1], m[2], m[3]);
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return valida(m[3], m[2].padStart(2, "0"), m[1].padStart(2, "0"));
  return null;
}

function valida(a: string, m: string, d: string): string | null {
  const iso = `${a}-${m}-${d}`;
  const dt = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(dt.getTime()) || dt.toISOString().slice(0, 10) !== iso ? null : iso;
}

/** Data e hora (horário de Brasília quando não vem fuso) → ISO. Só data → meia-noite. */
export function dataHora(v: string | null | undefined): string | null {
  if (!v) return null;
  const s = v.trim();
  const dia = data(s);
  if (!dia) return null;
  const h = s.match(/[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/);
  const fuso = s.match(/(Z|[+-]\d{2}:?\d{2})$/);
  if (fuso && /^\d{4}-/.test(s)) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  const hh = h ? h[1].padStart(2, "0") : "00";
  const mm = h ? h[2] : "00";
  const ss = h?.[3] ?? "00";
  return new Date(`${dia}T${hh}:${mm}:${ss}-03:00`).toISOString();
}
