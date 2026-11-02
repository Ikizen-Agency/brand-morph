import { describe, expect, it } from "vitest";
import { siteUrl } from "./site-url";

describe("siteUrl", () => {
  it("builds an https URL from the bare host Vercel provides", () => {
    expect(siteUrl("brand-morph.vercel.app")?.href).toBe("https://brand-morph.vercel.app/");
  });

  it("is undefined when the variable is missing or empty, so a local build still works", () => {
    expect(siteUrl(undefined)).toBeUndefined();
    expect(siteUrl("")).toBeUndefined();
  });

  it("is undefined for a value that is not a host", () => {
    expect(siteUrl("not a host")).toBeUndefined();
  });
});
