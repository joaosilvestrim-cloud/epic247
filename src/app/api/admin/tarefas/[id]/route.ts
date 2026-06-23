import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getServiceClient } from "@/lib/supabase";
import { isStatus, isPrioridade } from "@/lib/tarefas";

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

  if (typeof b.titulo === "string") patch.titulo = b.titulo.trim();
  if ("descricao" in b) patch.descricao = b.descricao ?? null;
  if ("categoria" in b) patch.categoria = b.categoria ?? null;
  if ("responsavel" in b) patch.responsavel = b.responsavel ?? null;
  if ("prazo" in b) patch.prazo = b.prazo || null;
  if (isPrioridade(b.prioridade)) patch.prioridade = b.prioridade;
  if (typeof b.ordem === "number") patch.ordem = b.ordem;
  if (isStatus(b.status)) {
    patch.status = b.status;
    patch.concluido_em = b.status === "concluido" ? new Date().toISOString() : null;
  }

  const { data, error } = await supabase
    .from("tarefas")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tarefa: data });
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
  const { error } = await supabase.from("tarefas").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
