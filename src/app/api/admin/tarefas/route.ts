import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getServiceClient } from "@/lib/supabase";
import { isStatus, isPrioridade } from "@/lib/tarefas";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ tarefas: [] });

  const { data, error } = await supabase
    .from("tarefas")
    .select("*")
    .order("ordem", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tarefas: data ?? [] });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const titulo = typeof b.titulo === "string" ? b.titulo.trim() : "";
  if (!titulo) {
    return NextResponse.json({ error: "Título é obrigatório." }, { status: 400 });
  }

  const row = {
    titulo,
    descricao: typeof b.descricao === "string" ? b.descricao : null,
    categoria: typeof b.categoria === "string" ? b.categoria : null,
    responsavel: typeof b.responsavel === "string" ? b.responsavel : null,
    status: isStatus(b.status) ? b.status : "a_fazer",
    prioridade: isPrioridade(b.prioridade) ? b.prioridade : "media",
    prazo: typeof b.prazo === "string" && b.prazo ? b.prazo : null,
  };

  const { data, error } = await supabase.from("tarefas").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tarefa: data });
}
