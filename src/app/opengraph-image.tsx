import { ImageResponse } from "next/og";

export const alt = "Brand Morph: one product, three distinct personalities";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRANDS = [
  { name: "Solace", color: "#5E8271" },
  { name: "Orbit", color: "#0047FF" },
  { name: "Lumen", color: "#2B1E70" },
];

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: "#FBF9F5",
        color: "#1F2421",
      }}
    >
      <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, color: "#5A605B" }}>
        BRAND MORPH LAB
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
        <span>One product.</span>
        <span>Three distinct personalities.</span>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {BRANDS.map(({ name, color }) => (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 20px",
              borderRadius: 12,
              border: "1px solid #E2DDD4",
              backgroundColor: "#FFFFFF",
              fontSize: 26,
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color }} />
            {name}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
