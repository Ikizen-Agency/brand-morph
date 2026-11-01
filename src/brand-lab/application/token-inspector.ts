import { COLOR_ROLES, type BrandColors, type ColorRole } from "../domain/brands";
import { isHexColor } from "../domain/contrast";
import { kebab } from "../domain/exporters";
import {
  formatShadow,
  roleContrast,
  TYPE_STYLE_IDS,
  type TokenSet,
  type TypeFamily,
  type TypeStyleId,
} from "../domain/tokens";
import type { LabState } from "./lab-state";

export interface ColorRoleMeta {
  usage: string;
  group: "core" | "semantic";
}

/** What each role does. Names of hues would go false the moment a color is edited. */
export const COLOR_ROLE_META: Record<ColorRole, ColorRoleMeta> = {
  primary: { usage: "Core accent and CTA fill", group: "core" },
  onPrimary: { usage: "Text on primary", group: "core" },
  primaryContainer: { usage: "Active item backdrop", group: "core" },
  onPrimaryContainer: { usage: "Text on primary container", group: "core" },
  secondary: { usage: "Tertiary accent", group: "core" },
  surface: { usage: "Base canvas", group: "core" },
  surfaceContainer: { usage: "Floating cards", group: "core" },
  onSurface: { usage: "Primary text", group: "core" },
  muted: { usage: "Supporting text", group: "core" },
  border: { usage: "Hairline boundary", group: "core" },
  chrome: { usage: "Navigation and browser bars", group: "core" },
  success: { usage: "Positive states", group: "semantic" },
  warning: { usage: "Caution states", group: "semantic" },
  error: { usage: "Error states", group: "semantic" },
};

export function overrideCount(state: LabState): number {
  return Object.keys(state.overrides[state.brandId] ?? {}).length;
}

export function isRoleOverridden(state: LabState, role: ColorRole): boolean {
  return state.overrides[state.brandId]?.[role] !== undefined;
}

/** A normalized color for what a visitor typed, or null. A leading # is optional. */
export function parseHexInput(raw: string): string | null {
  const trimmed = raw.trim();
  const hex = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return isHexColor(hex) ? hex.toUpperCase() : null;
}

export const colorVariable = (role: ColorRole) => `--color-${kebab(role)}`;

export const colorDeclaration = (tokens: TokenSet, role: ColorRole) =>
  `${colorVariable(role)}: ${tokens.colors[role]};`;

export const radiusDeclaration = (tokens: TokenSet, name: keyof TokenSet["radii"]) =>
  `--radius-${kebab(name)}: ${tokens.radii[name]};`;

export const shadowDeclaration = (tokens: TokenSet, name: keyof TokenSet["shadows"]) =>
  `--${kebab(name)}: ${formatShadow(tokens.shadows[name])};`;

export const spacingDeclaration = (tokens: TokenSet, name: keyof TokenSet["spacing"]) =>
  `--space-${kebab(name)}: ${tokens.spacing[name]};`;

export function typeDeclaration(tokens: TokenSet, id: TypeStyleId): string {
  const { family, fontSize, lineHeight, letterSpacing, fontWeight } = tokens.typeScale[id];
  return [
    `font-family: ${tokens.fonts[family]};`,
    `font-size: ${fontSize}px;`,
    `line-height: ${lineHeight}px;`,
    `letter-spacing: ${letterSpacing}em;`,
    `font-weight: ${fontWeight};`,
  ].join(" ");
}

/** Every value the token set resolves to, the same set every export carries. */
export function tokenCount(tokens: TokenSet): number {
  const { colors, fonts, radii, shadows, spacing, typeScale } = tokens;
  return [colors, fonts, radii, shadows, spacing, typeScale].reduce(
    (total, group) => total + Object.keys(group).length,
    0,
  );
}

/** The geometric mean step between the smallest and the largest style. */
export function scaleRatio(tokens: TokenSet): number {
  const sizes = TYPE_STYLE_IDS.map((id) => tokens.typeScale[id].fontSize);
  const ratio = (Math.max(...sizes) / Math.min(...sizes)) ** (1 / (sizes.length - 1));
  return Number(ratio.toFixed(2));
}

export function typeWeights(tokens: TokenSet, family: TypeFamily): number[] {
  const weights = TYPE_STYLE_IDS.map((id) => tokens.typeScale[id])
    .filter((style) => style.family === family)
    .map((style) => style.fontWeight);
  return [...new Set(weights)].sort((a, b) => a - b);
}

/** How many role pairings that carry text reach AA. */
export function contrastSummary(colors: BrandColors): { passing: number; total: number } {
  const checks = COLOR_ROLES.map((role) => roleContrast(colors, role)).filter(
    (check) => check.hasTarget,
  );
  return { passing: checks.filter((check) => check.passesAA).length, total: checks.length };
}
