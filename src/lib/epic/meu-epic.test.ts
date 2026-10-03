import assert from "node:assert/strict";
import { test } from "node:test";
import {
  destinoSeguro, emailMascarado, estadoPlano, podeAbrirKit, podeAbrirPlano, podeBaixarMaterial,
  progressoProtocolo, type Acesso,
} from "./meu-epic";

const kitEnergia: Acesso = { product_type: "kit", scope: "energia", access_status: "active" };
const protocolo: Acesso = { product_type: "protocol", scope: "protocol", access_status: "active" };

test("Kit libera só a dimensão comprada (CR-01, critério 6)", () => {
  assert.equal(podeAbrirKit([kitEnergia], "energia"), true);
  assert.equal(podeAbrirKit([kitEnergia], "coragem"), false);
  assert.equal(podeBaixarMaterial([kitEnergia], { product_type: "kit", dimension: "coragem" }), false);
  assert.equal(podeBaixarMaterial([kitEnergia], { product_type: "protocol", dimension: "energia" }), false);
});

test("Protocolo libera os materiais das 10 dimensões sem comprar Kits (CR-01A)", () => {
  assert.equal(podeAbrirKit([protocolo], "amor"), true);
  assert.equal(podeBaixarMaterial([protocolo], { product_type: "kit", dimension: "acao" }), true);
  assert.equal(podeBaixarMaterial([protocolo], { product_type: "protocol", dimension: "acao" }), true);
});

test("acesso suspenso ou revogado não abre conteúdo (critério 8)", () => {
  for (const s of ["suspended", "revoked"] as const) {
    assert.equal(podeAbrirKit([{ ...kitEnergia, access_status: s }], "energia"), false);
    assert.equal(podeAbrirKit([{ ...protocolo, access_status: s }], "energia"), false);
    assert.equal(podeAbrirPlano([{ product_type: "plan", scope: "energia", access_status: s }], "energia"), false);
  }
});

test("Plano: pronto, em preparação e falha", () => {
  assert.equal(estadoPlano({ processing_status: "generated", content: {} }), "ready");
  assert.equal(estadoPlano({ processing_status: "generated", content: null }), "processing");
  assert.equal(estadoPlano({ processing_status: "pending", content: null }), "processing");
  assert.equal(estadoPlano({ processing_status: "failed", content: null }), "failed");
});

test("progresso do Protocolo na ordem recomendada, sem bloqueio", () => {
  const p = progressoProtocolo([
    { dimension: "coragem", status: "completed" },
    { dimension: "acao", status: "in_progress" },
  ]);
  assert.equal(p.total, 10);
  assert.equal(p.concluidas, 1);
  assert.equal(p.proxima, "acao");
  assert.equal(p.dimensoes[0].dimensao, "energia");
  assert.equal(p.dimensoes.find((d) => d.dimensao === "coragem")?.estado, "concluido");
  assert.equal(progressoProtocolo([]).proxima, "energia");
});

test("destino depois do login nunca sai do Meu EPIC", () => {
  assert.equal(destinoSeguro("/meu-epic/planos/abc-123"), "/meu-epic/planos/abc-123");
  for (const ruim of ["https://evil.com", "//evil.com", "/meu-epic//evil.com", "/admin", "/meu-epicx", "/meu-epic/../admin", null]) {
    assert.equal(destinoSeguro(ruim), "/meu-epic", String(ruim));
  }
});

test("e-mail mascarado", () => {
  assert.equal(emailMascarado("joao@exemplo.com"), "j***@exemplo.com");
});
