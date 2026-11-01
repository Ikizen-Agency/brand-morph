"use client";

import { Lightbulb } from "lucide-react";
import { useLab } from "../lab-provider";
import { Sandbox } from "../sandbox/sandbox";
import { BrandCards } from "./brand-cards";
import { DeviceStage } from "./device-stage";
import { TokenLedger } from "./token-ledger";
import { TuningRack } from "./tuning-rack";

const sidePane =
  "xl:sticky xl:top-[calc(4rem+1px)] xl:h-[calc(100dvh-4rem-1px)] xl:self-start xl:overflow-y-auto";

export function Playground() {
  const { state, tokens, ready, resets } = useLab();

  return (
    <div className="mx-auto w-full max-w-5xl xl:grid xl:max-w-none xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:grid-rows-[auto_1fr]">
      <section className="px-4 pt-4 pb-6 md:px-7 xl:col-start-2 xl:row-start-1 xl:px-7 xl:pt-7 xl:pb-5">
        <div className="mb-2 flex flex-wrap items-center gap-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-subtle px-2.5 py-1 text-label-mono uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-ink motion-safe:animate-pulse" />
            Ikizen Design Lab
          </span>
          <span className="rounded-full bg-muted px-2 py-1 text-[10px] leading-3.5 font-medium text-ink-muted uppercase">
            Live Tokens
          </span>
        </div>
        <h1 className="mb-1 font-display text-headline-lg md:text-hero">
          One product.
          <br />
          Three distinct personalities.
        </h1>
        <p className="max-w-xl text-body-md text-ink-muted">
          Explore how a unified architecture morphs across three real-world business models via
          token-driven visual identity.
        </p>
      </section>

      <aside
        aria-label="Lab configuration"
        className={`flex flex-col gap-6 pb-6 md:px-7 xl:col-start-1 xl:row-span-2 xl:row-start-1 xl:gap-5 xl:border-r xl:border-line xl:p-5 ${sidePane}`}
      >
        <BrandCards />
        <div className="px-4 md:px-0">
          <TuningRack />
        </div>
      </aside>

      <div className="min-w-0 px-4 pb-8 md:px-7 xl:col-start-2 xl:row-start-2 xl:pb-10">
        <DeviceStage device={state.device} visible={ready}>
          <Sandbox tokens={tokens} resets={resets} animate={ready} />
        </DeviceStage>
      </div>

      <aside
        aria-label="Token output"
        className={`flex flex-col gap-6 px-4 pb-6 md:grid md:grid-cols-2 md:px-7 xl:col-start-3 xl:row-span-2 xl:row-start-1 xl:flex xl:gap-5 xl:border-l xl:border-line xl:p-5 ${sidePane}`}
      >
        <TokenLedger />
        <section className="flex items-start gap-2 self-start rounded-enclosure border border-line bg-elevated p-3.5 shadow-rest">
          <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-control bg-[#c8ead8] text-[#022015]">
            <Lightbulb size={18} />
          </span>
          <div className="min-w-0">
            <h2 className="mb-0.5 font-display text-[14px] leading-5 font-semibold">Design System Principle</h2>
            <p className="text-body-sm text-ink-muted">
              Structural layout and semantic roles remain invariant. Only tokens (color hierarchy,
              radiuses, typographic scale, and rhythm density) rehydrate the aesthetic identity.
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
}
