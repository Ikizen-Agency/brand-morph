import type { BrandId } from "./brands";

export const DENSITIES = ["comfortable", "compact"] as const;
export type Density = (typeof DENSITIES)[number];

export const RADIUS_SCALES = ["24px", "12px", "0px"] as const;
export type RadiusScale = (typeof RADIUS_SCALES)[number];

export const CTA_SHAPES = ["pill", "sharp", "block"] as const;
export type CtaShape = (typeof CTA_SHAPES)[number];

export interface Tuning {
  density: Density;
  radius: RadiusScale;
  cta: CtaShape;
}

const BRAND_DEFAULT_TUNING: Record<BrandId, Tuning> = {
  solace: { density: "comfortable", radius: "24px", cta: "pill" },
  orbit: { density: "compact", radius: "0px", cta: "block" },
  lumen: { density: "comfortable", radius: "12px", cta: "sharp" },
};

export function brandDefaultTuning(id: BrandId): Tuning {
  return { ...BRAND_DEFAULT_TUNING[id] };
}

export const DENSITY_SPACING: Record<Density, { gap: string; padding: string }> = {
  comfortable: { gap: "1.5rem", padding: "0.875rem" },
  compact: { gap: "0.5rem", padding: "0.5rem" },
};

export const CTA_RADIUS: Record<CtaShape, string> = {
  pill: "9999px",
  sharp: "6px",
  block: "0px",
};
