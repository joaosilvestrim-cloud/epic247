import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { conferirSvix } from "./svix";

const segredoBytes = Buffer.from("segredo-de-teste-do-resend-32-bytes!");
const segredo = `whsec_${segredoBytes.toString("base64")}`;
const corpo = JSON.stringify({ type: "email.opened", data: { email_id: "abc" } });
const agora = 1_790_000_000_000;
const ts = String(agora / 1000);
const assinar = (id: string, t: string, c: string) =>
  `v1,${createHmac("sha256", segredoBytes).update(`${id}.${t}.${c}`).digest("base64")}`;

test("aceita assinatura válida, inclusive entre várias", () => {
  const ok = assinar("msg_1", ts, corpo);
  assert.equal(conferirSvix(segredo, { id: "msg_1", timestamp: ts, assinatura: ok }, corpo, agora), true);
  assert.equal(conferirSvix(segredo, { id: "msg_1", timestamp: ts, assinatura: `v1,xxxx ${ok}` }, corpo, agora), true);
});

test("recusa corpo alterado, id trocado, segredo errado e cabeçalho ausente", () => {
  const ok = assinar("msg_1", ts, corpo);
  assert.equal(conferirSvix(segredo, { id: "msg_1", timestamp: ts, assinatura: ok }, corpo + " ", agora), false);
  assert.equal(conferirSvix(segredo, { id: "msg_2", timestamp: ts, assinatura: ok }, corpo, agora), false);
  assert.equal(conferirSvix("whsec_" + Buffer.from("outro").toString("base64"), { id: "msg_1", timestamp: ts, assinatura: ok }, corpo, agora), false);
  assert.equal(conferirSvix(segredo, { id: null, timestamp: ts, assinatura: ok }, corpo, agora), false);
});

test("recusa mensagem velha (replay)", () => {
  const velho = String(agora / 1000 - 600);
  const sig = assinar("msg_1", velho, corpo);
  assert.equal(conferirSvix(segredo, { id: "msg_1", timestamp: velho, assinatura: sig }, corpo, agora), false);
});
