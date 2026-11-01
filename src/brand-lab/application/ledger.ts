import { effectiveTokens, type LabState } from "./lab-state";

export interface LedgerEntry {
  name: string;
  value: string;
}

/** Derived on every render from the lab state, so the ledger can never drift from it. */
export function ledgerEntries(state: LabState): LedgerEntry[] {
  const tokens = effectiveTokens(state);
  return [
    { name: "--brand-primary", value: tokens.colors.primary },
    { name: "--brand-on-primary", value: tokens.colors.onPrimary },
    { name: "--brand-surface", value: tokens.colors.surface },
    { name: "--brand-on-surface", value: tokens.colors.onSurface },
    { name: "--font-heading", value: tokens.fonts.heading },
    { name: "--radius", value: tokens.radii.surface },
    { name: "--cta-radius", value: tokens.radii.cta },
    { name: "--density", value: state.tuning.density },
    { name: "--gap", value: tokens.spacing.gap },
    { name: "--pad", value: tokens.spacing.padding },
    { name: "--btn", value: state.tuning.cta },
  ];
}

export function ledgerText(state: LabState): string {
  return ledgerEntries(state)
    .map(({ name, value }) => `${name}: ${value};`)
    .join("\n");
}
