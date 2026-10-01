import { cartaoOg, OG_SIZE } from "@/lib/epic/og/cartao";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "EPIC247: descubra seu ponto de fricção";

export default function OpengraphImage() {
  return cartaoOg({
    rotulo: "Transformação pessoal aplicada",
    titulo: "Descubra seu ponto de fricção.",
    apoio: "10 dimensões da sua vida. Um sistema.",
  });
}
