import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { isDimensionId } from "@/lib/epic/dimensions";
import { BUCKET_PRIVADO, garantirBucket } from "@/lib/epic/server/acessos";
import { DB_SCHEMA } from "@/lib/epic/server/db";

/**
 * URL assinada de envio de material pago para o bucket PRIVADO (CR-01A).
 * O arquivo vai direto do navegador para o Storage. Cada ambiente grava na
 * pasta do seu schema: staging não mistura com produção.
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const b = (await req.json().catch(() => null)) as { product_type?: string; dimension?: string; file_name?: string } | null;
  if (!b || !["kit", "protocol"].includes(b.product_type ?? "") || !isDimensionId(b.dimension) || !b.file_name) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const seguro = b.file_name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
  const caminho = `${DB_SCHEMA}/${b.product_type}/${b.dimension}/${Date.now()}-${seguro}`;
  try {
    const sb = await garantirBucket();
    const { data, error } = await sb.storage.from(BUCKET_PRIVADO).createSignedUploadUrl(caminho);
    if (error || !data) throw new Error(error?.message ?? "sem URL");
    return NextResponse.json({ bucket: BUCKET_PRIVADO, path: data.path, token: data.token });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Falha ao preparar o envio." }, { status: 500 });
  }
}
