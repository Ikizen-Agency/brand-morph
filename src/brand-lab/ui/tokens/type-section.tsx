"use client";

import { CaseSensitive, Copy } from "lucide-react";
import { scaleRatio, typeDeclaration, typeWeights } from "../../application/token-inspector";
import { BRANDS } from "../../domain/brands";
import {
  fontFamilies,
  formatTypeSpec,
  TYPE_STYLE_IDS,
  type TypeFamily,
  type TypeStyleId,
} from "../../domain/tokens";
import { useLab } from "../lab-provider";
import { BrandScope } from "../sandbox/brand-scope";
import styles from "./tokens.module.css";
import type { CopyToken } from "./use-token-copy";

const FAMILY_ROWS: ReadonlyArray<{ family: TypeFamily; label: string }> = [
  { family: "heading", label: "Display & Headings" },
  { family: "body", label: "Body & Labels" },
];

export function TypeSection({ onCopy }: Readonly<{ onCopy: CopyToken }>) {
  const { state, tokens } = useLab();
  const { copy } = BRANDS[state.brandId];

  const samples: Record<TypeStyleId, string> = {
    display: copy.sectionLabel,
    heading: copy.pillars[0].title,
    body: copy.description,
    caption: copy.subtext.toUpperCase(),
  };

  return (
    <section aria-labelledby="type-heading" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 id="type-heading" className="flex items-center gap-2 font-display text-headline-sm">
          <CaseSensitive aria-hidden size={20} />
          Typography System
        </h2>
        <span data-testid="scale-ratio" className="shrink-0 text-label-mono text-ink-muted">
          Scale Ratio: {scaleRatio(tokens)}
        </span>
      </div>

      <BrandScope tokens={tokens} data-testid="type-scope" className={styles.scope}>
        <div className={styles.card}>
          {FAMILY_ROWS.map(({ family, label }) => (
            <div key={family} data-testid={`family-${family}`} className={styles.familyRow}>
              <div className={styles.familyText}>
                <span className={styles.eyebrow}>{label}</span>
                <span
                  className={styles.familyName}
                  style={{ fontFamily: `var(--sb-font-${family})` }}
                >
                  {fontFamilies(tokens.fonts[family])[0]}
                </span>
                <span className={styles.note}>{tokens.fonts[family]}</span>
              </div>
              <span className={styles.chip}>{typeWeights(tokens, family).join(", ")}</span>
            </div>
          ))}
        </div>

        <div className={styles.card}>
          {TYPE_STYLE_IDS.map((id) => {
            const style = tokens.typeScale[id];
            return (
              <div key={id} data-testid={`type-${id}`} className={styles.typeRow}>
                <div className={styles.typeHead}>
                  <span data-testid="type-spec" className={styles.eyebrow}>
                    text-{id} • {formatTypeSpec(style)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Copy text-${id}`}
                    className={styles.iconButton}
                    onClick={() => onCopy(typeDeclaration(tokens, id), `text-${id}`)}
                  >
                    <Copy aria-hidden size={15} />
                  </button>
                </div>
                <p
                  data-testid="type-sample"
                  style={{
                    fontFamily: `var(--sb-font-${style.family})`,
                    fontSize: `${style.fontSize}px`,
                    lineHeight: `${style.lineHeight}px`,
                    letterSpacing: `${style.letterSpacing}em`,
                    fontWeight: style.fontWeight,
                  }}
                >
                  {samples[id]}
                </p>
              </div>
            );
          })}
        </div>
      </BrandScope>
    </section>
  );
}
