import { describe, expect, it } from "vitest";
import { BRAND_IDS } from "../domain/brands";
import { GALLERY_COPY } from "../domain/gallery-copy";
import {
  brandDiffRows,
  canAuthorize,
  formatBytes,
  GALLERY_FILTERS,
  GALLERY_SECTIONS,
  initialSpecimens,
  isSectionVisible,
  onboardingProgress,
  searchDirectory,
  specimenReducer,
  validateFullName,
  visibleSectionCount,
  type SpecimenAction,
  type SpecimenState,
} from "./gallery";
import { initialLabState, labReducer, type LabState } from "./lab-state";

const start = () => initialSpecimens(GALLERY_COPY.solace);
const run = (state: SpecimenState, ...actions: SpecimenAction[]) =>
  actions.reduce(specimenReducer, state);

describe("gallery filter", () => {
  it("offers All first and a filter for every section category", () => {
    expect(GALLERY_FILTERS[0].id).toBe("all");
    const filters = GALLERY_FILTERS.map(({ id }) => id);
    for (const { category } of GALLERY_SECTIONS) expect(filters).toContain(category);
  });

  it("shows every section under All", () => {
    expect(GALLERY_SECTIONS.every(({ id }) => isSectionVisible(id, "all"))).toBe(true);
    expect(visibleSectionCount("all")).toBe(6);
  });

  it("keeps only the sections of the chosen category", () => {
    const visible = GALLERY_SECTIONS.filter(({ id }) => isSectionVisible(id, "cards"));
    expect(visible.map(({ id }) => id)).toEqual(["badges", "card"]);
    expect(visibleSectionCount("cards")).toBe(2);
    expect(isSectionVisible("actions", "modals")).toBe(false);
    expect(isSectionVisible("modal", "modals")).toBe(true);
  });
});

describe("booking", () => {
  it("reserves, cancels and returns to the initial state", () => {
    const reserved = run(start(), { type: "reserve" });
    expect(reserved.booking).toBe("reserved");
    const cancelled = run(reserved, { type: "cancel" });
    expect(cancelled.booking).toBe("cancelled");
    expect(run(cancelled, { type: "reopen" }).booking).toBe("open");
  });

  it("has nothing to cancel before a reservation", () => {
    const state = start();
    expect(run(state, { type: "cancel" })).toBe(state);
  });

  it("can reserve again after a cancellation", () => {
    expect(run(start(), { type: "reserve" }, { type: "cancel" }, { type: "reserve" }).booking).toBe(
      "reserved",
    );
  });
});

describe("authorization", () => {
  it("needs consent", () => {
    const state = run(start(), { type: "toggle", flag: "consent" });
    expect(canAuthorize(state)).toBe(false);
    expect(run(state, { type: "authorize" })).toBe(state);
  });

  it("authorizes and revokes", () => {
    const authorized = run(start(), { type: "authorize" });
    expect(authorized.authorized).toBe(true);
    expect(run(authorized, { type: "revoke" }).authorized).toBe(false);
  });

  it("withdrawing consent revokes an authorization", () => {
    const state = run(start(), { type: "authorize" }, { type: "toggle", flag: "consent" });
    expect(state.consent).toBe(false);
    expect(state.authorized).toBe(false);
  });
});

describe("local specimen state", () => {
  it("toggles flags independently", () => {
    const state = run(start(), { type: "toggle", flag: "liked" });
    expect(state.liked).toBe(true);
    expect(state.bookmarked).toBe(false);
    expect(run(state, { type: "toggle", flag: "liked" }).liked).toBe(false);
  });

  it("dismisses and replays the alert", () => {
    const dismissed = run(start(), { type: "setAlert", visible: false });
    expect(dismissed.alertVisible).toBe(false);
    expect(run(dismissed, { type: "setAlert", visible: true }).alertVisible).toBe(true);
  });

  it("attaches and removes a file", () => {
    const file = { name: "panel.pdf", size: 2048 };
    const attached = run(start(), { type: "setUpload", file });
    expect(attached.upload).toEqual(file);
    expect(run(attached, { type: "setUpload", file: null }).upload).toBeNull();
  });

  it("starts each brand from its own copy", () => {
    expect(initialSpecimens(GALLERY_COPY.orbit).fullName).toBe(GALLERY_COPY.orbit.name.value);
    expect(initialSpecimens(GALLERY_COPY.lumen).specialty).toBe(
      GALLERY_COPY.lumen.specialty.options[0],
    );
  });
});

