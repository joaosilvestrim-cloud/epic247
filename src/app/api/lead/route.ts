import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { DRENOS, type DrenoId } from "@/lib/drenos";
import { generateDrenoReportPdf } from "@/lib/pdf-report";
import { getReportPdfUrl, getReportFileName } from "@/lib/report-files";
import { sendReportEmail } from "@/lib/email";
import { sendMetaEvent } from "@/lib/meta-capi";

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

  const nomeStr = typeof nome === "string" ? nome : null;
  const drenoNome = DRENOS[dominante].nome;

  // 1) Persistir o lead (se o Supabase estiver configurado)
  const supabase = getServiceClient();
  if (supabase) {
    const { error } = await supabase.from("leads").insert({
      nome: nomeStr,
      email,
      dreno_dominante: dominante,
      dreno_secundario: isDrenoId(secundario) ? secundario : null,
      scores: scores ?? null,
      origem: "quiz_5_drenos",
    });
    if (error) {
      console.error("[lead] erro ao inserir:", error.message);
      // Não interrompe o fluxo do usuário; segue para e-mail/tracking.
    }
  } else {
    console.warn("[lead] Supabase não configurado — lead não persistido:", email);
  }

  // 2) Enviar o relatório por e-mail (best-effort).
  //    Preferimos o PDF final diagramado (Supabase Storage); se não houver,
  //    geramos um em runtime como fallback.
  let emailEnviado = false;
  try {
    const pdfUrl = getReportPdfUrl(dominante);
    const pdfName = getReportFileName(dominante);
    if (pdfUrl) {
      emailEnviado = await sendReportEmail({
        to: email,
        nome: nomeStr,
        drenoNome,
        attachmentUrl: pdfUrl,
        pdfName,
      });
    } else {
      const pdf = await generateDrenoReportPdf(dominante);
      emailEnviado = await sendReportEmail({
        to: email,
        nome: nomeStr,
        drenoNome,
        pdf,
        pdfName,
      });
    }
  } catch (err) {
    console.error("[lead] erro ao enviar relatório:", err);
  }

  // 3) Conversions API (Meta) — evento de Lead server-side
  await sendMetaEvent("Lead", {
    email,
    sourceUrl: request.headers.get("referer") ?? undefined,
    clientIp:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({
    ok: true,
    persisted: Boolean(supabase),
    emailEnviado,
    drenoNome,
  });
}
