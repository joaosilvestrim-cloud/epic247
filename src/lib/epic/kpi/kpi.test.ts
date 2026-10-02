import assert from "node:assert/strict";
import { test } from "node:test";
import { chaveColuna, data, dataHora, lerCsv, numero } from "./csv";
import { linhasCampanha, linhasConteudo, linhasRecebiveis } from "./importacao";
import { economiaKpi, idade, razao, resumoCaixa, resumoVendas, retencaoPonderada, taxasConteudo, type RecebivelValor } from "./metricas";

// ───────────── CSV ─────────────

test("lê CSV com ponto e vírgula, aspas, BOM e cabeçalho em português", () => {
  const { colunas, linhas } = lerCsv('﻿Dia;Nome da campanha;"Valor usado (BRL)"\r\n2026-10-01;"onda1; energia";"1.234,56"\r\n\r\n');
  assert.deepEqual(colunas, ["dia", "nome_da_campanha", "valor_usado_brl"]);
  assert.equal(linhas.length, 1);
  assert.equal(linhas[0].nome_da_campanha, "onda1; energia");
  assert.equal(linhas[0].valor_usado_brl, "1.234,56");
});

test("lê CSV com vírgula e aspas escapadas", () => {
  const { linhas } = lerCsv('content_id,notas\nreel_1,"disse ""oi"""\n');
  assert.equal(linhas[0].notas, 'disse "oi"');
});

test("números em formato brasileiro e americano", () => {
  assert.equal(numero("1.234,56"), 1234.56);
  assert.equal(numero("1,234.56"), 1234.56);
  assert.equal(numero("1234.56"), 1234.56);
  assert.equal(numero("12,5"), 12.5);
  assert.equal(numero("12.345"), 12345);
  assert.equal(numero("R$ 250,00"), 250);
  assert.equal(numero("35%"), 35);
  assert.equal(numero("-"), null);
  assert.equal(numero("abc"), null);
  assert.equal(numero(""), null);
});

test("datas e chaves de coluna", () => {
  assert.equal(data("01/10/2026"), "2026-10-01");
  assert.equal(data("2026-10-01T10:00:00"), "2026-10-01");
  assert.equal(data("31/02/2026"), null);
  assert.equal(dataHora("01/10/2026 10:30"), "2026-10-01T13:30:00.000Z");
  assert.equal(chaveColuna("Visualizações da página de destino"), "visualizacoes_da_pagina_de_destino");
});

// ───────────── Importação ─────────────

test("conteúdo: normaliza plataforma, tipo e universo; content_id vira a chave", () => {
  const { linhas } = lerCsv(
    "content_id;plataforma;tipo;universo;dimensao;views;salvamentos;compartilhamentos;retencao\n" +
    "Reel_Energia_007;ig;Reels;cultura;Energia;1.000;50;20;45%\n" +
    ";instagram;reel;;;10;1;1;\n" +
    "x;tiktok;podcast;;;10;1;1;\n"
  );
  const { ok, falhas } = linhasConteudo(linhas);
  assert.equal(ok.length, 1);
  assert.deepEqual(
    { id: ok[0].content_id, p: ok[0].platform, t: ok[0].content_type, u: ok[0].editorial_universe, d: ok[0].dimension, v: ok[0].views, r: ok[0].retention_rate },
    { id: "reel_energia_007", p: "instagram", t: "reel", u: "cultura_explica_a_vida", d: "energia", v: 1000, r: 45 }
  );
  assert.equal(ok[0].source_record_id, "instagram:reel_energia_007");
  assert.deepEqual(falhas.map((f) => f.linha), [3, 4]);
});

test("campanha: export do Meta em português, chave de granularidade e utm da URL", () => {
  const { linhas } = lerCsv(
    "Dia;Identificação da campanha;Nome da campanha;Identificação do anúncio;Valor usado (BRL);Impressões;Cliques no link;Parâmetros de URL\n" +
    "01/10/2026;123;Onda1 Energia;9;150,25;10.000;120;utm_campaign=onda1_energia&utm_content=reel_energia_007\n" +
    "02/10/2026;;Onda1 Energia;;0;0;0;\n" +
    ";123;Total;;150,25;;;\n"
  );
  const { ok, falhas } = linhasCampanha(linhas, { platform: "meta" });
  assert.equal(ok.length, 2);
  assert.equal(ok[0].spend, 150.25);
  assert.equal(ok[0].impressions, 10000);
  assert.equal(ok[0].utm_campaign, "onda1_energia");
  assert.equal(ok[0].utm_content, "reel_energia_007");
  assert.equal(ok[0].source_record_id, "2026-10-01|meta|123||9");
  // sem id: a chave usa o nome; campanha com gasto zero é linha válida
  assert.equal(ok[1].campaign_id, "nome:onda1_energia");
  assert.equal(ok[1].spend, 0);
  assert.equal(falhas.length, 1);
});

test("recebíveis: status deduzido das datas e em português", () => {
  const { linhas } = lerCsv(
    "pedido;parcela;parcelas;valor previsto;data prevista;valor recebido;data de recebimento;status\n" +
    "A1;1;3;100;2026-11-01;;;\n" +
    "A1;2;3;100;2026-12-01;98;2026-12-02;\n" +
    "A1;3;3;100;;;;\n" +
    "A2;1;1;50;2026-10-10;;;cancelado\n" +
    "A3;2;1;50;;;;\n" +
    "A4;1;1;50;;;;quase\n"
  );
  const { ok, falhas } = linhasRecebiveis(linhas);
  assert.deepEqual(ok.map((r) => r.receivable_status), ["scheduled", "received", "pending", "cancelled"]);
  assert.equal(ok[1].source_record_id, "A1:2");
  assert.deepEqual(falhas.map((f) => f.erro), ["parcela inválida", "receivable_status inválido"]);
});

