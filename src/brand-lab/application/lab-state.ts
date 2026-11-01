import { BRAND_IDS, BRANDS, COLOR_ROLES, type BrandId, type ColorRole } from "../domain/brands";
import { isHexColor } from "../domain/contrast";
import { resolveTokens, type ColorOverrides, type TokenSet } from "../domain/tokens";
import {
  brandDefaultTuning,
  CTA_SHAPES,
  DENSITIES,
  RADIUS_SCALES,
  type CtaShape,
  type Density,
  type RadiusScale,
  type Tuning,
} from "../domain/tuning";

export type BrandOverrides = Partial<Record<BrandId, ColorOverrides>>;

export interface LabState {
  brandId: BrandId;
  tuning: Tuning;
  overrides: BrandOverrides;
}

export type LabAction =
  | { type: "selectBrand"; brandId: BrandId }
  | { type: "setDensity"; density: Density }
  | { type: "setRadius"; radius: RadiusScale }
  | { type: "setCta"; cta: CtaShape }
  | { type: "setColorOverride"; role: ColorRole; hex: string }
  | { type: "clearColorOverrides" }
  | { type: "autoMatch" }
  | { type: "reset" };

export const initialLabState: LabState = {
  brandId: "solace",
  tuning: brandDefaultTuning("solace"),
  overrides: {},
};

function withoutBrand(overrides: BrandOverrides, brandId: BrandId): BrandOverrides {
  return Object.fromEntries(Object.entries(overrides).filter(([id]) => id !== brandId));
}

const includes = <T extends string>(options: readonly T[], value: unknown): value is T =>
  options.includes(value as T);

/** Low contrast is accepted on purpose: the UI reports it through colorPairChecks. */
export function labReducer(state: LabState, action: LabAction): LabState {
  switch (action.type) {
    case "selectBrand":
      return { ...state, brandId: action.brandId, tuning: brandDefaultTuning(action.brandId) };
    case "setDensity":
      return { ...state, tuning: { ...state.tuning, density: action.density } };
    case "setRadius":
      return { ...state, tuning: { ...state.tuning, radius: action.radius } };
    case "setCta":
      return { ...state, tuning: { ...state.tuning, cta: action.cta } };
    case "setColorOverride": {
      if (!includes(COLOR_ROLES, action.role) || !isHexColor(action.hex)) return state;
      const current = state.overrides[state.brandId];
      return {
        ...state,
        overrides: {
          ...state.overrides,
          [state.brandId]: { ...current, [action.role]: action.hex.toUpperCase() },
        },
      };
    }
    case "clearColorOverrides":
      return { ...state, overrides: withoutBrand(state.overrides, state.brandId) };
    case "autoMatch":
      return {
        ...state,
        tuning: brandDefaultTuning(state.brandId),
        overrides: withoutBrand(state.overrides, state.brandId),
      };
    case "reset":
      return initialLabState;
  }
}

/** Effective tokens for the active brand: brand values, tuning and overrides resolved together. */
export function effectiveTokens(state: LabState): TokenSet {
  return resolveTokens(BRANDS[state.brandId], state.tuning, state.overrides[state.brandId]);
}

export function serializeLabState(state: LabState): string {
  return JSON.stringify(state);
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function parseTuning(value: unknown): Tuning | null {
  if (!isRecord(value)) return null;
  const { density, radius, cta } = value;
  if (
    !includes(DENSITIES, density) ||
    !includes(RADIUS_SCALES, radius) ||
    !includes(CTA_SHAPES, cta)
  ) {
    return null;
  }
  return { density, radius, cta };
}

function parseColorOverrides(value: unknown): ColorOverrides | null {
  if (!isRecord(value)) return null;
  const overrides: ColorOverrides = {};
  for (const [role, hex] of Object.entries(value)) {
    if (!includes(COLOR_ROLES, role) || !isHexColor(hex)) return null;
    overrides[role] = hex.toUpperCase();
  }
  return overrides;
}

function parseBrandOverrides(value: unknown): BrandOverrides | null {
  if (!isRecord(value)) return null;
  const overrides: BrandOverrides = {};
  for (const [brandId, colors] of Object.entries(value)) {
    if (!includes(BRAND_IDS, brandId)) return null;
    const parsed = parseColorOverrides(colors);
    if (!parsed) return null;
    overrides[brandId] = parsed;
  }
  return overrides;
}

/** Restores persisted state. Anything unknown or malformed yields null, never a partial state. */
export function parseLabState(raw: string | null): LabState | null {
  if (raw === null) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(value) || !includes(BRAND_IDS, value.brandId)) return null;
  const tuning = parseTuning(value.tuning);
  const overrides = parseBrandOverrides(value.overrides);
  if (!tuning || !overrides) return null;
  return { brandId: value.brandId, tuning, overrides };
}
