import ResultadoIndisponivel from "@/components/epic/ResultadoIndisponivel";

// Token inválido ou resultado inexistente: 404 com a microcopy do §27.9.
// not-found não recebe params: o novo Mapa começa pelo Mapa de Fricção.
export default function NaoEncontrado() {
  return <ResultadoIndisponivel novoMapa="/mapa" />;
}
