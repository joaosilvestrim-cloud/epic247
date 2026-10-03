import { NextResponse } from "next/server";
import { sair } from "@/lib/epic/server/conta";

export async function POST(req: Request) {
  await sair();
  return NextResponse.redirect(new URL("/meu-epic/entrar?saiu=1", req.url), 303);
}
