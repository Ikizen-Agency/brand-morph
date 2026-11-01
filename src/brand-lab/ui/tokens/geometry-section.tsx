"use client";

import { Box, Copy } from "lucide-react";
import {
  radiusDeclaration,
  shadowDeclaration,
  spacingDeclaration,
} from "../../application/token-inspector";
import { kebab } from "../../domain/exporters";
import { formatShadow, type TokenSet } from "../../domain/tokens";
import { useLab } from "../lab-provider";
import { BrandScope } from "../sandbox/brand-scope";
import styles from "./tokens.module.css";
import type { CopyToken } from "./use-token-copy";

type RadiusName = keyof TokenSet["radii"];
type ShadowName = keyof TokenSet["shadows"];
type SpacingName = keyof TokenSet["spacing"];

const RADII: readonly RadiusName[] = ["sm", "md", "lg", "full", "surface", "cta"];

const ELEVATIONS: ReadonlyArray<{ name: ShadowName; title: string; use: string; scopeVar: string }> = [
  { name: "elevation1", title: "Elevation 1", use: "Card baseline", scopeVar: "--sb-shadow-1" },
  { name: "elevation2", title: "Elevation 2", use: "Floating modals", scopeVar: "--sb-shadow-2" },
  { name: "elevationCta", title: "Elevation CTA", use: "Primary button", scopeVar: "--sb-shadow-cta" },
];

const SPACING: ReadonlyArray<{ name: SpacingName; scopeVar: string }> = [
  { name: "gap", scopeVar: "--sb-gap" },
  { name: "padding", scopeVar: "--sb-pad" },
];

export function GeometrySection({ onCopy }: Readonly<{ onCopy: CopyToken }>) {
  const { state, tokens } = useLab();

  return (
    <section aria-labelledby="geometry-heading" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 id="geometry-heading" className="flex items-center gap-2 font-display text-headline-sm">
          <Box aria-hidden size={20} />
          Geometry &amp; Elevation
        </h2>
        <span data-testid="density" className="shrink-0 text-label-mono text-ink-muted capitalize">
          {state.tuning.density} density
        </span>
      </div>

      <BrandScope tokens={tokens} data-testid="geometry-scope" className={styles.scope}>
        <div className={styles.card}>
          <span className={styles.eyebrow}>Corner Radii Tokens</span>
          <div className={styles.radii}>
            {RADII.map((name) => {
              const variable = `--radius-${name}`;
              return (
                <button
                  key={name}
                  type="button"
                  data-testid={`radius-${name}`}
                  aria-label={`Copy ${variable}`}
                  className={styles.radiusTile}
                  onClick={() => onCopy(radiusDeclaration(tokens, name), variable)}
                >
                  <span
                    data-testid="radius-sample"
                    className={styles.radiusSample}
                    style={{ borderRadius: `var(--sb-radius-${name})` }}
                  >
                    {tokens.radii[name]}
                  </span>
                  <span className={styles.note}>{variable}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.elevations}>
          {ELEVATIONS.map(({ name, title, use, scopeVar }) => {
            const variable = `--${kebab(name)}`;
            return (
              <button
                key={name}
                type="button"
                data-testid={`elevation-${name}`}
                aria-label={`Copy ${variable}`}
                className={styles.elevationTile}
                onClick={() => onCopy(shadowDeclaration(tokens, name), variable)}
              >
                <span className={styles.elevationHead}>
                  {title}
                  <Copy aria-hidden size={15} />
                </span>
                <span
                  data-testid="elevation-sample"
                  className={styles.elevationSample}
                  style={{ boxShadow: `var(${scopeVar})` }}
                >
                  {formatShadow(tokens.shadows[name])}
                </span>
                <span className={styles.note}>{use}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.spacing}>
          {SPACING.map(({ name, scopeVar }) => {
            const variable = `--space-${name}`;
            return (
              <button
                key={name}
                type="button"
                data-testid={`spacing-${name}`}
                aria-label={`Copy ${variable}`}
                className={styles.spacingTile}
                onClick={() => onCopy(spacingDeclaration(tokens, name), variable)}
              >
                <span aria-hidden className={styles.spacingBar} style={{ width: `var(${scopeVar})` }} />
                <span className={styles.spacingText}>
                  <span>{variable}</span>
                  <strong>{tokens.spacing[name]}</strong>
                </span>
                <Copy aria-hidden size={15} />
              </button>
            );
          })}
        </div>
      </BrandScope>
    </section>
  );
}
