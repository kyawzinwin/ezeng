import { ImageResponse } from "next/og";

// Brand icon: a warm terracotta flashcard with a cream "E" for EzEng.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 7,
          color: "#fffaf3",
          fontSize: 22,
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
