import { BRAND_IDS, BRANDS, type BrandId } from "../domain/brands";
import type { DirectoryEntry, GalleryCopy } from "../domain/gallery-copy";
import { resolveTokens, type TokenSet } from "../domain/tokens";
import { brandDefaultTuning } from "../domain/tuning";
import { effectiveTokens, type LabState } from "./lab-state";

export const GALLERY_FILTERS = [
  { id: "all", label: "All" },
  { id: "buttons", label: "Buttons" },
  { id: "inputs", label: "Inputs & Form" },
  { id: "feedback", label: "Feedback" },
  { id: "cards", label: "Cards & Badges" },
  { id: "modals", label: "Modals" },
] as const;

export type GalleryFilter = (typeof GALLERY_FILTERS)[number]["id"];
type GalleryCategory = Exclude<GalleryFilter, "all">;

const section = <T extends string>(id: T, title: string, category: GalleryCategory) => ({
  id,
  title,
  category,
});

export const GALLERY_SECTIONS = [
  section("actions", "Buttons & Interactive Actions", "buttons"),
  section("form", "Form & Input Controls", "inputs"),
  section("badges", "Badges & Status Chips", "cards"),
  section("card", "Dynamic Card Container", "cards"),
  section("feedback", "Feedback, Alerts & Progress", "feedback"),
  section("modal", "Interactive Modal Preview", "modals"),
];

export type GallerySectionId = (typeof GALLERY_SECTIONS)[number]["id"];

export function isSectionVisible(id: GallerySectionId, filter: GalleryFilter): boolean {
  return filter === "all" || GALLERY_SECTIONS.some((item) => item.id === id && item.category === filter);
}

export function visibleSectionCount(filter: GalleryFilter): number {
  return GALLERY_SECTIONS.filter(({ id }) => isSectionVisible(id, filter)).length;
}

export type BookingStatus = "open" | "reserved" | "cancelled";

export interface AttachedFile {
  name: string;
  size: number;
}

/** Local specimen state. Nothing here ever leaves the browser. */
export interface SpecimenState {
  booking: BookingStatus;
  providersOpen: boolean;
  liked: boolean;
  bookmarked: boolean;
  search: string;
  fullName: string;
  specialty: string;
  reminders: boolean;
  consent: boolean;
  profileOpen: boolean;
  ratingHidden: boolean;
  alertVisible: boolean;
  upload: AttachedFile | null;
  authorized: boolean;
}

type SpecimenFlag =
  | "providersOpen"
  | "liked"
  | "bookmarked"
  | "reminders"
  | "consent"
  | "profileOpen"
  | "ratingHidden";

export type SpecimenAction =
  | { type: "toggle"; flag: SpecimenFlag }
  | { type: "reserve" }
  | { type: "cancel" }
  | { type: "reopen" }
  | { type: "setSearch"; value: string }
  | { type: "setName"; value: string }
  | { type: "setSpecialty"; value: string }
  | { type: "setAlert"; visible: boolean }
  | { type: "setUpload"; file: AttachedFile | null }
  | { type: "authorize" }
  | { type: "revoke" };

export function initialSpecimens(copy: GalleryCopy): SpecimenState {
  return {
    booking: "open",
    providersOpen: false,
    liked: false,
    bookmarked: false,
    search: "",
    fullName: copy.name.value,
    specialty: copy.specialty.options[0],
    reminders: true,
    consent: true,
    profileOpen: false,
    ratingHidden: false,
    alertVisible: true,
    upload: null,
    authorized: false,
  };
}

export function canAuthorize(state: SpecimenState): boolean {
  return state.consent;
}

export function specimenReducer(state: SpecimenState, action: SpecimenAction): SpecimenState {
  switch (action.type) {
    case "toggle": {
      const next = { ...state, [action.flag]: !state[action.flag] };
      return next.consent ? next : { ...next, authorized: false };
    }
    case "reserve":
      return { ...state, booking: "reserved" };
    case "cancel":
      return state.booking === "reserved" ? { ...state, booking: "cancelled" } : state;
    case "reopen":
      return { ...state, booking: "open" };
    case "setSearch":
      return { ...state, search: action.value };
    case "setName":
      return { ...state, fullName: action.value };
    case "setSpecialty":
      return { ...state, specialty: action.value };
    case "setAlert":
      return { ...state, alertVisible: action.visible };
    case "setUpload":
      return { ...state, upload: action.file };
    case "authorize":
      return canAuthorize(state) ? { ...state, authorized: true } : state;
    case "revoke":
      return { ...state, authorized: false };
  }
}

export type NameProblem = "required" | "short";

export function validateFullName(value: string): NameProblem | null {
  const name = value.trim();
  if (name.length === 0) return "required";
  return name.length < 2 ? "short" : null;
}

/** Each completed form step is worth a quarter, so the bar answers to the specimens around it. */
export function onboardingProgress(state: SpecimenState): number {
  const steps = [
    validateFullName(state.fullName) === null,
    state.specialty !== "",
    state.consent,
    state.upload !== null,
  ];
  return (steps.filter(Boolean).length / steps.length) * 100;
}

export function searchDirectory(
  entries: readonly DirectoryEntry[],
  query: string,
): readonly DirectoryEntry[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return entries.filter(({ name, detail }) => `${name} ${detail}`.toLowerCase().includes(needle));
}

const BYTE_UNITS = ["KB", "MB", "GB"];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  let value = bytes;
  let unit = -1;
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${BYTE_UNITS[unit]}`;
}

export interface DiffToken {
  name: string;
  value: string;
  differs: boolean;
}

export interface BrandDiffRow {
  brandId: BrandId;
  name: string;
  active: boolean;
  tokens: DiffToken[];
}

function diffValues(tokens: TokenSet): ReadonlyArray<readonly [name: string, value: string]> {
  return [
    ["Radius", tokens.radii.surface],
    ["CTA", tokens.radii.cta],
    ["Primary", tokens.colors.primary],
    ["Heading", tokens.fonts.heading.split(",")[0].replaceAll("'", "")],
    ["Rhythm", tokens.spacing.gap],
  ];
}

/**
 * The active brand reads the live tuning. Other brands show what selecting them would produce:
 * their archetype tuning plus any color overrides already saved for them.
 */
export function brandDiffRows(state: LabState): BrandDiffRow[] {
  const activeTokens = effectiveTokens(state);
  const activeValues = new Map(diffValues(activeTokens));
  return BRAND_IDS.map((brandId) => {
    const active = brandId === state.brandId;
    const tokens = active
      ? activeTokens
      : resolveTokens(BRANDS[brandId], brandDefaultTuning(brandId), state.overrides[brandId]);
    return {
      brandId,
      name: BRANDS[brandId].name,
      active,
      tokens: diffValues(tokens).map(([name, value]) => ({
        name,
        value,
        differs: activeValues.get(name) !== value,
      })),
    };
  });
}
