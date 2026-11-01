"use client";

import { Copy, FileCode } from "lucide-react";
import { EXPORT_FORMATS, exportAll } from "../../domain/exporters";
import { BrandTabs } from "../controls/brand-tabs";
import { useLab } from "../lab-provider";
import { useAnnouncer } from "../use-announcer";
import { EngineCard } from "./engine-card";
import { ExportPanel } from "./export-panel";
import { GeometrySection } from "./geometry-section";
import { PaletteSection } from "./palette-section";
import { TypeSection } from "./type-section";
import { useTokenCopy } from "./use-token-copy";

export function TokenInspector() {
  const { state, tokens, ready, resets } = useLab();
  const { notice, announce } = useAnnouncer(`${state.brandId}:${resets}`);
  const copy = useTokenCopy(announce);

  return (
    <div
      data-testid="tokens-page"
      data-ready={ready}
      data-brand={state.brandId}
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-4 pb-6 md:px-7 xl:grid xl:max-w-none xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)] xl:items-start xl:p-7"
    >
      <div className="flex min-w-0 flex-col gap-6">
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="flex items-center gap-1.5 text-label-mono tracking-wider text-ink-muted uppercase">
              <span aria-hidden className="size-2 rounded-full bg-ink motion-safe:animate-pulse" />
              Design System Tokens
            </p>
            <h1 className="font-display text-headline-lg">Token Architecture</h1>
            <p className="text-body-sm text-ink-muted">
              Live design tokens driving the active identity:{" "}
              <span data-testid="active-brand" className="font-semibold text-ink">
                {tokens.brandName}
              </span>
              .
            </p>
          </div>
          <BrandTabs name="tokens-brand" />
          <div className="flex items-center justify-between gap-2 rounded-control bg-subtle p-1.5 pl-2.5">
            <p className="flex min-w-0 items-center gap-1.5 text-label-mono text-ink-muted">
              <FileCode aria-hidden size={16} className="shrink-0" />
              <span data-testid="format-summary">
                {EXPORT_FORMATS.length} formats, one source, DTCG 2025.10 JSON
              </span>
            </p>
            <button
              type="button"
              onClick={() => copy(exportAll(tokens), `all ${EXPORT_FORMATS.length} formats`)}
              className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-control bg-elevated px-3 text-label-md font-semibold shadow-rest transition-colors duration-150 hover:bg-muted"
            >
              <Copy aria-hidden size={14} />
              Copy All
            </button>
          </div>
        </section>

        <PaletteSection onCopy={copy} announce={announce} />
        <TypeSection onCopy={copy} />
        <GeometrySection onCopy={copy} />
      </div>

      <div className="flex min-w-0 flex-col gap-6 xl:sticky xl:top-[calc(4rem+1.75rem)]">
        <ExportPanel onCopy={copy} announce={announce} />
        <EngineCard />
      </div>

      <div
        role="status"
        data-testid="tokens-toast"
        className="pointer-events-none fixed bottom-24 left-1/2 z-40 w-max max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-control bg-ink px-3.5 py-2.5 text-label-lg text-canvas shadow-float empty:sr-only md:bottom-6"
      >
        {notice ? <span key={notice.id}>{notice.text}</span> : null}
      </div>
    </div>
  );
}
