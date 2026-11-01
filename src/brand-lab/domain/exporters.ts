import type { BrandId, Shadow } from "./brands";
import { hexToRgb } from "./contrast";
import { fontFamilies, formatShadow, type TokenSet, type TypeStyle } from "./tokens";

type Entries = ReadonlyArray<readonly [name: string, value: string]>;

export const kebab = (name: string) => name.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();

const kebabEntries = (group: object): Array<[string, string]> =>
  Object.entries(group).map(([name, value]) => [kebab(name), value as string]);

const shadowEntries = (tokens: TokenSet): Array<[string, string]> =>
  Object.entries(tokens.shadows).map(([name, shadow]) => [kebab(name), formatShadow(shadow)]);

const typeEntries = (tokens: TokenSet): Array<[string, string]> =>
  Object.entries(tokens.typeScale).flatMap(([name, style]) => [
    [`text-${name}`, `${style.fontSize}px`],
    [`text-${name}--line-height`, `${style.lineHeight}px`],
    [`text-${name}--letter-spacing`, `${style.letterSpacing}em`],
    [`text-${name}--font-weight`, `${style.fontWeight}`],
  ]);

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
    typeEntries(tokens),
  ]);
}

export function toTailwindV4(tokens: TokenSet): string {
  return block("@theme", [
    prefixed("color-", kebabEntries(tokens.colors)),
    prefixed("font-", kebabEntries(tokens.fonts)),
    prefixed("radius-", kebabEntries(tokens.radii)),
    prefixed("shadow-", shadowEntries(tokens)),
    prefixed("spacing-", kebabEntries(tokens.spacing)),
    typeEntries(tokens),
  ]);
}

export function toTailwindV3(tokens: TokenSet): string {
  const extend = {
    colors: Object.fromEntries(kebabEntries(tokens.colors)),
    fontFamily: Object.fromEntries(Object.entries(tokens.fonts).map(([name, stack]) => [name, [stack]])),
    borderRadius: Object.fromEntries(kebabEntries(tokens.radii)),
    boxShadow: Object.fromEntries(shadowEntries(tokens)),
    spacing: Object.fromEntries(kebabEntries(tokens.spacing)),
    fontSize: Object.fromEntries(
      Object.entries(tokens.typeScale).map(([name, style]) => [
        name,
        [
          `${style.fontSize}px`,
          {
            lineHeight: `${style.lineHeight}px`,
            letterSpacing: `${style.letterSpacing}em`,
            fontWeight: `${style.fontWeight}`,
          },
        ],
      ]),
    ),
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

/** Four decimals are enough for every 8 bit channel to round trip exactly. */
const dtcgComponent = (channel: number) => Number((channel / 255).toFixed(4));

function dtcgColor(hex: string, alpha = 1) {
  return { colorSpace: "srgb", components: hexToRgb(hex).map(dtcgComponent), alpha, hex };
}

function dtcgDimension(css: string) {
  const match = /^(-?\d*\.?\d+)(px|rem)$/.exec(css);
  if (!match) throw new Error(`DTCG dimensions must use px or rem, received: ${css}`);
  return { value: Number(match[1]), unit: match[2] };
}

const px = (value: number) => ({ value, unit: "px" });

function dtcgShadow(shadow: Shadow) {
  return {
    color: dtcgColor(shadow.color, shadow.alpha),
    offsetX: px(shadow.x),
    offsetY: px(shadow.y),
    blur: px(shadow.blur),
    spread: px(shadow.spread),
  };
}

/** The format allows only px and rem letter spacing, and a line height is a multiplier. */
const dtcgTypography = (fonts: TokenSet["fonts"]) => (style: TypeStyle) => ({
  fontFamily: fontFamilies(fonts[style.family]),
  fontSize: px(style.fontSize),
  fontWeight: style.fontWeight,
  letterSpacing: px(Number((style.letterSpacing * style.fontSize).toFixed(3))),
  lineHeight: Number((style.lineHeight / style.fontSize).toFixed(4)),
});

function dtcgGroup<T>(group: object, type: string, toValue: (value: T) => unknown) {
  return Object.fromEntries(
    Object.entries(group).map(([name, value]) => [name, { $type: type, $value: toValue(value as T) }]),
  );
}

/** The Design Tokens Format Module 2025.10: https://www.designtokens.org/tr/2025.10/format/ */
export function toDtcgJson(tokens: TokenSet): string {
  const tree = {
    $description: `${tokens.brandName} design tokens`,
    color: dtcgGroup(tokens.colors, "color", dtcgColor),
    font: dtcgGroup(tokens.fonts, "fontFamily", fontFamilies),
    radius: dtcgGroup(tokens.radii, "dimension", dtcgDimension),
    shadow: dtcgGroup(tokens.shadows, "shadow", dtcgShadow),
    spacing: dtcgGroup(tokens.spacing, "dimension", dtcgDimension),
    typography: dtcgGroup(tokens.typeScale, "typography", dtcgTypography(tokens.fonts)),
  };
  return `${JSON.stringify(tree, null, 2)}\n`;
}

export interface ExportFormat {
  id: "css" | "tailwind-v3" | "tailwind-v4" | "typescript" | "json";
  label: string;
  fileName: (brandId: BrandId) => string;
  mimeType: string;
  render: (tokens: TokenSet) => string;
}

export const EXPORT_FORMATS: readonly ExportFormat[] = [
  {
    id: "css",
    label: "CSS",
    fileName: (id) => `tokens.${id}.css`,
    mimeType: "text/css",
    render: toCssVariables,
  },
  {
    id: "tailwind-v3",
    label: "Tailwind v3",
    fileName: (id) => `tailwind.config.${id}.js`,
    mimeType: "text/javascript",
    render: toTailwindV3,
  },
  {
    id: "tailwind-v4",
    label: "Tailwind v4",
    fileName: (id) => `theme.${id}.css`,
    mimeType: "text/css",
    render: toTailwindV4,
  },
  {
    id: "typescript",
    label: "TypeScript",
    fileName: (id) => `tokens.${id}.ts`,
    // TypeScript has no registered media type, so the file is served as what it is: text.
    mimeType: "text/plain",
    render: toTypeScript,
  },
  {
    id: "json",
    label: "DTCG JSON",
    fileName: (id) => `${id}.tokens.json`,
    mimeType: "application/design-tokens+json",
    render: toDtcgJson,
  },
];

/** Every format in one text, each under its filename. */
export function exportAll(tokens: TokenSet): string {
  return EXPORT_FORMATS.map(
    (format) => `--- ${format.fileName(tokens.brandId)} ---\n${format.render(tokens)}`,
  ).join("\n");
}

export function exportTokens(tokens: TokenSet, formatId: ExportFormat["id"]): string {
  const format = EXPORT_FORMATS.find((candidate) => candidate.id === formatId);
  if (!format) throw new Error(`Unknown export format: ${formatId}`);
  return format.render(tokens);
}
