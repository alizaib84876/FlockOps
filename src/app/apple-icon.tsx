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
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32">
          <path
            fill="#c9892d"
            d="M9.2 19.6c2.4-1.1 3.8-3.4 4.1-5.8.2 2.1 1.3 4 3 5.1-2.6.4-5.1.9-7.1 2.2Z"
          />
          <path
            fill="#fffaf2"
            d="M6.8 14.2c2.8-3.4 7.2-4.6 10.6-3.2-2.2 1.8-3.6 4.4-3.8 7.2-2.6-1-5.1-1.8-6.8-4Z"
          />
          <path
            fill="#fffaf2"
            d="M15.1 13.4c2.6-3.2 6.8-4.4 10.1-2.8-2.1 1.7-3.4 4.2-3.5 6.9-2.6-1.1-4.9-2.1-6.6-4.1Z"
          />
          <path
            fill="#b85a32"
            d="M24.8 11.2c.9.2 1.6.8 1.9 1.6-.8.1-1.5.1-2.2 0 .1-.6.2-1.1.3-1.6Z"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