// ───────────── Métricas ─────────────

test("razão nunca divide por zero", () => {
  assert.equal(razao(10, 0), null);
  assert.equal(razao(10, null), null);
  assert.equal(razao(10, 4), 2.5);
});

test("taxas de conteúdo usam views como denominador fixo", () => {
  assert.deepEqual(taxasConteudo({ views: 1000, saves: 50, shares: 20, link_clicks: 10 }), { saveRate: 0.05, shareRate: 0.02, ctr: 0.01 });
  // conteúdo sem tráfego / sem views
  assert.deepEqual(taxasConteudo({ views: 0, saves: 5, shares: null, link_clicks: 0 }), { saveRate: null, shareRate: null, ctr: null });
  assert.equal(retencaoPonderada([{ views: 100, retention_rate: 50 }, { views: 300, retention_rate: 30 }, { views: 0, retention_rate: 90 }]), 35);
});

test("economia: campanha com gasto e zero leads, e com leads e compras", () => {
  const zero = economiaKpi({
    gasto: 500, leads: 0, visitantes: 40, vendas: 0, receitaBruta: 0, leadsAtribuidos: 0,
    novosCompradoresAtribuidos: 0, compradoresUnicosAtribuidos: 0, receitaBrutaAtribuida: 0, receitaLiquidaAtribuida: 0, caixaAtribuido: 0,
  });
  assert.equal(zero.cpl, null);
  assert.equal(zero.cacCliente, null);
  assert.equal(zero.roasBruto, 0);
  assert.equal(zero.rpl, null);

  const k = economiaKpi({
    gasto: 1000, leads: 125, visitantes: 1000, vendas: 10, receitaBruta: 2000, leadsAtribuidos: 100,
    novosCompradoresAtribuidos: 4, compradoresUnicosAtribuidos: 5, receitaBrutaAtribuida: 1500, receitaLiquidaAtribuida: 1300, caixaAtribuido: 600,
  });
  assert.deepEqual(k, {
    cpl: 10, cacPrimeiroProduto: 250, cacCliente: 200, ticketMedio: 200, rpl: 16, rpv: 2,
    roasBruto: 1.5, roasLiquido: 1.3, roasCaixa: 0.6,
  });
});

test("vendas: refund e chargeback corrigem líquido, não o vendido", () => {
  const r = resumoVendas([
    { status: "approved", bruto: 497, liquido: 450, taxa: 47 }, // à vista
    { status: "approved", bruto: 97, liquido: 88, taxa: 9 }, // parcelada
    { status: "refunded", bruto: 29, liquido: 25.5, taxa: 3.5 },
    { status: "chargeback", bruto: 97, liquido: 88, taxa: 9 },
    { status: "refused", bruto: 497, liquido: 450, taxa: 47 },
    { status: "pending", bruto: 29, liquido: 25.5, taxa: 3.5 },
  ]);
  assert.deepEqual(r, { vendas: 4, vendido: 720, receitaLiquida: 538, taxas: 56, reembolsado: 126 });
});

test("caixa: recebido, a receber, presumido e projeção até 30/12", () => {
  const rs: RecebivelValor[] = [
    { status: "received", valorEsperado: 100, dataPrevista: "2026-10-01", valorRecebido: 100, liquidoRecebido: 97, presumivel: false },
    { status: "scheduled", valorEsperado: 450, dataPrevista: "2026-10-01", valorRecebido: null, liquidoRecebido: null, presumivel: true },
    { status: "scheduled", valorEsperado: 88, dataPrevista: "2026-11-15", valorRecebido: null, liquidoRecebido: null, presumivel: true },
    { status: "scheduled", valorEsperado: 60, dataPrevista: "2027-01-15", valorRecebido: null, liquidoRecebido: null, presumivel: false },
    { status: "scheduled", valorEsperado: 30, dataPrevista: "2026-10-01", valorRecebido: null, liquidoRecebido: null, presumivel: false },
    { status: "pending", valorEsperado: 40, dataPrevista: null, valorRecebido: null, liquidoRecebido: null, presumivel: false },
    { status: "refunded", valorEsperado: 25, dataPrevista: "2026-10-05", valorRecebido: null, liquidoRecebido: null, presumivel: true },
    { status: "chargeback", valorEsperado: 88, dataPrevista: "2026-10-05", valorRecebido: 88, liquidoRecebido: 88, presumivel: true },
  ];
  assert.deepEqual(resumoCaixa(rs, "2026-10-02"), {
    recebidoConfirmado: 97,
    recebidoPresumido: 450,
    recebido: 547,
    aReceber: 218,
    aReceberAteCorte: 118,
    vencido: 30,
    semData: 40,
    projetadoAteCorte: 665,
  });
});

test("idade da última atualização", () => {
  const agora = Date.parse("2026-10-02T12:00:00Z");
  assert.equal(idade(null, agora), "nunca");
  assert.equal(idade("2026-10-02T09:00:00Z", agora), "há 3 horas");
  assert.equal(idade("2026-09-28T12:00:00Z", agora), "há 4 dias");
});
