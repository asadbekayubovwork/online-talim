import { ImageResponse } from "next/og";

// Branded social-share image, used as the default Open Graph / Twitter card
// for every route (file-based metadata). 1200×630 is the standard OG size.
export const alt = "Abu-Hanifa akademiyasi — onlayn islomiy ta'lim";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #1e3a8a 0%, #4338ca 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: "80px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", gap: 18, fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>
          <span>Abu-Hanifa</span>
          <span style={{ color: "#93c5fd" }}>akademiyasi</span>
        </div>
        <div
          style={{
            fontSize: 38,
            marginTop: 28,
            color: "#dbeafe",
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          Hanafiy fiqhi va uning usuli, Aqida va Tazkiya darslari — onlayn
        </div>
        <div style={{ fontSize: 28, marginTop: 40, color: "#bfdbfe" }}>
          Tayyorlovdan Muftiy darajasigacha
        </div>
      </div>
    ),
    { ...size }
  );
}
