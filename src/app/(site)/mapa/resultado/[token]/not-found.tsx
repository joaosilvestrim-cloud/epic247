import ResultadoIndisponivel from "@/components/epic/ResultadoIndisponivel";

// Token inválido ou resultado inexistente: 404 com a microcopy do §27.9.
export default function NaoEncontrado() {
  return <ResultadoIndisponivel novoMapa="/mapa" />;
}
