import type { Brand, BrandColors, BrandId, ColorRole, Shadow } from "./brands";
import { checkContrast, hexToRgb, type ContrastCheck } from "./contrast";
import { CTA_RADIUS, DENSITY_SPACING, type CtaShape, type Tuning } from "./tuning";

export type ColorOverrides = Partial<Record<ColorRole, string>>;

/** The single source every exporter and contrast check reads from. */
export interface TokenSet {
  brandId: BrandId;
  brandName: string;
  colors: BrandColors;
  fonts: { heading: string; body: string };
  radii: { sm: string; md: string; lg: string; full: string; surface: string; cta: string };
  shadows: { elevation1: Shadow; elevation2: Shadow; elevationCta: Shadow };
  spacing: { gap: string; padding: string };
}

export function resolveColors(brand: Brand, overrides: ColorOverrides = {}): BrandColors {
  return { ...brand.colors, ...overrides };
}

function ctaShadow(shape: CtaShape, colors: BrandColors): Shadow {
  switch (shape) {
    case "pill":
      return { x: 0, y: 2, blur: 8, spread: 0, color: "#000000", alpha: 0.06 };
    case "sharp":
      return { x: 0, y: 0, blur: 0, spread: 0, color: "#000000", alpha: 0 };
    case "block":
      return { x: 3, y: 3, blur: 0, spread: 0, color: colors.secondary, alpha: 1 };
  }
}

export function resolveTokens(brand: Brand, tuning: Tuning, overrides: ColorOverrides = {}): TokenSet {
  const colors = resolveColors(brand, overrides);
  return {
    brandId: brand.id,
    brandName: brand.name,
    colors,
    fonts: { heading: brand.typography.heading, body: brand.typography.body },
    radii: { ...brand.radii, surface: tuning.radius, cta: CTA_RADIUS[tuning.cta] },
    shadows: { ...brand.elevation, elevationCta: ctaShadow(tuning.cta, colors) },
    spacing: { ...DENSITY_SPACING[tuning.density] },
  };
}

/** The family names of a CSS font stack, unquoted and in order. */
export function fontFamilies(stack: string): string[] {
  return stack.split(",").map((family) => family.trim().replace(/^['"]|['"]$/g, ""));
}

export function formatShadow(shadow: Shadow): string {
  if (shadow.alpha === 0) return "none";
  const [red, green, blue] = hexToRgb(shadow.color);
  const { x, y, blur, spread, alpha } = shadow;
  return `${x}px ${y}px ${blur}px ${spread}px rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

const TEXT_PAIRS: ReadonlyArray<readonly [foreground: ColorRole, background: ColorRole]> = [
  ["onPrimary", "primary"],
  ["onSurface", "surface"],
  ["onSurface", "surfaceContainer"],
  ["muted", "surface"],
  ["muted", "surfaceContainer"],
  ["onPrimaryContainer", "primaryContainer"],
];

export interface ColorPairCheck extends ContrastCheck {
  id: string;
  foreground: ColorRole;
  background: ColorRole;
}

/** Text pairings with their ratio and AA verdict, for a low contrast indicator. */
export function colorPairChecks(colors: BrandColors): ColorPairCheck[] {
  return TEXT_PAIRS.map(([foreground, background]) => ({
    id: `${foreground}/${background}`,
    foreground,
    background,
    ...checkContrast(colors[foreground], colors[background]),
  }));
}
