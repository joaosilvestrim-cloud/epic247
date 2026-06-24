import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getServiceClient } from "@/lib/supabase";
import { isStatus } from "@/lib/conteudos";

const CAMPOS = [
  "semana",
  "data",
  "dia",
  "horario",
  "tipo",
  "formato",
  "nomenclatura",
  "story_num",
  "link",
  "legenda",
  "hashtags",
  "notas",
] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 500 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof b.nome === "string") patch.nome = b.nome.trim();
  if (isStatus(b.status)) patch.status = b.status;
  if (Array.isArray(b.anexos)) patch.anexos = b.anexos;
  for (const c of CAMPOS) {
    if (c in b) patch[c] = b[c] ? b[c] : null;
  }

  const { data, error } = await supabase
    .from("conteudos")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conteudo: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 500 });
  }

  const { id } = await params;
  const { error } = await supabase.from("conteudos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
