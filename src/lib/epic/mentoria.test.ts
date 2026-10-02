import assert from "node:assert/strict";
import { test } from "node:test";
import {
  estadoMentoria,
  MSG,
  normalizarWhatsapp,
  podeLiberarLink,
  podeMudar,
  STATUS_MENTORIA,
  supressaoMentoria,
  TRANSICOES,
  validarInteresse,
  type SituacaoMentoria,
} from "./mentoria";

test("5 clientes ativos viram lista de espera", () => {
  assert.equal(estadoMentoria(5, 0), "AVAILABLE");
  assert.equal(estadoMentoria(5, 4), "AVAILABLE");
  assert.equal(estadoMentoria(5, 5), "WAITLIST");
  assert.equal(estadoMentoria(5, 7), "WAITLIST");
  assert.equal(estadoMentoria(0, 0), "WAITLIST");
});

test("ninguém vira ativo à mão: só o pagamento confirmado ativa", () => {
  for (const de of STATUS_MENTORIA) assert.equal(podeMudar(de, "ativo"), false, de);
  for (const de of STATUS_MENTORIA) assert.equal(podeMudar(de, "link_enviado"), false, de);
});

test("transições apontam para status conhecidos", () => {
  for (const [de, paras] of Object.entries(TRANSICOES)) {
    for (const p of paras) assert.ok(STATUS_MENTORIA.includes(p), `${de} -> ${p}`);
  }
  assert.ok(podeMudar("novo", "em_contato"));
  assert.ok(podeMudar("ativo", "concluido"));
  assert.equal(podeMudar("concluido", "novo"), false);
});

test("link de pagamento só depois da vaga confirmada", () => {
  assert.equal(podeLiberarLink("novo"), false);
  assert.equal(podeLiberarLink("em_contato"), false);
  assert.equal(podeLiberarLink("lista_espera"), false);
  assert.equal(podeLiberarLink("vaga_confirmada"), true);
  assert.equal(podeLiberarLink("link_enviado"), true);
  assert.equal(podeLiberarLink("ativo"), false);
});

test("formulário: só nome e e-mail são obrigatórios", () => {
  const r = validarInteresse({ name: " Ana Souza ", email: " Ana@Exemplo.com " });
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.dados.nome, "Ana Souza");
    assert.equal(r.dados.email, "ana@exemplo.com");
    assert.equal(r.dados.whatsapp, null);
    assert.equal(r.dados.contexto, null);
    assert.equal(r.dados.marketing, false);
  }
});

test("formulário: erros por campo com a microcopy", () => {
  const r = validarInteresse({ name: "", email: "x", whatsapp: "12" });
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.equal(r.erros.name, MSG.nome);
    assert.equal(r.erros.email, MSG.emailInvalido);
    assert.equal(r.erros.whatsapp, MSG.whatsapp);
  }
  const vazio = validarInteresse({ name: "Ana" });
  assert.ok(!vazio.ok && vazio.erros.email === MSG.emailVazio);
});

test("marketing só com aceite explícito", () => {
  const r = validarInteresse({ name: "Ana", email: "a@b.co", marketing: "true" });
  assert.ok(r.ok && r.dados.marketing === false);
  const s = validarInteresse({ name: "Ana", email: "a@b.co", marketing: true });
  assert.ok(s.ok && s.dados.marketing === true);
});

test("WhatsApp: brasileiro ganha 55, inválido é recusado", () => {
  assert.equal(normalizarWhatsapp("(11) 98765-4321"), "+5511987654321");
  assert.equal(normalizarWhatsapp("+55 11 98765 4321"), "+5511987654321");
  assert.equal(normalizarWhatsapp("+351 912 345 678"), "+351912345678");
  assert.equal(normalizarWhatsapp(""), null);
  assert.equal(normalizarWhatsapp(undefined), null);
  assert.equal(normalizarWhatsapp("1234"), undefined);
  assert.equal(normalizarWhatsapp("liga pra mim"), undefined);
});

const base: SituacaoMentoria = {
  automacao: "AUT_MAP_NURTURE", prioridade: 4, productId: null, comprou: false, status: null, linkLiberado: false,
};

test("abandono de checkout da Mentoria só depois do link liberado", () => {
  const ab = { ...base, automacao: "AUT_CHECKOUT_ABANDON", productId: "mentoring" };
  assert.equal(supressaoMentoria({ ...ab, status: "vaga_confirmada" }), "mentoria_sem_link");
  assert.equal(supressaoMentoria({ ...ab, status: "link_enviado", linkLiberado: true }), null);
  // Abandono de outro produto durante a conversa sai.
  assert.equal(
    supressaoMentoria({ ...base, automacao: "AUT_CHECKOUT_ABANDON", productId: "kit_energia", status: "em_contato" }),
    "tratativa_mentoria"
  );
});

test("cliente da Mentoria sai dos fluxos promocionais, não dos transacionais", () => {
  assert.equal(supressaoMentoria({ ...base, comprou: true, status: "ativo" }), "cliente_mentoria");
  assert.equal(supressaoMentoria({ ...base, comprou: true, status: null }), "cliente_mentoria");
  assert.equal(supressaoMentoria({ ...base, automacao: "AUT_INACTIVE_30D", status: "ativo" }), "cliente_mentoria");
  assert.equal(supressaoMentoria({ ...base, comprou: true, status: "ativo", prioridade: 2 }), null);
  assert.equal(supressaoMentoria({ ...base, comprou: true, status: "ativo", automacao: "AUT_NEWSLETTER_EDITION", prioridade: 5 }), null);
  // Depois de concluir, volta aos fluxos normais.
  assert.equal(supressaoMentoria({ ...base, comprou: true, status: "concluido" }), null);
});

test("lista de espera e encerrado não suprimem nada", () => {
  assert.equal(supressaoMentoria({ ...base, status: "lista_espera" }), null);
  assert.equal(supressaoMentoria({ ...base, status: "encerrado_sem_aderencia" }), null);
  assert.equal(supressaoMentoria({ ...base, status: "novo" }), "tratativa_mentoria");
});
