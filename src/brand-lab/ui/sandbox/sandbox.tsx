"use client";

import { ArrowRight, Check, Lock, Star } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { BRAND_IDS, BRANDS, type BrandId } from "../../domain/brands";
import type { TokenSet } from "../../domain/tokens";
import { BrandScope } from "./brand-scope";
import { LumenHeroArt, OrbitHeroArt } from "./hero-art";
import { useScopedState } from "../use-scoped-state";
import { PillarIcon } from "./pillar-icon";
import styles from "./sandbox.module.css";

const HERO_ART: Record<BrandId, (alt: string) => ReactNode> = {
  solace: (alt) => (
    <Image
      src="/brands/solace-hero-studio.jpg"
      alt={alt}
      fill
      loading="eager"
      sizes="(min-width: 768px) 640px, 390px"
      className={styles.heroPhoto}
    />
  ),
  orbit: (alt) => <OrbitHeroArt alt={alt} />,
  lumen: (alt) => <LumenHeroArt alt={alt} />,
};

/** Re-keyed per brand, so swapped copy fades in instead of snapping. */
function Morphing({ id, children }: Readonly<{ id: BrandId; children: ReactNode }>) {
  return (
    <span key={id} className={styles.morphing}>
      {children}
    </span>
  );
}

const CLEAN_DEMO = { confirmed: false, detailsOpen: false };

interface SandboxProps {
  tokens: TokenSet;
  resets: number;
  /** Morph transitions stay off until persisted state is restored. */
  animate: boolean;
}

export function Sandbox({ tokens, resets, animate }: Readonly<SandboxProps>) {
  const { brandId } = tokens;
  const { name, copy } = BRANDS[brandId];
  const [demo, setDemo] = useScopedState(`${brandId}:${resets}`, () => CLEAN_DEMO);

  const confirm = () => setDemo({ ...demo, confirmed: true });
  const undo = () => setDemo({ ...demo, confirmed: false });
  const toggleDetails = () => setDemo({ ...demo, detailsOpen: !demo.detailsOpen });

  return (
    <BrandScope
      tokens={tokens}
      role="region"
      aria-label={`${name} preview`}
      data-testid="sandbox"
      data-animate={animate}
      className={styles.root}
    >
      <div className={styles.browser}>
        <span aria-hidden className={styles.dots}>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.url}>
          <Lock aria-hidden size={11} />
          {copy.url}
        </span>
      </div>

      <div className={styles.appbar}>
        <span className={styles.identity}>
          <span aria-hidden className={styles.logo}>
            {copy.logo}
          </span>
          <span className={styles.brandName}>{name}</span>
        </span>
        <button type="button" className={styles.navCta} aria-pressed={demo.confirmed} onClick={confirm}>
          {demo.confirmed ? <Check aria-hidden size={14} /> : null}
          {copy.navCta}
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <span className={styles.badge}>
              <Morphing id={brandId}>{copy.badge}</Morphing>
            </span>
            <h2 className={styles.headline}>
              <Morphing id={brandId}>{copy.headline}</Morphing>
            </h2>
            <p className={styles.description}>
              <Morphing id={brandId}>{copy.description}</Morphing>
            </p>
          </div>

          <figure className={styles.art}>
            {BRAND_IDS.map((id) => (
              <div key={id} className={styles.artLayer} data-active={id === brandId} aria-hidden={id !== brandId}>
                {HERO_ART[id](id === brandId ? copy.heroAlt : "")}
              </div>
            ))}
            <figcaption className={styles.artTag}>
              <Morphing id={brandId}>{copy.heroTag}</Morphing>
            </figcaption>
          </figure>

          <div className={styles.heroActions}>
            <div className={styles.ctas}>
              <button type="button" className={styles.ctaPrimary} aria-pressed={demo.confirmed} onClick={confirm}>
                {demo.confirmed ? copy.ctaConfirmed : copy.ctaPrimary}
                {demo.confirmed ? <Check aria-hidden size={16} /> : <ArrowRight aria-hidden size={16} />}
              </button>
              <button
                type="button"
                className={styles.ctaSecondary}
                aria-expanded={demo.detailsOpen}
                onClick={toggleDetails}
              >
                {copy.ctaSecondary}
              </button>
            </div>
            <div role="status" className={styles.liveRegion}>
              {demo.confirmed ? (
                <div className={styles.confirmation}>
                  <span>
                    <strong>{copy.ctaConfirmed}.</strong> {copy.confirmationDetail} Demo only,
                    nothing was sent.
                  </span>
                  <button type="button" className={styles.undo} onClick={undo}>
                    Undo
                  </button>
                </div>
              ) : null}
            </div>
            {demo.detailsOpen ? (
              <div className={styles.details}>
                <h3 className={styles.detailsTitle}>{copy.detailPanel.title}</h3>
                <ul>
                  {copy.detailPanel.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <section className={styles.pillarGroup}>
          <h3 className={styles.sectionLabel}>{copy.sectionLabel}</h3>
          <ul className={styles.pillars}>
            {copy.pillars.map((pillar) => (
              <li key={pillar.title} className={styles.card}>
                <span className={styles.pillarIcon}>
                  <PillarIcon name={pillar.icon} />
                </span>
                <span>
                  <strong className={styles.pillarTitle}>{pillar.title}</strong>
                  <span className={styles.pillarText}>{pillar.description}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className={styles.proof}>
          <figure className={styles.testimonial}>
            <div className={styles.rating}>
              <span aria-hidden className={styles.stars}>
                {[0, 1, 2, 3, 4].map((star) => (
                  <Star key={star} size={15} fill="currentColor" />
                ))}
              </span>
              <span>{copy.rating}</span>
            </div>
            <blockquote className={styles.quote}>{copy.testimonial}</blockquote>
            <figcaption className={styles.author}>
              {brandId === "solace" ? (
                <Image
                  src="/brands/solace-member-elena.jpg"
                  alt=""
                  width={24}
                  height={24}
                  className={styles.avatar}
                />
              ) : (
                <span aria-hidden className={styles.avatar}>
                  {copy.author.charAt(0)}
                </span>
              )}
              {copy.author}
            </figcaption>
          </figure>

          <dl className={styles.stats}>
            {copy.stats.map((stat) => (
              <div key={stat.label}>
                <dd>{stat.value}</dd>
                <dt>{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <footer className={styles.footer}>
          <span>{copy.footerHours}</span>
          <span>{copy.footerSupport}</span>
        </footer>
      </div>
    </BrandScope>
  );
}
