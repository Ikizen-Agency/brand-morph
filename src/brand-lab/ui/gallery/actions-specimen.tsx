"use client";

import { ArrowRight, Bookmark, Calendar, Check, Heart, Share2, X } from "lucide-react";
import { useRef } from "react";
import { shareLink, type ShareOutcome } from "../../application/share";
import { BRANDS } from "../../domain/brands";
import { useLab } from "../lab-provider";
import { useBooking, useGallery } from "./gallery-context";
import styles from "./gallery.module.css";

const SHARE_MESSAGES: Record<ShareOutcome, string> = {
  shared: "Link shared.",
  copied: "Page link copied to clipboard.",
  dismissed: "Share cancelled.",
  failed: "Could not share. Clipboard access is blocked.",
};

export function ActionsSpecimen() {
  const { specimens, dispatch, copy, announce } = useGallery();
  const { state } = useLab();
  const { reserved, reserve } = useBooking();
  const bookRef = useRef<HTMLButtonElement>(null);
  const { booking, liked, bookmarked, providersOpen } = specimens;
  const { detailPanel } = BRANDS[state.brandId].copy;

  const cancel = () => {
    if (!reserved) {
      announce(copy.booking.nothingToCancel);
      return;
    }
    dispatch({ type: "cancel" });
    announce(copy.booking.cancelledStatus);
  };

  const startOver = () => {
    dispatch({ type: "reopen" });
    announce(copy.booking.idleStatus);
    bookRef.current?.focus();
  };

  const share = async () => {
    const outcome = await shareLink(navigator, { title: document.title, url: location.href });
    announce(SHARE_MESSAGES[outcome]);
  };

  const status = {
    open: copy.booking.idleStatus,
    reserved: copy.booking.reservedStatus,
    cancelled: copy.booking.cancelledStatus,
  }[booking];

  return (
    <div className={styles.panel}>
      <div className={styles.group}>
        <span className={styles.eyebrow}>Primary &amp; Secondary</span>
        <div className={styles.row}>
          <button ref={bookRef} type="button" className={styles.primary} onClick={reserve}>
            {reserved ? <Check aria-hidden size={18} /> : <Calendar aria-hidden size={18} />}
            {reserved ? copy.booking.booked : copy.booking.book}
          </button>
          <button
            type="button"
            className={styles.secondary}
            aria-expanded={providersOpen}
            aria-controls="gallery-providers"
            onClick={() => dispatch({ type: "toggle", flag: "providersOpen" })}
          >
            {copy.providers}
            <ArrowRight aria-hidden size={16} />
          </button>
        </div>
        <div id="gallery-providers" hidden={!providersOpen} className={styles.disclosure}>
          <h3 className={styles.disclosureTitle}>{detailPanel.title}</h3>
          <ul>
            {detailPanel.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.utilityRow}>
        <div className={styles.iconRow}>
          <button
            type="button"
            aria-label="Like"
            aria-pressed={liked}
            className={styles.iconButton}
            onClick={() => dispatch({ type: "toggle", flag: "liked" })}
          >
            <Heart aria-hidden size={20} fill={liked ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            aria-label="Bookmark"
            aria-pressed={bookmarked}
            className={styles.iconButton}
            onClick={() => dispatch({ type: "toggle", flag: "bookmarked" })}
          >
            <Bookmark aria-hidden size={20} fill={bookmarked ? "currentColor" : "none"} />
          </button>
          <button type="button" aria-label="Share" className={styles.iconButton} onClick={share}>
            <Share2 aria-hidden size={20} />
          </button>
        </div>
        <button type="button" className={styles.destructive} onClick={cancel}>
          <X aria-hidden size={16} />
          {copy.booking.cancel}
        </button>
      </div>

      <div className={styles.statusLine}>
        <p data-testid="booking-status">{status}</p>
        {booking === "open" ? null : (
          <button type="button" className={styles.textButton} onClick={startOver}>
            Start over
          </button>
        )}
      </div>

      <div className={styles.group}>
        <span className={styles.eyebrow}>Button State Matrix</span>
        <div className={styles.matrix}>
          <div className={styles.matrixCell}>
            <span className={styles.matrixLabel}>DEFAULT</span>
            <button
              type="button"
              aria-label="Confirm, default state"
              className={styles.matrixButton}
              onClick={() => announce("Default button pressed.")}
            >
              Confirm
            </button>
          </div>
          <div className={styles.matrixCell}>
            <span className={styles.matrixLabel}>HOVER / FOCUSED</span>
            <button
              type="button"
              aria-label="Confirm, hover or focused state"
              data-state="hover"
              className={styles.matrixButton}
              onClick={() => announce("Hover state button pressed.")}
            >
              Confirm
            </button>
          </div>
          <div className={styles.matrixCell}>
            <span className={styles.matrixLabel}>DISABLED</span>
            <button
              type="button"
              aria-label="Confirm, disabled state"
              disabled
              className={styles.matrixButton}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
