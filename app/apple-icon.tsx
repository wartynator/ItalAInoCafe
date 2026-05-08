import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#2a160c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f4ead0",
          fontSize: 130,
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          letterSpacing: "-0.05em",
          paddingBottom: 12,
        }}
      >
        I
      </div>
    ),
    size,
  );
}
