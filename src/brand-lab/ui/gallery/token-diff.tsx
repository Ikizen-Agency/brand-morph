"use client";

import { DraftingCompass } from "lucide-react";
import { brandDiffRows } from "../../application/gallery";
import { GALLERY_COPY } from "../../domain/gallery-copy";
import { BRAND_ICONS } from "../brand-icons";
import { useLab } from "../lab-provider";

/** Studio chrome, not a specimen: it compares brands, so it must not wear any one of them. */
export function TokenDiff() {
  const { state } = useLab();

  return (
    <aside
      aria-labelledby="diff-heading"
      data-testid="token-diff"
      className="mx-4 flex flex-col gap-2 rounded-enclosure border border-line bg-subtle/60 p-3.5 sm:mx-7 lg:sticky lg:top-[calc(4rem+1.75rem)] lg:mx-0 lg:mt-7 lg:mr-7"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="diff-heading" className="flex items-center gap-2 font-display text-headline-sm">
          <DraftingCompass aria-hidden size={20} />
          Morphology Token Diff
        </h2>
        <span className="rounded bg-muted px-2 py-0.5 text-label-mono text-ink-muted">INSPECTOR</span>
      </div>
      <p className="text-body-sm text-ink-muted">Bold values differ from the active brand.</p>
      <ul className="flex flex-col gap-2 sm:grid sm:grid-cols-3 lg:flex">
        {brandDiffRows(state).map(({ brandId, name, active, tokens }) => {
          const Icon = BRAND_ICONS[brandId];
          return (
            <li
              key={brandId}
              data-testid={`diff-${brandId}`}
              aria-current={active ? "true" : undefined}
              className={`flex flex-col gap-1.5 rounded-control border p-2.5 transition-colors duration-300 ${
                active ? "border-line-strong bg-elevated shadow-rest" : "border-line bg-subtle"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-x-2">
                <span className="flex items-center gap-1.5 text-label-md font-semibold">
                  <Icon aria-hidden size={14} />
                  {name}
                  {active ? " (Active)" : ""}
                </span>
                <span className="text-label-mono text-ink-muted">{GALLERY_COPY[brandId].diffLabel}</span>
              </div>
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 font-mono text-[11px] leading-4">
                {tokens.map((token) => (
                  <div key={token.name} className="col-span-2 grid grid-cols-subgrid">
                    <dt className="text-ink-muted">{token.name}</dt>
                    <dd className={`break-words ${token.differs ? "font-semibold" : "text-ink-muted"}`}>
                      {token.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
