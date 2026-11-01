import type { BrandId, Shadow } from "./brands";
import { formatShadow, type TokenSet } from "./tokens";

type Entries = ReadonlyArray<readonly [name: string, value: string]>;

const kebab = (name: string) => name.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();

const kebabEntries = (group: object): Array<[string, string]> =>
  Object.entries(group).map(([name, value]) => [kebab(name), value as string]);

const shadowEntries = (tokens: TokenSet): Array<[string, string]> =>
  Object.entries(tokens.shadows).map(([name, shadow]) => [kebab(name), formatShadow(shadow)]);

function block(selector: string, sections: readonly Entries[]): string {
  const body = sections
    .map((entries) => entries.map(([name, value]) => `  --${name}: ${value};`).join("\n"))
    .join("\n\n");
  return `${selector} {\n${body}\n}\n`;
}

const prefixed = (prefix: string, entries: Entries): Entries =>
  entries.map(([name, value]) => [`${prefix}${name}`, value]);

export function toCssVariables(tokens: TokenSet): string {
  return block(":root", [
    prefixed("color-", kebabEntries(tokens.colors)),
    prefixed("font-", kebabEntries(tokens.fonts)),
    prefixed("radius-", kebabEntries(tokens.radii)),
    shadowEntries(tokens),
    prefixed("space-", kebabEntries(tokens.spacing)),
  ]);
}

export function toTailwindV4(tokens: TokenSet): string {
  return block("@theme", [
    prefixed("color-", kebabEntries(tokens.colors)),
    prefixed("font-", kebabEntries(tokens.fonts)),
    prefixed("radius-", kebabEntries(tokens.radii)),
    prefixed("shadow-", shadowEntries(tokens)),
    prefixed("spacing-", kebabEntries(tokens.spacing)),
  ]);
}

export function toTailwindV3(tokens: TokenSet): string {
  const extend = {
    colors: Object.fromEntries(kebabEntries(tokens.colors)),
    fontFamily: Object.fromEntries(Object.entries(tokens.fonts).map(([name, stack]) => [name, [stack]])),
    borderRadius: Object.fromEntries(kebabEntries(tokens.radii)),
    boxShadow: Object.fromEntries(shadowEntries(tokens)),
    spacing: Object.fromEntries(kebabEntries(tokens.spacing)),
  };
  return `module.exports = ${objectLiteral({ theme: { extend } })};\n`;
}

/** JSON with identifier keys unquoted, which is valid in both JavaScript and TypeScript. */
function objectLiteral(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/^(\s*)"([A-Za-z_$][\w$]*)":/gm, "$1$2:");
}

export function toTypeScript(tokens: TokenSet): string {
  const { brandId, ...rest } = tokens;
  return `export const ${brandId}Tokens = ${objectLiteral({ brandId, ...rest })} as const;\n`;
}

const alphaHex = (alpha: number) =>
  Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();

function dtcgShadow(shadow: Shadow) {
  return {
    color: `${shadow.color}${alphaHex(shadow.alpha)}`,
    offsetX: `${shadow.x}px`,
    offsetY: `${shadow.y}px`,
    blur: `${shadow.blur}px`,
    spread: `${shadow.spread}px`,
  };
}

function dtcgGroup<T>(group: object, type: string, toValue: (value: T) => unknown = (value) => value) {
  return Object.fromEntries(
    Object.entries(group).map(([name, value]) => [name, { $value: toValue(value as T), $type: type }]),
  );
}

export function toDtcgJson(tokens: TokenSet): string {
  const tree = {
    $description: `${tokens.brandName} design tokens`,
    color: dtcgGroup(tokens.colors, "color"),
    font: dtcgGroup(tokens.fonts, "fontFamily"),
    radius: dtcgGroup(tokens.radii, "dimension"),
    shadow: dtcgGroup(tokens.shadows, "shadow", dtcgShadow),
    spacing: dtcgGroup(tokens.spacing, "dimension"),
  };
  return `${JSON.stringify(tree, null, 2)}\n`;
}

export interface ExportFormat {
  id: "css" | "tailwind-v3" | "tailwind-v4" | "typescript" | "json";
  label: string;
  fileName: (brandId: BrandId) => string;
  render: (tokens: TokenSet) => string;
}

export const EXPORT_FORMATS: readonly ExportFormat[] = [
  { id: "css", label: "CSS", fileName: (id) => `tokens.${id}.css`, render: toCssVariables },
  {
    id: "tailwind-v3",
    label: "Tailwind v3",
    fileName: (id) => `tailwind.config.${id}.js`,
    render: toTailwindV3,
  },
  { id: "tailwind-v4", label: "Tailwind v4", fileName: (id) => `theme.${id}.css`, render: toTailwindV4 },
  { id: "typescript", label: "TypeScript", fileName: (id) => `tokens.${id}.ts`, render: toTypeScript },
  { id: "json", label: "JSON", fileName: (id) => `tokens.${id}.json`, render: toDtcgJson },
];

export function exportTokens(tokens: TokenSet, formatId: ExportFormat["id"]): string {
  const format = EXPORT_FORMATS.find((candidate) => candidate.id === formatId);
  if (!format) throw new Error(`Unknown export format: ${formatId}`);
  return format.render(tokens);
}
