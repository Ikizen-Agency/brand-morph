import { describe, expect, it } from "vitest";
import { COLOR_ROLES } from "../domain/brands";
import { initialLabState, labReducer, effectiveTokens, type LabState } from "./lab-state";
import {
  colorDeclaration,
  contrastSummary,
  COLOR_ROLE_META,
  isRoleOverridden,
  overrideCount,
  parseHexInput,
  radiusDeclaration,
  scaleRatio,
  shadowDeclaration,
  tokenCount,
  typeDeclaration,
  typeWeights,
} from "./token-inspector";

const solace = effectiveTokens(initialLabState);

const edit = (state: LabState, role: "primary" | "surface", hex: string) =>
  labReducer(state, { type: "setColorOverride", role, hex });

describe("overrides", () => {
  it("counts only the active brand", () => {
    const edited = edit(edit(initialLabState, "primary", "#112233"), "surface", "#445566");
    const orbit = labReducer(edited, { type: "selectBrand", brandId: "orbit" });
    expect(overrideCount(edited)).toBe(2);
    expect(overrideCount(orbit)).toBe(0);
    expect(isRoleOverridden(edited, "primary")).toBe(true);
    expect(isRoleOverridden(edited, "muted")).toBe(false);
    expect(isRoleOverridden(orbit, "primary")).toBe(false);
  });
});

describe("parseHexInput", () => {
  it.each([
    ["#aabbcc", "#AABBCC"],
    ["AABBCC", "#AABBCC"],
    ["  #5e8271 ", "#5E8271"],
  ])("normalizes %j", (raw, expected) => {
    expect(parseHexInput(raw)).toBe(expected);
  });

  it.each(["", "#", "#abc", "#abcd", "#gggggg", "#aabbccdd", "blue"])("rejects %j", (raw) => {
    expect(parseHexInput(raw)).toBeNull();
  });
});

describe("declarations", () => {
  it("match the CSS export names and values", () => {
    expect(colorDeclaration(solace, "primaryContainer")).toBe("--color-primary-container: #EBF1ED;");
    expect(radiusDeclaration(solace, "cta")).toBe("--radius-cta: 9999px;");
    expect(shadowDeclaration(solace, "elevation1")).toBe(
      "--elevation-1: 0px 2px 8px -2px rgba(29, 51, 40, 0.06);",
    );
    expect(typeDeclaration(solace, "display")).toBe(
      "font-family: 'Plus Jakarta Sans', sans-serif; font-size: 34px; line-height: 40px; letter-spacing: -0.025em; font-weight: 700;",
    );
  });
});

describe("computed labels", () => {
  it("counts every resolved token", () => {
    expect(tokenCount(solace)).toBe(
      COLOR_ROLES.length + /* fonts */ 2 + /* radii */ 6 + /* shadows */ 3 + /* spacing */ 2 + /* type */ 4,
    );
  });

  it("derives the scale ratio from the real sizes", () => {
    expect(scaleRatio(solace)).toBe(Number(Math.cbrt(34 / 12).toFixed(2)));
  });

  it("lists the weights each family really carries", () => {
    expect(typeWeights(solace, "heading")).toEqual([600, 700]);
    expect(typeWeights(solace, "body")).toEqual([400, 500]);
  });

  it("summarizes text contrast, ignoring decorative pairs", () => {
    const summary = contrastSummary(solace.colors);
    expect(summary.total).toBe(COLOR_ROLES.length - 1);
    expect(summary.passing).toBeLessThan(summary.total);
  });
});

describe("COLOR_ROLE_META", () => {
  it("describes every role and groups semantics together", () => {
    expect(Object.keys(COLOR_ROLE_META).sort()).toEqual([...COLOR_ROLES].sort());
    const semantic = COLOR_ROLES.filter((role) => COLOR_ROLE_META[role].group === "semantic");
    expect(semantic).toEqual(["success", "warning", "error"]);
  });
});
