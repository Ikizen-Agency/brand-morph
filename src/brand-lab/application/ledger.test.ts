import { describe, expect, it } from "vitest";
import { initialLabState, labReducer } from "./lab-state";
import { describeLab, ledgerEntries, ledgerText } from "./ledger";

const value = (state: typeof initialLabState, name: string) =>
  ledgerEntries(state).find((entry) => entry.name === name)?.value;

describe("describeLab", () => {
  it("summarizes the brand and tuning in one line", () => {
    expect(describeLab(initialLabState)).toBe("Solace Health, comfortable, radius 24px, pill CTA");
  });
});

describe("ledgerEntries", () => {
  it("describes the active brand and its tuning", () => {
    expect(value(initialLabState, "--brand-primary")).toBe("#5E8271");
    expect(value(initialLabState, "--radius")).toBe("24px");
    expect(value(initialLabState, "--density")).toBe("comfortable");
    expect(value(initialLabState, "--btn")).toBe("pill");
  });

  it("follows every tuning change", () => {
    let state = labReducer(initialLabState, { type: "setDensity", density: "compact" });
    state = labReducer(state, { type: "setRadius", radius: "0px" });
    state = labReducer(state, { type: "setCta", cta: "block" });
    expect(value(state, "--density")).toBe("compact");
    expect(value(state, "--gap")).toBe("0.5rem");
    expect(value(state, "--radius")).toBe("0px");
    expect(value(state, "--btn")).toBe("block");
    expect(value(state, "--cta-radius")).toBe("0px");
  });

  it("reflects color overrides through the effective tokens", () => {
    const state = labReducer(initialLabState, {
      type: "setColorOverride",
      role: "primary",
      hex: "#123456",
    });
    expect(value(state, "--brand-primary")).toBe("#123456");
  });
});

describe("ledgerText", () => {
  it("prints one declaration per line", () => {
    const lines = ledgerText(initialLabState).split("\n");
    expect(lines).toHaveLength(ledgerEntries(initialLabState).length);
    expect(lines[0]).toBe("--brand-primary: #5E8271;");
  });
});