describe("onboardingProgress", () => {
  it("starts at the three of four steps a visitor arrives with", () => {
    expect(onboardingProgress(start())).toBe(75);
  });

  it("reaches 100 with a file and drops as steps are undone", () => {
    const uploaded = run(start(), { type: "setUpload", file: { name: "a", size: 1 } });
    expect(onboardingProgress(uploaded)).toBe(100);
    expect(onboardingProgress(run(uploaded, { type: "toggle", flag: "consent" }))).toBe(75);
    expect(onboardingProgress(run(uploaded, { type: "setName", value: "" }))).toBe(75);
  });
});

describe("validateFullName", () => {
  it("accepts a real name", () => {
    expect(validateFullName("Elena Rostova, MSc")).toBeNull();
  });

  it("rejects empty and whitespace", () => {
    expect(validateFullName("")).toBe("required");
    expect(validateFullName("   ")).toBe("required");
  });

  it("rejects a single character", () => {
    expect(validateFullName(" e ")).toBe("short");
  });
});

describe("searchDirectory", () => {
  const entries = GALLERY_COPY.solace.directory;

  it("returns nothing for a blank query", () => {
    expect(searchDirectory(entries, "  ")).toEqual([]);
  });

  it("matches name and detail, ignoring case and padding", () => {
    const [entry] = entries;
    expect(searchDirectory(entries, ` ${entry.name.toUpperCase()} `)).toContain(entry);
    expect(searchDirectory(entries, entry.detail.toLowerCase())).toContain(entry);
  });

  it("returns nothing when no entry matches", () => {
    expect(searchDirectory(entries, "zzzz")).toEqual([]);
  });
});

describe("formatBytes", () => {
  it.each([
    [0, "0 B"],
    [1023, "1023 B"],
    [1024, "1.0 KB"],
    [1536, "1.5 KB"],
    [5 * 1024 * 1024, "5.0 MB"],
    [3 * 1024 ** 3, "3.0 GB"],
  ])("formats %d as %s", (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});

describe("brandDiffRows", () => {
  const value = (state: LabState, brandId: string, name: string) =>
    brandDiffRows(state)
      .find((row) => row.brandId === brandId)
      ?.tokens.find((token) => token.name === name);

  it("has one row per brand and marks only the active one", () => {
    const state = labReducer(initialLabState, { type: "selectBrand", brandId: "lumen" });
    const rows = brandDiffRows(state);
    expect(rows.map(({ brandId }) => brandId)).toEqual([...BRAND_IDS]);
    expect(rows.filter(({ active }) => active).map(({ brandId }) => brandId)).toEqual(["lumen"]);
  });

  it("reads tuning from the active brand only", () => {
    const state = labReducer(initialLabState, { type: "setRadius", radius: "0px" });
    expect(value(state, "solace", "Radius")?.value).toBe("0px");
    expect(value(state, "lumen", "Radius")?.value).toBe("12px");
  });

  it("reads color overrides from the effective tokens of each brand", () => {
    const state: LabState = {
      ...initialLabState,
      overrides: { solace: { primary: "#112233" }, orbit: { primary: "#445566" } },
    };
    expect(value(state, "solace", "Primary")?.value).toBe("#112233");
    expect(value(state, "orbit", "Primary")?.value).toBe("#445566");
    expect(value(state, "lumen", "Primary")?.value).toBe("#2B1E70");
  });

  it("marks what differs from the active brand", () => {
    const rows = brandDiffRows(initialLabState);
    expect(rows[0].tokens.every(({ differs }) => !differs)).toBe(true);
    expect(rows[1].tokens.find(({ name }) => name === "Primary")?.differs).toBe(true);
  });

  it("names the heading family without its fallbacks", () => {
    expect(value(initialLabState, "orbit", "Heading")?.value).toBe("JetBrains Mono");
  });
});
