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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e3c2e",
          color: "#fffaf2",
          fontSize: 64,
          fontWeight: 700,
        }}
      >
        FO
      </div>
    ),
    { ...size },
  );
}
