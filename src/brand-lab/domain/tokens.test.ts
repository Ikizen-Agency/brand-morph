import { describe, expect, it } from "vitest";
import { BRANDS, type BrandColors } from "./brands";
import { contrastRatio } from "./contrast";
import { colorPairChecks, fontFamilies, formatShadow, resolveColors, resolveTokens } from "./tokens";
import { brandDefaultTuning } from "./tuning";

describe("resolveColors", () => {
  it("returns the brand colors when there are no overrides", () => {
    expect(resolveColors(BRANDS.lumen)).toEqual(BRANDS.lumen.colors);
  });

  it("lays overrides over the brand without mutating it", () => {
    const before = BRANDS.solace.colors.primary;
    const colors = resolveColors(BRANDS.solace, { primary: "#112233" });
    expect(colors.primary).toBe("#112233");
    expect(colors.surface).toBe(BRANDS.solace.colors.surface);
    expect(BRANDS.solace.colors.primary).toBe(before);
  });
});

describe("resolveTokens", () => {
  it("derives surface radius, CTA radius and spacing from the tuning", () => {
    const tokens = resolveTokens(BRANDS.solace, { density: "compact", radius: "12px", cta: "sharp" });
    expect(tokens.radii.surface).toBe("12px");
    expect(tokens.radii.cta).toBe("6px");
    expect(tokens.spacing).toEqual({ gap: "0.5rem", padding: "0.5rem" });
  });

  it("uses comfortable spacing and pill geometry for Solace defaults", () => {
    const tokens = resolveTokens(BRANDS.solace, brandDefaultTuning("solace"));
    expect(tokens.radii.cta).toBe("9999px");
    expect(tokens.spacing).toEqual({ gap: "1.5rem", padding: "0.875rem" });
  });

  it("casts the block CTA shadow in the effective secondary color", () => {
    const tuning = brandDefaultTuning("orbit");
    expect(formatShadow(resolveTokens(BRANDS.orbit, tuning).shadows.elevationCta)).toBe(
      "3px 3px 0px 0px rgba(204, 255, 0, 1)",
    );
    const edited = resolveTokens(BRANDS.orbit, tuning, { secondary: "#102030" });
    expect(formatShadow(edited.shadows.elevationCta)).toBe("3px 3px 0px 0px rgba(16, 32, 48, 1)");
  });

  it("carries overrides into the color tokens", () => {
    const tokens = resolveTokens(BRANDS.orbit, brandDefaultTuning("orbit"), { surface: "#222222" });
    expect(tokens.colors.surface).toBe("#222222");
  });
});

describe("formatShadow", () => {
  it("collapses an empty shadow to none", () => {
    const tokens = resolveTokens(BRANDS.lumen, brandDefaultTuning("lumen"));
    expect(formatShadow(tokens.shadows.elevationCta)).toBe("none");
  });

  it("renders alpha as rgba", () => {
    expect(formatShadow(BRANDS.solace.elevation.elevation1)).toBe(
      "0px 2px 8px -2px rgba(29, 51, 40, 0.06)",
    );
  });
});

describe("colorPairChecks", () => {
  it("reports ratio and AA verdict from the effective colors", () => {
    const colors: BrandColors = { ...BRANDS.solace.colors, primary: "#FFFFFF", onPrimary: "#FFFFFF" };
    const pair = colorPairChecks(colors).find((check) => check.id === "onPrimary/primary");
    expect(pair).toMatchObject({ foreground: "onPrimary", background: "primary", ratio: 1, passesAA: false });
  });

  it("agrees with contrastRatio and passes on every stock Lumen pairing", () => {
    const checks = colorPairChecks(BRANDS.lumen.colors);
    expect(checks.length).toBeGreaterThanOrEqual(5);
    for (const check of checks) {
      const { colors } = BRANDS.lumen;
      expect(check.ratio).toBeCloseTo(contrastRatio(colors[check.foreground], colors[check.background]), 1);
      expect(check.passesAA).toBe(true);
    }
  });
});

describe("fontFamilies", () => {
  it("splits a CSS stack and strips quotes", () => {
    expect(fontFamilies("'Plus Jakarta Sans', sans-serif")).toEqual(["Plus Jakarta Sans", "sans-serif"]);
    expect(fontFamilies('"Source Serif 4", Georgia, serif')).toEqual(["Source Serif 4", "Georgia", "serif"]);
  });
});
