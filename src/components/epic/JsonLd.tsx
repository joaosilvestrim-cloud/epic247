/** Dados estruturados (Blueprint §26, v1.2 §57). "<" escapado: um texto com "</script>" não fecha a tag. */
export default function JsonLd({ dados }: { dados: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, "\\u003c") }} />;
}
