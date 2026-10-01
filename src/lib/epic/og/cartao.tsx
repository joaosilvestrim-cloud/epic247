import { ImageResponse } from "next/og";

// Imagem de compartilhamento (Open Graph) na identidade 2.0: papel creme,
// grafite e um filete de latão. Sem fotografia até existir o banco de
// imagens aprovado (Identidade Visual §7).

export const OG_SIZE = { width: 1200, height: 630 };

const CREME = "#F1E8DC";
const GRAFITE = "#2B2A28";
const MINERAL = "#66625D";
const LATAO = "#B59A63";

export function cartaoOg({ rotulo, titulo, apoio }: { rotulo: string; titulo: string; apoio?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: CREME,
          padding: "72px 84px",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 700, color: GRAFITE, fontFamily: "sans-serif" }}>
          <span>EPIC</span>
          <span style={{ color: LATAO, margin: "0 6px", fontWeight: 300, fontStyle: "italic" }}>/</span>
          <span>247</span>
          <span style={{ marginLeft: 28, fontSize: 24, fontWeight: 400, color: MINERAL }}>{rotulo}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: 96, height: 3, backgroundColor: LATAO, marginBottom: 36 }} />
          <div style={{ display: "flex", fontSize: titulo.length > 40 ? 68 : 84, lineHeight: 1.08, color: GRAFITE, maxWidth: 980 }}>
            {titulo}
          </div>
          {apoio && (
            <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: MINERAL, fontFamily: "sans-serif" }}>{apoio}</div>
          )}
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
