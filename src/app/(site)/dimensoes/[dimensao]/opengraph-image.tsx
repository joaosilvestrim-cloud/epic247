import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { cartaoOg, OG_SIZE } from "@/lib/epic/og/cartao";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Uma das 10 dimensões do EPIC247";

export default async function Image({ params }: { params: Promise<{ dimensao: string }> }) {
  const { dimensao } = await params;
  const d = isDimensionId(dimensao) ? DIMENSIONS[dimensao] : null;
  return cartaoOg({
    rotulo: "Uma das 10 dimensões",
    titulo: d?.name ?? "EPIC247",
    apoio: d?.manifestoLine,
  });
}
