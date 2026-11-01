import { describe, expect, it } from "vitest";
import { BRANDS } from "../domain/brands";
import { brandDefaultTuning } from "../domain/tuning";
import {
  effectiveTokens,
  initialLabState,
  labReducer,
  parseLabState,
  serializeLabState,
  type LabState,
} from "./lab-state";

const orbit = labReducer(initialLabState, { type: "selectBrand", brandId: "orbit" });

describe("labReducer", () => {
  it("starts on Solace with its archetype tuning and no overrides", () => {
    expect(initialLabState).toEqual({
      brandId: "solace",
      tuning: brandDefaultTuning("solace"),
      overrides: {},
    });
  });

  it("selectBrand adopts the archetype tuning of the new brand", () => {
    expect(orbit.brandId).toBe("orbit");
    expect(orbit.tuning).toEqual({ density: "compact", radius: "0px", cta: "block" });
  });

  it("selectBrand keeps overrides per brand", () => {
    const edited = labReducer(orbit, { type: "setColorOverride", role: "primary", hex: "#112233" });
    const away = labReducer(edited, { type: "selectBrand", brandId: "lumen" });
    expect(effectiveTokens(away).colors.primary).toBe(BRANDS.lumen.colors.primary);
    const back = labReducer(away, { type: "selectBrand", brandId: "orbit" });
    expect(effectiveTokens(back).colors.primary).toBe("#112233");
  });

  it("sets each tuning value without touching the others", () => {
    expect(labReducer(orbit, { type: "setDensity", density: "comfortable" }).tuning).toEqual({
      ...orbit.tuning,
      density: "comfortable",
    });
    expect(labReducer(orbit, { type: "setRadius", radius: "24px" }).tuning.radius).toBe("24px");
    expect(labReducer(orbit, { type: "setCta", cta: "pill" }).tuning.cta).toBe("pill");
  });

  it("setColorOverride stores normalized hex for the active brand only", () => {
    const next = labReducer(orbit, { type: "setColorOverride", role: "surface", hex: "#aabbcc" });
    expect(next.overrides).toEqual({ orbit: { surface: "#AABBCC" } });
  });

  it("setColorOverride accepts a color that fails contrast", () => {
    const next = labReducer(orbit, { type: "setColorOverride", role: "onSurface", hex: "#111111" });
    expect(effectiveTokens(next).colors.onSurface).toBe("#111111");
  });

  it("setColorOverride ignores malformed hex and unknown roles", () => {
    expect(labReducer(orbit, { type: "setColorOverride", role: "primary", hex: "blue" })).toBe(orbit);
    expect(
      labReducer(orbit, { type: "setColorOverride", role: "__proto__" as "primary", hex: "#112233" }),
    ).toBe(orbit);
  });

  it("clearColorOverrides clears the active brand and leaves other brands alone", () => {
    const state: LabState = {
      ...orbit,
      overrides: { orbit: { primary: "#111111" }, lumen: { primary: "#222222" } },
    };
    expect(labReducer(state, { type: "clearColorOverrides" }).overrides).toEqual({
      lumen: { primary: "#222222" },
    });
  });

  it("autoMatch restores the active archetype and clears its overrides", () => {
    const state: LabState = {
      brandId: "lumen",
      tuning: { density: "compact", radius: "0px", cta: "pill" },
      overrides: { lumen: { primary: "#111111" } },
    };
    expect(labReducer(state, { type: "autoMatch" })).toEqual({
      brandId: "lumen",
      tuning: brandDefaultTuning("lumen"),
      overrides: {},
    });
  });

  it("reset returns to the initial state and clears every override", () => {
    const state: LabState = {
      ...orbit,
      overrides: { orbit: { primary: "#111111" }, lumen: { primary: "#222222" } },
    };
    expect(labReducer(state, { type: "reset" })).toEqual(initialLabState);
  });
});

describe("effectiveTokens", () => {
  it("resolves brand, tuning and overrides together", () => {
    const state = labReducer(orbit, { type: "setColorOverride", role: "primary", hex: "#112233" });
    const tokens = effectiveTokens(state);
    expect(tokens.brandId).toBe("orbit");
    expect(tokens.colors.primary).toBe("#112233");
    expect(tokens.radii.surface).toBe("0px");
  });
});

describe("parseLabState", () => {
  const valid = {
    brandId: "lumen",
    tuning: { density: "compact", radius: "12px", cta: "sharp" },
    overrides: { lumen: { primary: "#112233" } },
  };
  const parse = (value: unknown) => parseLabState(JSON.stringify(value));

  it("round trips a serialized state", () => {
    const state = labReducer(orbit, { type: "setColorOverride", role: "border", hex: "#123456" });
    expect(parseLabState(serializeLabState(state))).toEqual(state);
  });

  it("accepts a valid state and normalizes hex", () => {
    expect(parse({ ...valid, overrides: { lumen: { primary: "#aabbcc" } } })?.overrides).toEqual({
      lumen: { primary: "#AABBCC" },
    });
  });

  it("rejects null, invalid JSON and non objects", () => {
    expect(parseLabState(null)).toBeNull();
    expect(parseLabState("{not json")).toBeNull();
    expect(parse([])).toBeNull();
    expect(parse("solace")).toBeNull();
    expect(parse(null)).toBeNull();
  });

  it.each([
    ["unknown brand", { ...valid, brandId: "acme" }],
    ["prototype brand", { ...valid, brandId: "constructor" }],
    ["unknown density", { ...valid, tuning: { ...valid.tuning, density: "airy" } }],
    ["unknown radius", { ...valid, tuning: { ...valid.tuning, radius: "7px" } }],
    ["unknown cta", { ...valid, tuning: { ...valid.tuning, cta: "round" } }],
    ["missing tuning", { brandId: "lumen", overrides: {} }],
    ["missing overrides", { brandId: "lumen", tuning: valid.tuning }],
    ["array overrides", { ...valid, overrides: [] }],
    ["unknown override brand", { ...valid, overrides: { acme: { primary: "#112233" } } }],
    ["unknown role", { ...valid, overrides: { lumen: { sparkle: "#112233" } } }],
    ["non hex value", { ...valid, overrides: { lumen: { primary: "red" } } }],
    ["short hex value", { ...valid, overrides: { lumen: { primary: "#123" } } }],
    ["non string value", { ...valid, overrides: { lumen: { primary: 5 } } }],
    ["array role map", { ...valid, overrides: { lumen: ["#112233"] } }],
  ])("rejects %s", (_label, value) => {
    expect(parse(value)).toBeNull();
  });

  it("rejects a __proto__ role key from raw JSON", () => {
    const raw =
      '{"brandId":"lumen","tuning":{"density":"compact","radius":"12px","cta":"sharp"},' +
      '"overrides":{"lumen":{"__proto__":"#112233"}}}';
    expect(parseLabState(raw)).toBeNull();
  });
});
