"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import {
  GALLERY_FILTERS,
  GALLERY_SECTIONS,
  initialSpecimens,
  isSectionVisible,
  specimenReducer,
  visibleSectionCount,
  type GalleryFilter,
  type GallerySectionId,
  type SpecimenAction,
} from "../../application/gallery";
import { BRAND_IDS, BRANDS, type BrandId } from "../../domain/brands";
import { GALLERY_COPY } from "../../domain/gallery-copy";
import { BRAND_ICONS } from "../brand-icons";
import { Segmented, type SegmentedOption } from "../controls/segmented";
import { useLab } from "../lab-provider";
import { BrandScope } from "../sandbox/brand-scope";
import { useAnnouncer } from "../use-announcer";
import { useScopedState } from "../use-scoped-state";
import { ActionsSpecimen } from "./actions-specimen";
import { BadgesSpecimen } from "./badges-specimen";
import { CardSpecimen } from "./card-specimen";
import { FeedbackSpecimen } from "./feedback-specimen";
import { FormSpecimen } from "./form-specimen";
import { GalleryProvider } from "./gallery-context";
import styles from "./gallery.module.css";
import { ModalSpecimen } from "./modal-specimen";
import { TokenDiff } from "./token-diff";

const BRAND_TABS: ReadonlyArray<SegmentedOption<BrandId>> = BRAND_IDS.map((id) => {
  const Icon = BRAND_ICONS[id];
  return {
    value: id,
    label: BRANDS[id].name.split(" ")[0],
    leading: <Icon aria-hidden size={14} />,
  };
});

const SPECIMENS: Record<GallerySectionId, () => ReactNode> = {
  actions: ActionsSpecimen,
  form: FormSpecimen,
  badges: BadgesSpecimen,
  card: CardSpecimen,
  feedback: FeedbackSpecimen,
  modal: ModalSpecimen,
};

export function Gallery() {
  const { state, tokens, ready, resets, dispatch: labDispatch } = useLab();
  const { brandId } = state;
  const copy = GALLERY_COPY[brandId];
  const BrandIcon = BRAND_ICONS[brandId];

  const [filter, setFilter] = useScopedState<GalleryFilter>(`${resets}`, () => "all");
  const [specimens, setSpecimens] = useScopedState(`${brandId}:${resets}`, () =>
    initialSpecimens(copy),
  );
  const { notice, announce } = useAnnouncer(`${brandId}:${resets}`);

  const dispatch = useCallback(
    (action: SpecimenAction) => setSpecimens((current) => specimenReducer(current, action)),
    [setSpecimens],
  );
  const context = useMemo(
    () => ({ specimens, dispatch, copy, announce }),
    [specimens, dispatch, copy, announce],
  );

  return (
    <div className="mx-auto w-full max-w-5xl xl:grid xl:max-w-none xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
      <div className="min-w-0 pb-6 xl:p-7 xl:pr-5">
        <section className="flex flex-col gap-2 px-4 pt-4 pb-4 md:px-7 xl:px-0 xl:pt-0">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-label-mono tracking-wider text-ink-muted uppercase">
              <span aria-hidden className="size-2 rounded-full bg-ink motion-safe:animate-pulse" />
              System Component Lab
            </p>
            <span className="rounded-full bg-muted px-2 py-0.5 text-label-mono text-ink-muted">
              Live Diff
            </span>
          </div>
          <div>
            <h1 className="font-display text-headline-lg">Adaptive UI Kit</h1>
            <p className="mt-0.5 text-body-sm text-ink-muted">
              Real-time morphological response across brand token spaces.
            </p>
          </div>
          <Segmented
            legend="Active brand"
            hideLegend
            name="gallery-brand"
            value={brandId}
            options={BRAND_TABS}
            onChange={(next) => labDispatch({ type: "selectBrand", brandId: next })}
          />
          <div
            role="group"
            aria-label="Filter specimens by category"
            className="-mx-4 flex gap-1 overflow-x-auto px-4 py-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
          >
            {GALLERY_FILTERS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
                className={`min-h-9 shrink-0 rounded-full px-3 text-label-sm whitespace-nowrap transition-colors duration-150 ${
                  filter === id ? "bg-ink text-canvas" : "bg-subtle text-ink-muted hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p role="status" className="text-label-md text-ink-muted">
            Showing {visibleSectionCount(filter)} of {GALLERY_SECTIONS.length} sections
          </p>
        </section>

        <BrandScope
          tokens={tokens}
          role="region"
          aria-label={`${tokens.brandName} component specimens`}
          data-testid="gallery"
          data-animate={ready}
          data-ready={ready}
          className={styles.root}
        >
          <GalleryProvider value={context}>
            <div className={styles.tag}>
              <span aria-hidden className={styles.tagIcon}>
                <BrandIcon size={20} />
              </span>
              <div className={styles.tagText}>
                <p className={styles.tagTitle}>
                  <span className={styles.tagName}>{tokens.brandName}</span>
                  <span data-testid="brand-tone" className={styles.tone}>
                    {copy.tone}
                  </span>
                </p>
                <p className={styles.tagline}>{copy.tagline}</p>
              </div>
            </div>

            <div className={styles.sections}>
              {GALLERY_SECTIONS.map(({ id, title }, index) => {
                const Specimen = SPECIMENS[id];
                return (
                  <section
                    key={id}
                    aria-labelledby={`section-${id}`}
                    data-testid={`section-${id}`}
                    hidden={!isSectionVisible(id, filter)}
                    className={styles.section}
                  >
                    <div className={styles.sectionHeader}>
                      <h2 id={`section-${id}`} className={styles.sectionTitle}>
                        {title}
                      </h2>
                      <span className={styles.sectionIndex}>
                        0{index + 1} / 0{GALLERY_SECTIONS.length}
                      </span>
                    </div>
                    <Specimen />
                  </section>
                );
              })}
            </div>
          </GalleryProvider>

          <div role="status" data-testid="gallery-toast" className={styles.toast}>
            {notice ? <span key={notice.id}>{notice.text}</span> : null}
          </div>
        </BrandScope>
      </div>

      <TokenDiff />
    </div>
  );
}
