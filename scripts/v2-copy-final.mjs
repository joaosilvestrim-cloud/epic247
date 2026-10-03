// Converte as 10 páginas de dimensão da "Copy Final do Site" em dados.
// Uso: node scripts/v2-copy-final.mjs [docs/v2/fontes/copy-final.txt]
// Entrada: o texto do documento exportado (uma linha por parágrafo).
// Saída: src/lib/epic/content/copy-final/dimensoes.json
//
// O documento é a fonte de verdade do texto público (Blueprint v1.2 §54.1).
// Este script só reorganiza: não reescreve nada. Rótulos internos
// (objetivo, notas de implementação, uso editorial) ficam de fora.
import fs from "node:fs";
import path from "node:path";

import crypto from "node:crypto";

// Fonte: o texto exportado do Google Docs congelado (Editorial Freeze 02/10/2026).
const entrada = process.argv[2] ?? path.join("docs", "v2", "fontes", "copy-final.txt");
const linhas = fs
  .readFileSync(entrada, "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean);

const IDS = {
  ENERGIA: "energia",
  MENTALIDADE: "mentalidade",
  AUTOCONHECIMENTO: "autoconhecimento",
  FELICIDADE: "felicidade",
  PLANEJAMENTO: "planejamento",
  CORAGEM: "coragem",
  "AÇÃO": "acao",
  "INTELIGÊNCIA": "inteligencia",
  "EXCELÊNCIA": "excelencia",
  AMOR: "amor",
};
const NOMES_DIMENSAO = ["Energia", "Mentalidade", "Autoconhecimento", "Felicidade", "Planejamento", "Coragem", "Ação", "Inteligência", "Excelência", "Amor"];

// Rótulo do documento → campo do bloco.
const CAMPOS = {
  Eyebrow: "eyebrow",
  Headline: "titulo",
  "Título": "titulo",
  Subheadline: "sub",
  Texto: "texto",
  "Texto de abertura": "texto",
  "Texto de apoio": "apoio",
  "Texto complementar": "texto",
  "Função": "texto",
  "Cenas de reconhecimento": "cenas",
  Destaque: "destaque",
  Fechamento: "fechamento",
  "Fechamento de marca": "marca",
  "CTA primário": "cta",
  CTA: "cta",
  "CTA secundário": "cta2",
  "Preço": "preco",
  Microcopy: "micro",
  "Microcopy final": "micro",
  "Nota de responsabilidade": "nota",
  Nota: "nota",
  "Alerta de segurança": "nota",
  Inclui: "lista",
  "Pode incluir": "lista",
  "Pode incluir exercícios sobre": "lista",
  "Pode incluir exercícios e práticas sobre": "lista",
  "Temas centrais": "lista",
  "Perfis editoriais possíveis": "lista",
  "Rótulos de leitura": "lista",
  "Leituras públicas": "lista",
  "Os rótulos públicos devem ser": "lista",
  "Trilhas editoriais sugeridas": "lista",
  "Categorias sugeridas": "lista",
  Componentes: "lista",
  "Conexões": "conexoes",
  "Conexões sugeridas": "conexoes",
  "Filme-base da dimensão": "filme",
  "Referência editorial inicial": "filme",
  "Exemplo de headline de resultado": "exemplo",
  "Exemplos de primeiro movimento": "exemplos",
  // Internos: não vão para a página.
  "Uso editorial": null,
  "Observação": null,
  "Nota editorial para CMS": null,
  "Nota de implementação": null,
  "Campo nome": null,
  "Campo e-mail": null,
  "Checkbox marketing": null,
  "URL sugerida": null,
  "Objetivo editorial": null,
  "Objetivo de conversão": null,
  Objetivo: null,
};
// Título do bloco de captura usa "Título:"; dentro de card também.
const CAMPOS_CARD = { "Título": "titulo", Pergunta: "pergunta", Texto: "texto", Reconhecimento: "reconhecimento", "Primeiro movimento": "primeiro", CTA: "cta" };
const LISTA_TITULOS = {
  Inclui: "Inclui",
  "Pode incluir": "Pode incluir",
  "Pode incluir exercícios sobre": "Exercícios sobre",
  "Pode incluir exercícios e práticas sobre": "Exercícios e práticas sobre",
  "Temas centrais": "Temas centrais",
  "Perfis editoriais possíveis": "Perfis",
  "Rótulos de leitura": "Leituras",
  "Leituras públicas": "Leituras",
  "Os rótulos públicos devem ser": "Leituras",
  "Trilhas editoriais sugeridas": "Trilhas",
  "Categorias sugeridas": "Trilhas",
  Componentes: "Formatos",
};

const ROTULOS_MICRO = new Set([
  "Entrada do Mapa", "Título", "Texto", "CTA", "Intro", "Introdução", "Progresso", "Antes do resultado",
  "Calculando", "Resultado", "Resultado pronto", "Título genérico do resultado", "Resultado duplo",
  "Captura", "Captura pós-resultado", "Campo nome", "Campo e-mail", "Checkbox marketing",
  "Rodapé do Mapa", "Responsabilidade", "Nota de responsabilidade", "Alerta de segurança",
]);

const PEQUENAS = new Set(["de", "do", "da", "dos", "das", "e", "pelo", "pela", "para", "com", "sem", "no", "na", "ao", "à", "em"]);
function tituloCaso(s) {
  return s
    .toLowerCase()
    .split(" ")
    .map((p, i) => (i > 0 && PEQUENAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(" ");
}
const semBala = (l) => l.replace(/^•\s*/, "");
const maiuscula = (l) => l === l.toUpperCase() && /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(l);

function tipoDoBloco(nome) {
  const n = nome.toUpperCase();
  if (n.startsWith("HERO")) return "hero";
  if (n.startsWith("RECONHECIMENTO")) return "reconhecimento";
  if (n.includes("SIGNIFICA")) return "significado";
  if (n.includes("PONTOS DE FRICÇÃO")) return "pontos";
  if (n.startsWith("MAPA DE")) return "mapa";
  if (n.includes("COMO O RESULTADO")) return "resultado";
  if (n.includes("PRIMEIRO MOVIMENTO")) return "movimento";
  if (n.includes("CAPTURA")) return "captura";
  if (n.startsWith("PLANO EPIC")) return "plano";
  if (n.startsWith("KIT")) return "kit";
  if (n.startsWith("CONEX")) return "conexoes";
  if (n.includes("CONTEÚDO EDITORIAL")) return "editorial";
  if (n.startsWith("REPERTÓRIO")) return "repertorio";
  if (n.startsWith("PROTOCOLO")) return "protocolo";
  if (n.startsWith("FECHAMENTO")) return "fechamento";
  return "livre";
}

function rotulo(l) {
  const m = l.match(/^([^:•“"]{1,60}):\s*(.*)$/);
  if (!m) return null;
  return { nome: m[1].trim(), valor: m[2].trim() };
}

const paginas = {};
let dim = null;
let modo = "fora"; // fora | bloco | seo | micro | ignorar
let bloco = null;
let campo = null;
let card = null;
let listaAtual = null;
let microRotulo = null;
let microPai = null;

function novoBloco(numero, nome) {
  bloco = { n: numero, tipo: tipoDoBloco(nome), nome: tituloCaso(nome) };
  paginas[dim].blocos.push(bloco);
  campo = null;
  card = null;
  listaAtual = null;
}
function empurra(chave, valor) {
  (bloco[chave] ??= []).push(valor);
}

for (const l of linhas) {
  const pag = l.match(/^\d+\. PÁGINA DE DIMENSÃO — (.+?) — /);
  if (pag) {
    dim = IDS[pag[1]];
    paginas[dim] = { blocos: [], seo: {}, mapa: {} };
    modo = "fora";
    continue;
  }
  if (/^\d+\. PÁGINA —/.test(l) || /^\d+\. PÁGINA [A-Z]/.test(l)) {
    dim = null;
    modo = "fora";
    continue;
  }
  if (!dim) continue;

  const b = l.match(/^BLOCO (\d+) — (.+)$/);
  if (b) {
    modo = "bloco";
    novoBloco(Number(b[1]), b[2]);
    continue;
  }
  if (l === "FECHAMENTO FINAL") {
    modo = "bloco";
    novoBloco(bloco ? bloco.n + 0.5 : 99, "FECHAMENTO");
    continue;
  }
  if (/^(\d+\. )?SEO —/.test(l)) {
    modo = "seo";
    continue;
  }
  if (/^(\d+\. )?MICROCOPY/.test(l)) {
    modo = "micro";
    microRotulo = null;
    microPai = null;
    continue;
  }
  if (/^(\d+\. )?NOTAS DE IMPLEMENTAÇÃO/.test(l) || /^(\d+\. )?STATUS/.test(l)) {
    modo = "ignorar";
    continue;
  }

  if (modo === "seo") {
    const r = rotulo(l);
    if (r && !r.valor) microRotulo = r.nome;
    else if (microRotulo) {
      const k = { "SEO Title": "title", "Meta Description": "description", "OG Title": "ogTitle", "OG Description": "ogDescription", Canonical: "canonical" }[microRotulo];
      if (k) paginas[dim].seo[k] = l;
    }
    continue;
  }

  if (modo === "micro") {
    const r0 = rotulo(l);
    const r = r0 && ROTULOS_MICRO.has(r0.nome) ? r0 : null;
    const m = paginas[dim].mapa;
    if (r) {
      const filho = ["Título", "Texto", "CTA"].includes(r.nome) && microPai;
      const nome = filho ? `${microPai}/${r.nome}` : r.nome;
      if (!filho && !r.valor) microPai = r.nome;
      if (r.valor) m[nome] = r.valor;
      microRotulo = r.valor ? null : nome;
      continue;
    }
    if (microRotulo) m[microRotulo] = m[microRotulo] ? `${m[microRotulo]}\n${l}` : l;
    continue;
  }

  if (modo !== "bloco") continue;
  if (/^Objetivo:/.test(l)) continue;

  // Card de eixo: "CARD 1 — SONO QUEBRADO".
  const c = l.match(/^CARD \d+ — (.+)$/);
  if (c) {
    card = { titulo: tituloCaso(c[1]) };
    empurra("cards", card);
    campo = null;
    continue;
  }
  // Card de perfil: "IDENTIDADE — O PERSONAGEM".
  if (maiuscula(l) && l.includes(" — ") && !rotulo(l)) {
    const [eixo, perfil] = l.split(" — ");
    card = { titulo: tituloCaso(eixo), perfil: tituloCaso(perfil) };
    empurra("cards", card);
    campo = null;
    continue;
  }
  if (/^Cena \d+$/.test(l)) {
    campo = "cenas";
    continue;
  }

  const r = rotulo(l);
  if (r && card && r.nome in CAMPOS_CARD) {
    campo = `card:${CAMPOS_CARD[r.nome]}`;
    // "Título:" do card substitui o nome em caixa alta do cabeçalho do card.
    if (r.nome === "Título") delete card.titulo;
    if (r.valor) card[CAMPOS_CARD[r.nome]] = r.valor;
    continue;
  }
  // "CTA: Explorar X" dentro das conexões pertence à conexão; "CTA:" sozinho
  // depois delas é o CTA do bloco.
  if (r && campo === "conexoes" && r.nome === "CTA") {
    if (!r.valor) campo = "cta";
    continue;
  }
  if (r && r.nome in CAMPOS) {
    card = null;
    const k = CAMPOS[r.nome];
    campo = k;
    if (k === "lista") {
      listaAtual = { titulo: LISTA_TITULOS[r.nome] ?? r.nome, itens: [] };
      empurra("listas", listaAtual);
    }
    if (k === "titulo" && bloco.titulo) campo = "texto"; // segundo Headline vira texto
    if (r.valor && k) empurra(campo, r.valor);
    continue;
  }
  // Perfil de primeiro movimento escrito como "O Simulador:".
  const perfil = l.match(/^((?:O|A) [A-ZÁÉÍÓÚ][^:]{2,40}):$/);
  if (perfil && (bloco.tipo === "movimento" || campo === null)) {
    card = { titulo: perfil[1] };
    empurra("cards", card);
    campo = "card:primeiro";
    continue;
  }

  // Conexões escritas direto no texto: o nome da dimensão abre uma conexão.
  const ehDimensao = (x) => NOMES_DIMENSAO.some((n) => x === n || x.startsWith(`${n} +`));
  if (bloco.tipo === "conexoes" && campo !== "conexoes" && ehDimensao(semBala(l))) {
    campo = "conexoes";
    empurra("conexoes", { titulo: semBala(l), texto: "" });
    continue;
  }

  if (campo === null) continue;
  if (campo.startsWith("card:")) {
    const k = campo.slice(5);
    card[k] = card[k] ? `${card[k]}\n${l}` : l;
    continue;
  }
  if (campo === "lista") {
    listaAtual.itens.push(semBala(l));
    continue;
  }
  if (campo === "cenas") {
    empurra("cenas", semBala(l));
    continue;
  }
  if (campo === "conexoes") {
    // Nome da dimensão (ou "Energia + Ação") abre uma conexão; o resto descreve.
    const nomeLinha = semBala(l);
    const ehNome = NOMES_DIMENSAO.some((n) => nomeLinha === n || nomeLinha.startsWith(`${n} +`));
    if (ehNome) empurra("conexoes", { titulo: nomeLinha, texto: "" });
    else if (bloco.conexoes?.length) {
      const ult = bloco.conexoes[bloco.conexoes.length - 1];
      ult.texto = ult.texto ? `${ult.texto}\n${l}` : l;
    } else empurra("texto", l);
    continue;
  }
  if (campo === "exemplos") {
    const ult = bloco.cards?.[bloco.cards.length - 1];
    if (ult && !ult.primeiro) ult.primeiro = l;
    else empurra("cards", { titulo: l });
    continue;
  }
  empurra(campo, l);
}

// Microcopy do Mapa normalizada (os documentos usam rótulos um pouco diferentes).
for (const p of Object.values(paginas)) {
  const m = p.mapa;
  const pega = (...ks) => ks.map((k) => m[k]).find(Boolean) ?? null;
  p.mapa = {
    intro: pega("Intro", "Introdução", "Entrada do Mapa/Texto"),
    calculando: pega("Calculando", "Antes do resultado"),
    pronto: pega("Resultado pronto", "Resultado"),
    tituloResultado: pega("Título genérico do resultado"),
    duplo: pega("Resultado duplo"),
    capturaTitulo: pega("Captura pós-resultado/Título", "Captura", "Captura pós-resultado"),
    capturaTexto: pega("Captura pós-resultado/Texto", "Texto"),
    capturaCta: pega("Captura pós-resultado/CTA", "CTA"),
    responsabilidade: pega("Rodapé do Mapa", "Responsabilidade", "Nota de responsabilidade"),
    alerta: pega("Alerta de segurança"),
  };
  // Sem microcopy própria de captura: usa o bloco "Captura pós-resultado" da página.
  const cap = p.blocos.find((b) => b.tipo === "captura");
  if (cap) {
    p.mapa.capturaTitulo ??= cap.titulo?.[0] ?? null;
    p.mapa.capturaTexto ??= cap.texto?.join("\n") ?? null;
    p.mapa.capturaCta ??= cap.cta?.[0] ?? null;
  }
}

const destino = path.join("src", "lib", "epic", "content", "copy-final", "dimensoes.json");
fs.mkdirSync(path.dirname(destino), { recursive: true });
// Carimbo da fonte: copy-final.test.ts recalcula o hash e falha se o texto
// do repositório e os dados gerados se separarem (drift).
const fonte = fs.readFileSync(entrada, "utf8").replace(/\r/g, "");
const _meta = { fonte: entrada.split(path.sep).join("/"), sha256: crypto.createHash("sha256").update(fonte).digest("hex") };
fs.writeFileSync(destino, JSON.stringify({ _meta, ...paginas }, null, 2) + "\n");
const resumo = Object.entries(paginas).map(([k, v]) => `${k}: ${v.blocos.length} blocos`);
console.log(resumo.join("\n"));
