import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { getDimensionalMap } from "@/lib/epic/maps";
import { cartaoOg, OG_SIZE } from "@/lib/epic/og/cartao";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Mapa EPIC: autoavaliação com resultado na hora";

export default async function Image({ params }: { params: Promise<{ dimensao: string }> }) {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao)) return cartaoOg({ rotulo: "Mapa EPIC", titulo: "Descubra seu ponto de fricção." });
  const cfg = getDimensionalMap(dimensao);
  return cartaoOg({
    rotulo: DIMENSIONS[dimensao].name,
    titulo: `${cfg.title}.`,
    apoio: `${cfg.questions.length} perguntas · resultado na hora`,
  });
}
