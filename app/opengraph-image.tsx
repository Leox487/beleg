import { ImageResponse } from "next/og";

export const alt =
  "Beleg — a sealed record of what you recorded. Public beta.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#1a1d20",
          color: "#ececec",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: "#2dd4a0",
              display: "flex",
            }}
          />
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>
            Beleg
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            A sealed record of what you actually did.
          </span>
          <span style={{ fontSize: 28, color: "#9aa0a6", maxWidth: 820 }}>
            Public beta. Seals show the words were not rewritten. They do not
            prove the event is true.
          </span>
        </div>
      </div>
    ),
    size,
  );
}
