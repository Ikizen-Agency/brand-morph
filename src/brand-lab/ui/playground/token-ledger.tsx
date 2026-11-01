"use client";

import { ArrowRight, Check, Copy, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { ledgerEntries, ledgerText } from "../../application/ledger";
import { BRAND_IDS, BRANDS, type BrandId } from "../../domain/brands";
import { Segmented, type SegmentedOption } from "../controls/segmented";
import { useLab } from "../lab-provider";
import { useCopy, type CopyStatus } from "../use-copy";

const BRAND_OPTIONS: ReadonlyArray<SegmentedOption<BrandId>> = BRAND_IDS.map((id) => ({
  value: id,
  label: BRANDS[id].name.split(" ")[0],
}));

const COPY_FEEDBACK: Record<CopyStatus, string> = {
  idle: "",
  copied: "Copied to clipboard",
  failed: "Copy failed. Clipboard access is blocked.",
};

export function TokenLedger() {
  const { state, dispatch } = useLab();
  const { status, copy } = useCopy();
  const Icon = status === "copied" ? Check : status === "failed" ? TriangleAlert : Copy;

  return (
    <section
      aria-labelledby="ledger-heading"
      className="flex flex-col gap-2.5 rounded-enclosure border border-line bg-subtle/60 p-3.5"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="ledger-heading" className="text-label-mono font-semibold tracking-wider uppercase">
          Active Token Ledger
        </h2>
        <Link
          href="/tokens"
          className="flex min-h-9 items-center gap-0.5 text-label-md font-semibold hover:underline"
        >
          Inspect Tokens
          <ArrowRight aria-hidden size={14} />
        </Link>
      </div>
      <Segmented
        legend="Quick brand switch"
        hideLegend
        name="quick-brand"
        value={state.brandId}
        options={BRAND_OPTIONS}
        onChange={(brandId) => dispatch({ type: "selectBrand", brandId })}
      />
      <div className="relative rounded-control bg-ink p-3 text-[#dfe4df]">
        <button
          type="button"
          aria-label="Copy tokens"
          onClick={() => copy(ledgerText(state))}
          className="absolute top-1.5 right-1.5 flex size-9 items-center justify-center rounded-control bg-white/10 text-canvas transition-colors duration-150 hover:bg-white/20 focus-visible:outline-canvas"
        >
          <Icon aria-hidden size={15} />
        </button>
        <dl data-testid="ledger" className="flex flex-col gap-0.5 font-mono text-[11px] leading-4">
          {ledgerEntries(state).map(({ name, value }) => (
            <div key={name} className="flex flex-wrap gap-x-1.5 [&:first-child]:pr-8 [&:nth-child(2)]:pr-8">
              <dt className="text-[#adb3ad]">{name}:</dt>
              <dd className="min-w-0 break-words">{value};</dd>
            </div>
          ))}
        </dl>
      </div>
      <p role="status" className="min-h-4 text-label-md text-ink-muted">
        {COPY_FEEDBACK[status]}
      </p>
    </section>
  );
}
