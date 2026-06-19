import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { DRENOS, type DrenoId } from "@/lib/drenos";

const DRENO_IDS: DrenoId[] = ["sono", "combustivel", "cortisol", "atencao", "movimento"];

function isDrenoId(value: unknown): value is DrenoId {
  return typeof value === "string" && DRENO_IDS.includes(value as DrenoId);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { nome, email, dominante, secundario, scores } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }
  if (!isDrenoId(dominante)) {
    return NextResponse.json({ error: "Dreno dominante inválido." }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Sem Supabase configurado: não quebra o fluxo do usuário em desenvolvimento.
  if (!supabase) {
    console.warn("[lead] Supabase não configurado — lead não persistido:", email);
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("leads").insert({
    nome: typeof nome === "string" ? nome : null,
    email,
    dreno_dominante: dominante,
    dreno_secundario: isDrenoId(secundario) ? secundario : null,
    scores: scores ?? null,
    origem: "quiz_5_drenos",
  });

  if (error) {
    console.error("[lead] erro ao inserir:", error.message);
    return NextResponse.json({ error: "Não foi possível salvar o lead." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    persisted: true,
    drenoNome: DRENOS[dominante].nome,
  });
}
