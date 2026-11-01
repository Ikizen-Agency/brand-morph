"use client";

import { BadgeCheck, CalendarCheck, Check, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import { copyText } from "../../application/share";
import { useLab } from "../lab-provider";
import { useBooking, useGallery } from "./gallery-context";
import styles from "./gallery.module.css";
import { MoreMenu } from "./more-menu";

export function CardSpecimen() {
  const { specimens, dispatch, copy, announce } = useGallery();
  const { state } = useLab();
  const { reserved, reserve } = useBooking();
  const { practitioner, booking } = copy;
  const { profileOpen, ratingHidden } = specimens;

  const copyName = async () => {
    const copied = await copyText(navigator, practitioner.name);
    announce(copied ? `Copied ${practitioner.name}.` : "Copy failed. Clipboard access is blocked.");
  };

  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardIdentity}>
          {state.brandId === "solace" ? (
            <Image
              src="/brands/solace-doctor-portrait.jpg"
              alt=""
              width={56}
              height={56}
              className={styles.portrait}
            />
          ) : (
            <span aria-hidden className={styles.portrait}>
              {practitioner.monogram}
            </span>
          )}
          <div className={styles.cardText}>
            <h3 className={styles.cardName}>
              {practitioner.name}
              <BadgeCheck role="img" aria-label="Verified" size={16} />
            </h3>
            <p className={styles.cardRole}>{practitioner.role}</p>
            {ratingHidden ? null : (
              <p data-testid="card-rating" className={styles.cardRating}>
                <Star aria-hidden size={14} />
                <strong>{practitioner.rating}</strong>
                <span>{practitioner.reviews}</span>
              </p>
            )}
          </div>
        </div>
        <MoreMenu
          label={`More actions for ${practitioner.name}`}
          actions={[
            {
              label: profileOpen ? "Hide profile" : "View profile",
              run: () => dispatch({ type: "toggle", flag: "profileOpen" }),
            },
            { label: "Copy name", run: copyName },
            {
              label: ratingHidden ? "Show rating" : "Hide rating",
              run: () => dispatch({ type: "toggle", flag: "ratingHidden" }),
            },
          ]}
        />
      </div>

      <div className={styles.slot}>
        <CalendarCheck aria-hidden size={18} />
        <div className={styles.slotText}>
          <span className={styles.slotLabel}>{practitioner.slotLabel}</span>
          <span className={styles.slotValue}>{practitioner.slot}</span>
        </div>
        <span data-testid="slot-state" className={styles.slotPill}>
          {reserved ? booking.reserved : practitioner.mode}
        </span>
      </div>

      <div className={styles.row}>
        <button type="button" className={styles.primary} onClick={reserve}>
          {reserved ? booking.reserved : booking.reserve}
          {reserved ? <Check aria-hidden size={16} /> : <ChevronRight aria-hidden size={16} />}
        </button>
        <button
          type="button"
          className={styles.quiet}
          aria-expanded={profileOpen}
          aria-controls="gallery-profile"
          onClick={() => dispatch({ type: "toggle", flag: "profileOpen" })}
        >
          Profile
        </button>
      </div>

      <div id="gallery-profile" hidden={!profileOpen} className={styles.disclosure}>
        <p>{practitioner.bio}</p>
        <p>{practitioner.focus}</p>
      </div>
    </article>
  );
}
