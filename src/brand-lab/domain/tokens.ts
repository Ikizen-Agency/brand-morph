import type { Brand, BrandColors, BrandId, ColorRole, Shadow } from "./brands";
import { checkContrast, hexToRgb, type ContrastCheck } from "./contrast";
import { CTA_RADIUS, DENSITY_SPACING, type CtaShape, type Tuning } from "./tuning";

export type ColorOverrides = Partial<Record<ColorRole, string>>;

export const TYPE_STYLE_IDS = ["display", "heading", "body", "caption"] as const;
export type TypeStyleId = (typeof TYPE_STYLE_IDS)[number];
export type TypeFamily = keyof TokenSet["fonts"];

export interface TypeStyle {
  family: TypeFamily;
  /** Pixels. */
  fontSize: number;
  /** Pixels. */
  lineHeight: number;
  /** Em, so tracking scales with the size. */
  letterSpacing: number;
  fontWeight: number;
}

/** One scale for every brand. Only the family behind it morphs. */
const TYPE_SCALE: Record<TypeStyleId, TypeStyle> = {
  display: { family: "heading", fontSize: 34, lineHeight: 40, letterSpacing: -0.025, fontWeight: 700 },
  heading: { family: "heading", fontSize: 22, lineHeight: 28, letterSpacing: -0.015, fontWeight: 600 },
  body: { family: "body", fontSize: 14, lineHeight: 22, letterSpacing: -0.006, fontWeight: 400 },
  caption: { family: "body", fontSize: 12, lineHeight: 16, letterSpacing: 0.05, fontWeight: 500 },
};

/** The single source every exporter and contrast check reads from. */
export interface TokenSet {
  brandId: BrandId;
  brandName: string;
  colors: BrandColors;
  fonts: { heading: string; body: string };
  radii: { sm: string; md: string; lg: string; full: string; surface: string; cta: string };
  shadows: { elevation1: Shadow; elevation2: Shadow; elevationCta: Shadow };
  spacing: { gap: string; padding: string };
  typeScale: Record<TypeStyleId, TypeStyle>;
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
    typeScale: TYPE_SCALE,
  };
}

/** The family names of a CSS font stack, unquoted and in order. */
export function fontFamilies(stack: string): string[] {
  return stack.split(",").map((family) => family.trim().replace(/^['"]|['"]$/g, ""));
}

export function formatTypeSpec(style: TypeStyle): string {
  const { fontSize, lineHeight, letterSpacing, fontWeight } = style;
  return `${fontSize}px / ${lineHeight}px / ${letterSpacing}em / ${fontWeight}`;
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

type RolePair = readonly [foreground: ColorRole, background: ColorRole];

/** The pairing that decides whether a role is readable where the UI really uses it. */
const ROLE_PAIRS: Record<ColorRole, RolePair> = {
  primary: ["onPrimary", "primary"],
  onPrimary: ["onPrimary", "primary"],
  primaryContainer: ["onPrimaryContainer", "primaryContainer"],
  onPrimaryContainer: ["onPrimaryContainer", "primaryContainer"],
  secondary: ["secondary", "surface"],
  surface: ["onSurface", "surface"],
  surfaceContainer: ["onSurface", "surfaceContainer"],
  onSurface: ["onSurface", "surface"],
  muted: ["muted", "surface"],
  border: ["border", "surface"],
  chrome: ["onSurface", "chrome"],
  success: ["success", "surfaceContainer"],
  warning: ["warning", "surfaceContainer"],
  error: ["error", "surfaceContainer"],
};

/** Hairlines carry no text and are decorative, so WCAG sets them no minimum. */
const DECORATIVE_ROLES: readonly ColorRole[] = ["border"];

export interface ColorPairCheck extends ContrastCheck {
  id: string;
  foreground: ColorRole;
  background: ColorRole;
}

export interface RoleContrast extends ColorPairCheck {
  /** False when no AA minimum applies, so passesAA means nothing. */
  hasTarget: boolean;
}

export function roleContrast(colors: BrandColors, role: ColorRole): RoleContrast {
  const [foreground, background] = ROLE_PAIRS[role];
  return {
    id: `${foreground}/${background}`,
    foreground,
    background,
    hasTarget: !DECORATIVE_ROLES.includes(role),
    ...checkContrast(colors[foreground], colors[background]),
  };
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
