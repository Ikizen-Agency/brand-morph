"use client";

import { useEffect, useRef } from "react";
import { BRAND_IDS, BRANDS, type BrandId } from "../../domain/brands";
import { resolveColors } from "../../domain/tokens";
import { BRAND_ICONS } from "../brand-icons";
import { useLab } from "../lab-provider";

const CARD_TAGS: Record<BrandId, readonly string[]> = {
  solace: ["Curved r-24", "Spacious", "Humanist Sans", "Reassuring"],
  orbit: ["Sharp r-0", "Compact", "Bold Mono", "Direct"],
  lumen: ["Balanced r-12", "Editorial", "Serif", "Curious"],
};

const SWATCH_ROLES = ["primary", "surface", "onSurface", "secondary"] as const;

export function BrandCards() {
  const { state, dispatch } = useLab();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeIndex = BRAND_IDS.indexOf(state.brandId);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const card = scroller?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!scroller || !card) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    scroller.scrollTo({ left: card.offsetLeft - scroller.offsetLeft - 16, behavior: motion });
  }, [state.brandId]);

  return (
    <section aria-labelledby="brands-heading" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 px-4 sm:px-0">
        <h2 id="brands-heading" className="text-label-mono tracking-wider text-ink-muted uppercase">
          Active Archetype
        </h2>
        <p data-testid="brand-indicator" className="text-label-mono font-semibold">
          {activeIndex + 1} / {BRAND_IDS.length} {BRANDS[state.brandId].name.split(" ")[0]}
        </p>
      </div>
      <div
        ref={scrollerRef}
        className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-1"
      >
        {BRAND_IDS.map((id) => {
          const brand = BRANDS[id];
          const Icon = BRAND_ICONS[id];
          const colors = resolveColors(brand, state.overrides[id]);
          const active = id === state.brandId;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => dispatch({ type: "selectBrand", brandId: id })}
              className={`relative w-[280px] shrink-0 snap-start overflow-hidden rounded-enclosure border p-3.5 text-left transition-[background-color,border-color,box-shadow] duration-300 sm:w-auto ${
                active ? "border-line-strong bg-elevated shadow-float" : "border-line bg-subtle/60 hover:bg-subtle"
              }`}
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: colors.primary }} />
              <span className="flex items-start justify-between gap-2 pt-1">
                <span className="min-w-0">
                  <span
                    className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] leading-4 font-semibold ${
                      active ? "bg-ink text-canvas" : "bg-muted text-ink-muted"
                    }`}
                  >
                    {active ? "Active Brand" : "Morph Target"}
                  </span>
                  <span className="block font-display text-headline-sm">{brand.name}</span>
                  <span className="block text-body-sm text-ink-muted">{brand.copy.subtext}</span>
                </span>
                <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-subtle">
                  <Icon size={18} />
                </span>
              </span>
              <span className="my-2 flex flex-wrap gap-1.5 sm:hidden">
                {CARD_TAGS[id].map((tag) => (
                  <span key={tag} className="rounded bg-subtle px-2 py-0.5 text-[10px] leading-4 text-ink-muted">
                    {tag}
                  </span>
                ))}
              </span>
              <span className="flex items-center justify-between gap-2 sm:mt-2">
                <span aria-hidden className="flex gap-1.5">
                  {SWATCH_ROLES.map((role) => (
                    <span
                      key={role}
                      className="size-4 rounded-full border border-ink/10"
                      style={{ backgroundColor: colors[role] }}
                    />
                  ))}
                </span>
                <span className="text-label-mono text-ink-muted">{colors.primary}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
