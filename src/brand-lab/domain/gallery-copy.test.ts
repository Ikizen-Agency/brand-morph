import { describe, expect, it } from "vitest";
import { BRAND_IDS } from "./brands";
import { GALLERY_COPY } from "./gallery-copy";

const text = (id: (typeof BRAND_IDS)[number]) => JSON.stringify(GALLERY_COPY[id]);

describe("GALLERY_COPY", () => {
  it.each(["orbit", "lumen"] as const)("keeps clinical language out of %s", (id) => {
    expect(text(id)).not.toMatch(/hipaa|clinical|patient|telehealth|doctor|consultation/i);
  });

  it("gives every brand its own wording", () => {
    const tags = BRAND_IDS.map((id) => GALLERY_COPY[id].tone);
    expect(new Set(tags).size).toBe(BRAND_IDS.length);
    expect(GALLERY_COPY.solace.badges.tags).toContain("HIPAA ENCRYPTED");
  });

  it.each(BRAND_IDS)("offers %s real specialty and directory choices", (id) => {
    const { specialty, directory } = GALLERY_COPY[id];
    expect(new Set(specialty.options).size).toBe(specialty.options.length);
    expect(specialty.options.length).toBeGreaterThan(1);
    expect(directory.length).toBeGreaterThan(2);
  });
});
