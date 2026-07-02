import { ImageResponse } from "next/og";

// Apple touch icon: same flashcard motif, scaled up for home screens.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #e2725b 0%, #f4a259 100%)",
          borderRadius: 40,
          color: "#fffaf3",
          fontSize: 120,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        E
      </div>
    ),
    { ...size },
  );
}
