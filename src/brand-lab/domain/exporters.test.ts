import { describe, expect, it } from "vitest";
import { BRAND_IDS, BRANDS, COLOR_ROLES } from "./brands";
import {
  EXPORT_FORMATS,
  exportTokens,
  toCssVariables,
  toDtcgJson,
  toTailwindV3,
  toTailwindV4,
  toTypeScript,
} from "./exporters";
import { resolveTokens, type TokenSet } from "./tokens";
import { brandDefaultTuning } from "./tuning";

const tokensFor = (id: (typeof BRAND_IDS)[number]) => resolveTokens(BRANDS[id], brandDefaultTuning(id));

function evaluateTailwindConfig(source: string) {
  const commonJs = { exports: {} as { theme: { extend: Record<string, Record<string, unknown>> } } };
  new Function("module", source)(commonJs);
  return commonJs.exports.theme.extend;
}

function evaluateTypeScript(source: string): TokenSet {
  const body = source.replace(/^export const \w+ = /, "return ").replace(/ as const;\s*$/, ";");
  return new Function(body)() as TokenSet;
}

describe("toCssVariables", () => {
  it("emits every token as a custom property", () => {
    const css = toCssVariables(tokensFor("solace"));
    expect(css.startsWith(":root {")).toBe(true);
    expect(css).toContain("--color-primary: #5E8271;");
    expect(css).toContain("--color-primary-container: #EBF1ED;");
    expect(css).toContain("--radius-lg: 24px;");
    expect(css).toContain("--radius-cta: 9999px;");
    expect(css).toContain("--elevation-1: 0px 2px 8px -2px rgba(29, 51, 40, 0.06);");
    expect(css).toContain("--space-gap: 1.5rem;");
    expect(css).toContain("--font-heading: 'Plus Jakarta Sans', sans-serif;");
  });
});

describe("toTailwindV3", () => {
  it("is an evaluable config carrying the token set", () => {
    const tokens = tokensFor("orbit");
    const extend = evaluateTailwindConfig(toTailwindV3(tokens));
    expect(extend.colors.primary).toBe("#0047FF");
    expect(extend.colors["on-primary"]).toBe("#CCFF00");
    expect(extend.borderRadius.cta).toBe("0px");
    expect(extend.boxShadow["elevation-cta"]).toBe("3px 3px 0px 0px rgba(204, 255, 0, 1)");
    expect(extend.fontFamily.heading).toEqual([tokens.fonts.heading]);
    expect(extend.spacing.gap).toBe("0.5rem");
  });
});

describe("toTailwindV4", () => {
  it("uses the v4 theme namespaces", () => {
    const theme = toTailwindV4(tokensFor("lumen"));
    expect(theme.startsWith("@theme {")).toBe(true);
    expect(theme).toContain("--color-primary: #2B1E70;");
    expect(theme).toContain("--shadow-elevation-1:");
    expect(theme).toContain("--radius-cta: 6px;");
    expect(theme).toContain("--spacing-gap: 1.5rem;");
    expect(theme).not.toContain("--elevation-1:");
  });
});

describe("toTypeScript", () => {
  it("is an evaluable const object named after the brand", () => {
    const tokens = tokensFor("lumen");
    const source = toTypeScript(tokens);
    expect(source).toMatch(/^export const lumenTokens = \{/);
    expect(source.trimEnd().endsWith("} as const;")).toBe(true);
    expect(evaluateTypeScript(source).colors).toEqual(tokens.colors);
  });
});

describe("toDtcgJson", () => {
  it("wraps every token in $value and $type", () => {
    const tree = JSON.parse(toDtcgJson(tokensFor("solace")));
    expect(tree.color.primary).toEqual({ $value: "#5E8271", $type: "color" });
    expect(Object.keys(tree.color).sort()).toEqual([...COLOR_ROLES].sort());
    expect(tree.font.heading.$type).toBe("fontFamily");
    expect(tree.radius.sm).toEqual({ $value: "8px", $type: "dimension" });
    expect(tree.spacing.gap).toEqual({ $value: "1.5rem", $type: "dimension" });
  });

  it("emits shadows as composite values with alpha in the color", () => {
    const { elevation1 } = JSON.parse(toDtcgJson(tokensFor("solace"))).shadow;
    expect(elevation1.$type).toBe("shadow");
    expect(elevation1.$value).toEqual({
      color: "#1D33280F",
      offsetX: "0px",
      offsetY: "2px",
      blur: "8px",
      spread: "-2px",
    });
  });
});

describe("exportTokens", () => {
  it.each(BRAND_IDS)("every format carries every %s color from the one source", (id) => {
    const tokens = resolveTokens(BRANDS[id], brandDefaultTuning(id), { error: "#ABCDEF" });
    for (const format of EXPORT_FORMATS) {
      const output = exportTokens(tokens, format.id);
      for (const role of COLOR_ROLES) {
        expect(output, `${format.id} ${role}`).toContain(tokens.colors[role]);
      }
      expect(output).toContain("#ABCDEF");
      expect(output).toContain(tokens.radii.lg);
    }
  });

  it("gives each format a download filename for the brand", () => {
    expect(EXPORT_FORMATS.map((format) => format.fileName("orbit"))).toEqual([
      "tokens.orbit.css",
      "tailwind.config.orbit.js",
      "theme.orbit.css",
      "tokens.orbit.ts",
      "tokens.orbit.json",
    ]);
  });
});
