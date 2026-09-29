import { ImageResponse } from "next/og";

export const size = { height: 32, width: 32 };
export const contentType = "image/png";

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for icon.tsx
export default function Icon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#2dd4a8",
        borderRadius: 6,
        color: "white",
        display: "flex",
        fontSize: 20,
        fontWeight: 700,
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      B
    </div>,
    { ...size }
  );
}
