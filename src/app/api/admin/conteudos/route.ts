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

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ conteudos: [] });

  const { data, error } = await supabase
    .from("conteudos")
    .select("*")
    .order("ordem", { ascending: true })
    .order("data", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conteudos: data ?? [] });
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
  const nome = typeof b.nome === "string" ? b.nome.trim() : "";
  if (!nome) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  const row: Record<string, unknown> = {
    nome,
    status: isStatus(b.status) ? b.status : "a_produzir",
  };
  for (const c of CAMPOS) {
    row[c] = typeof b[c] === "string" && b[c] ? b[c] : null;
  }

  const { data, error } = await supabase.from("conteudos").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conteudo: data });
}
