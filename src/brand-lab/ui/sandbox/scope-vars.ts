import type { CSSProperties } from "react";
import { BRANDS, COLOR_ROLES, type FontRole } from "../../domain/brands";
import { kebab } from "../../domain/exporters";
import { formatShadow, type TokenSet } from "../../domain/tokens";

/** next/font hashes family names, so the scope maps a font role to its loaded variables. */
const FONT_STACKS: Record<FontRole, { heading: string; body: string }> = {
  sans: {
    heading: "var(--font-plus-jakarta-sans), sans-serif",
    body: "var(--font-inter), sans-serif",
  },
  mono: {
    heading: "var(--font-jetbrains-mono), ui-monospace, monospace",
    body: "var(--font-jetbrains-mono), ui-monospace, monospace",
  },
  serif: {
    heading: "var(--font-source-serif), Georgia, serif",
    body: "var(--font-source-serif), Georgia, serif",
  },
};

export type BrandScopeVars = Record<`--sb-${string}`, string> & CSSProperties;

export function brandScopeVars(tokens: TokenSet): BrandScopeVars {
  const fonts = FONT_STACKS[BRANDS[tokens.brandId].typography.role];
  const vars: BrandScopeVars = {
    "--sb-font-heading": fonts.heading,
    "--sb-font-body": fonts.body,
    "--sb-radius-sm": tokens.radii.sm,
    "--sb-radius-md": tokens.radii.md,
    "--sb-radius-lg": tokens.radii.lg,
    "--sb-radius-full": tokens.radii.full,
    "--sb-radius-surface": tokens.radii.surface,
    "--sb-radius-cta": tokens.radii.cta,
    "--sb-shadow-1": formatShadow(tokens.shadows.elevation1),
    "--sb-shadow-2": formatShadow(tokens.shadows.elevation2),
    "--sb-shadow-cta": formatShadow(tokens.shadows.elevationCta),
    "--sb-gap": tokens.spacing.gap,
    "--sb-pad": tokens.spacing.padding,
  };
  for (const role of COLOR_ROLES) {
    vars[`--sb-color-${kebab(role)}`] = tokens.colors[role];
  }
  return vars;
}
