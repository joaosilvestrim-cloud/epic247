import assert from "node:assert/strict";
import { test } from "node:test";
import { DIMENSION_IDS } from "./dimensions";
import { ofertasPermitidas, orientacaoProtocolo } from "./ofertas";

test("RF-081: comprador do Protocolo que refaz um Mapa não recebe oferta e é orientado ao módulo", () => {
  const comprador = { protocol_purchased: true, kits_owned: [], plans_owned: [] };
  for (const d of DIMENSION_IDS) {
    const r = ofertasPermitidas(comprador, d);
    assert.deepEqual(r, { plano: false, kit: false, protocolo: false, jaTemProtocolo: true });
    const o = orientacaoProtocolo(d);
    assert.ok(o.funcao.length > 20 && o.sequencia.length > 20 && o.cta.length > 5, d);
  }
});

test("Kit comprado suprime Kit e Plano da mesma dimensão, não de outras", () => {
  const r = ofertasPermitidas({ protocol_purchased: false, kits_owned: ["energia"], plans_owned: [] }, "energia");
  assert.equal(r.kit, false);
  assert.equal(r.plano, false);
  assert.equal(r.protocolo, true);
  assert.equal(ofertasPermitidas({ protocol_purchased: false, kits_owned: ["energia"], plans_owned: [] }, "acao").kit, true);
});

test("Plano comprado suprime só o Plano", () => {
  const r = ofertasPermitidas({ protocol_purchased: false, kits_owned: [], plans_owned: ["coragem"] }, "coragem");
  assert.equal(r.plano, false);
  assert.equal(r.kit, true);
});
