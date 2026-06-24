import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "EPIC247 · Protocolo — Módulo Energia";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#182848",
          fontFamily: "sans-serif",
        }}
      >
        {/* wordmark */}
        <div style={{ display: "flex", alignItems: "center", fontSize: 150, fontWeight: 800, letterSpacing: -2 }}>
          <span style={{ color: "#f8f0e8" }}>EPIC</span>
          <span style={{ color: "#c09840", margin: "0 18px", fontWeight: 400, fontStyle: "italic" }}>/</span>
          <span style={{ color: "#f8f0e8" }}>247</span>
        </div>
        <div style={{ display: "flex", marginTop: 8, fontSize: 40, letterSpacing: 28, color: "#d8b765", paddingLeft: 28 }}>
          PROTOCOLO
        </div>
        <div style={{ display: "flex", marginTop: 56, height: 4, width: 120, backgroundColor: "#c09840" }} />
        <div style={{ display: "flex", marginTop: 40, fontSize: 34, color: "#b9c0cf" }}>
          Módulo Energia · Diagnóstico dos 5 Drenos
        </div>
      </div>
    ),
    { ...size }
  );
}
