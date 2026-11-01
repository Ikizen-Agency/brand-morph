import { describe, expect, it } from "vitest";
import { BRAND_IDS, BRANDS, COLOR_ROLES } from "../../domain/brands";
import { resolveTokens } from "../../domain/tokens";
import { brandDefaultTuning } from "../../domain/tuning";
import { brandScopeVars } from "./scope-vars";

const tokensFor = (id: (typeof BRAND_IDS)[number], overrides = {}) =>
  resolveTokens(BRANDS[id], brandDefaultTuning(id), overrides);

describe("brandScopeVars", () => {
  it.each(BRAND_IDS)("exposes every color role for %s", (id) => {
    const vars = brandScopeVars(tokensFor(id));
    expect(Object.keys(vars).filter((name) => name.startsWith("--sb-color-"))).toHaveLength(
      COLOR_ROLES.length,
    );
  });

  it("uses kebab case names and applies overrides", () => {
    const vars = brandScopeVars(tokensFor("solace", { onPrimaryContainer: "#010203" }));
    expect(vars["--sb-color-on-primary-container"]).toBe("#010203");
  });

  it("maps density, radius and CTA tokens", () => {
    const vars = brandScopeVars(tokensFor("orbit"));
    expect(vars["--sb-gap"]).toBe("0.5rem");
    expect(vars["--sb-pad"]).toBe("0.5rem");
    expect(vars["--sb-radius-surface"]).toBe("0px");
    expect(vars["--sb-radius-cta"]).toBe("0px");
    expect(vars["--sb-shadow-cta"]).toContain("3px 3px 0px 0px");
  });

  it("maps each brand to its self-hosted font variables", () => {
    expect(brandScopeVars(tokensFor("solace"))["--sb-font-heading"]).toContain("--font-plus-jakarta-sans");
    expect(brandScopeVars(tokensFor("solace"))["--sb-font-body"]).toContain("--font-inter");
    expect(brandScopeVars(tokensFor("orbit"))["--sb-font-heading"]).toContain("--font-jetbrains-mono");
    expect(brandScopeVars(tokensFor("lumen"))["--sb-font-body"]).toContain("--font-source-serif");
  });
});
