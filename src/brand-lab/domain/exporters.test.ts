import { describe, expect, it } from "vitest";
import { BRAND_IDS, BRANDS, COLOR_ROLES } from "./brands";
import {
  EXPORT_FORMATS,
  exportAll,
  exportTokens,
  toCssVariables,
  toDtcgJson,
  toTailwindV3,
  toTailwindV4,
  toTypeScript,
} from "./exporters";
import { hexToRgb } from "./contrast";
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
    expect(css).toContain("--text-display: 34px;");
    expect(css).toContain("--text-display--line-height: 40px;");
    expect(css).toContain("--text-display--letter-spacing: -0.025em;");
    expect(css).toContain("--text-display--font-weight: 700;");
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
    expect(extend.fontSize.body).toEqual([
      "14px",
      { lineHeight: "22px", letterSpacing: "-0.006em", fontWeight: "400" },
    ]);
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
    expect(theme).toContain("--text-caption: 12px;");
    expect(theme).toContain("--text-caption--line-height: 16px;");
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
  const tree = (id: (typeof BRAND_IDS)[number] = "solace") => JSON.parse(toDtcgJson(tokensFor(id)));

  it("emits structured sRGB colors with a six digit hex fallback", () => {
    expect(tree().color.primary).toEqual({
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.3686, 0.5098, 0.4431],
        alpha: 1,
        hex: "#5E8271",
      },
    });
    expect(Object.keys(tree().color).sort()).toEqual([...COLOR_ROLES].sort());
  });

  it.each(BRAND_IDS)("%s color components round trip to the same 8 bit channels", (id) => {
    const { color } = tree(id);
    for (const role of COLOR_ROLES) {
      const { components, hex } = color[role].$value;
      const channels = components.map((value: number) => Math.round(value * 255));
      expect(channels, role).toEqual(hexToRgb(hex));
    }
  });

  it("emits dimensions as a numeric value and a unit", () => {
    expect(tree().radius.sm).toEqual({ $type: "dimension", $value: { value: 8, unit: "px" } });
    expect(tree().radius.full.$value).toEqual({ value: 9999, unit: "px" });
    expect(tree().spacing.gap).toEqual({ $type: "dimension", $value: { value: 1.5, unit: "rem" } });
  });

  it("emits font families as an array of unquoted names", () => {
    expect(tree().font.heading).toEqual({
      $type: "fontFamily",
      $value: ["Plus Jakarta Sans", "sans-serif"],
    });
    expect(tree("orbit").font.body.$value).toEqual(["JetBrains Mono", "ui-monospace", "monospace"]);
  });

  it("emits shadows with structured color and dimensions", () => {
    expect(tree().shadow.elevation1).toEqual({
      $type: "shadow",
      $value: {
        color: { colorSpace: "srgb", components: [0.1137, 0.2, 0.1569], alpha: 0.06, hex: "#1D3328" },
        offsetX: { value: 0, unit: "px" },
        offsetY: { value: 2, unit: "px" },
        blur: { value: 8, unit: "px" },
        spread: { value: -2, unit: "px" },
      },
    });
  });

  it("emits the type scale as typography composites in the units the format allows", () => {
    expect(tree("lumen").typography.display).toEqual({
      $type: "typography",
      $value: {
        fontFamily: ["Source Serif 4", "Georgia", "serif"],
        fontSize: { value: 34, unit: "px" },
        fontWeight: 700,
        letterSpacing: { value: -0.85, unit: "px" },
        lineHeight: 1.1765,
      },
    });
  });

  it("uses no name the format reserves", () => {
    const names: string[] = [];
    const walk = (node: Record<string, unknown>) => {
      for (const [name, child] of Object.entries(node)) {
        if (name.startsWith("$")) continue;
        names.push(name);
        walk(child as Record<string, unknown>);
      }
    };
    const { color, font, radius, shadow, spacing, typography } = tree();
    walk({ color, font, radius, shadow, spacing, typography });
    expect(names.filter((name) => /[{}.]/.test(name))).toEqual([]);
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
    }
  });

  it("gives each format a download filename and media type", () => {
    expect(
      EXPORT_FORMATS.map((format) => [format.label, format.fileName("orbit"), format.mimeType]),
    ).toEqual([
      ["CSS", "tokens.orbit.css", "text/css"],
      ["Tailwind v3", "tailwind.config.orbit.js", "text/javascript"],
      ["Tailwind v4", "theme.orbit.css", "text/css"],
      ["TypeScript", "tokens.orbit.ts", "text/plain"],
      ["DTCG JSON", "orbit.tokens.json", "application/design-tokens+json"],
    ]);
  });

  it("bundles every format under its own filename", () => {
    const tokens = tokensFor("lumen");
    const bundle = exportAll(tokens);
    for (const format of EXPORT_FORMATS) {
      expect(bundle).toContain(`--- ${format.fileName("lumen")} ---`);
      expect(bundle).toContain(format.render(tokens));
    }
  });
});
