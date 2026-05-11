import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AIComply — Compliance AI Act in meno di un'ora";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              color: "#7c3aed",
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>
            AIComply
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            Compliance AI Act in meno di un'ora.
          </div>
          <div
            style={{
              fontSize: 30,
              opacity: 0.85,
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            Reg. UE 2024/1689 + Legge 132/2025 — Quiz, registro IA,
            documenti audit-ready e formazione.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            opacity: 0.8,
          }}
        >
          <div>aicomplyonline.it</div>
          <div>Made in Italy</div>
        </div>
      </div>
    ),
    size,
  );
}
