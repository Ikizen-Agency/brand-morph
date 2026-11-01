import { describe, expect, it } from "vitest";
import { BRAND_IDS, BRANDS } from "./brands";
import { AA_NORMAL_TEXT, checkContrast, contrastRatio, isHexColor } from "./contrast";

describe("contrastRatio", () => {
  it("returns 21 for black on white and 1 for identical colors", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#5E8271", "#5E8271")).toBeCloseTo(1, 5);
  });

  it("matches a known WCAG reference value", () => {
    expect(contrastRatio("#777777", "#FFFFFF")).toBeCloseTo(4.48, 2);
  });

  it("does not depend on argument order or hex case", () => {
    expect(contrastRatio("#0047ff", "#CCFF00")).toBeCloseTo(contrastRatio("#CCFF00", "#0047FF"), 10);
  });

  it("throws on anything that is not a six digit hex color", () => {
    expect(() => contrastRatio("red", "#FFFFFF")).toThrow(/hex/i);
    expect(() => contrastRatio("#FFF", "#FFFFFF")).toThrow(/hex/i);
  });
});

describe("isHexColor", () => {
  it("accepts six digit hex in either case and nothing else", () => {
    expect(isHexColor("#a1B2c3")).toBe(true);
    for (const value of ["a1b2c3", "#a1b2c", "#a1b2c3ff", "#ggGGgg", "", 12, null]) {
      expect(isHexColor(value)).toBe(false);
    }
  });
});

describe("checkContrast", () => {
  it("passes AA exactly at the threshold side and reports the ratio", () => {
    expect(checkContrast("#000000", "#FFFFFF")).toEqual({ ratio: 21, passesAA: true });
    const failing = checkContrast("#777777", "#FFFFFF");
    expect(failing.passesAA).toBe(false);
    expect(failing.ratio).toBeLessThan(AA_NORMAL_TEXT);
  });

  it("does not round a failing ratio up into a pass", () => {
    // #767676 on white is about 4.54, #777777 about 4.48: the verdict uses the raw ratio.
    expect(checkContrast("#767676", "#FFFFFF").passesAA).toBe(true);
    expect(checkContrast("#777777", "#FFFFFF").passesAA).toBe(false);
  });
});

describe("brand palettes", () => {
  it.each(BRAND_IDS)("%s passes AA for its text pairings", (id) => {
    const { colors } = BRANDS[id];
    expect(contrastRatio(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(colors.onSurface, colors.surface)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(colors.onSurface, colors.surfaceContainer)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(colors.muted, colors.surface)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(colors.muted, colors.surfaceContainer)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(colors.onPrimaryContainer, colors.primaryContainer)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
  });

  it("keeps the canonical primaries and a dark Orbit surface", () => {
    expect(BRANDS.solace.colors.primary).toBe("#5E8271");
    expect(BRANDS.orbit.colors.primary).toBe("#0047FF");
    expect(BRANDS.lumen.colors.primary).toBe("#2B1E70");
    expect(contrastRatio(BRANDS.orbit.colors.surface, "#000000")).toBeLessThan(2);
  });
});
