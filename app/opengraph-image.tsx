import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

// Social share card (Facebook, Messenger, Telegram, Viber, Twitter, …).
export const alt = "EzEng — Learn English for Myanmar speakers";
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
          gap: 28,
          background: "linear-gradient(135deg, #fdf6ec 0%, #f5e6d3 100%)",
          fontFamily: "sans-serif",
          padding: 80,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 132,
            height: 132,
            borderRadius: 30,
            background: "linear-gradient(135deg, #e2725b 0%, #f4a259 100%)",
            color: "#fffaf3",
            fontSize: 90,
            fontWeight: 800,
          }}
        >
          E
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 800, color: "#3a2e28" }}>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 600, color: "#8a7a6d" }}>
          Learn English — words, phrases &amp; idioms
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#e2725b", fontWeight: 700 }}>
          for Myanmar &amp; Burmese speakers
        </div>
      </div>
    ),
    { ...size },
  );
}
