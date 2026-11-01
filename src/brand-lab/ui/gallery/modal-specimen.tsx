"use client";

import { Lock, LockOpen, ShieldCheck, X } from "lucide-react";
import { useId, useRef } from "react";
import { canAuthorize } from "../../application/gallery";
import { useGallery } from "./gallery-context";
import styles from "./gallery.module.css";

export function ModalSpecimen() {
  const { specimens, dispatch, copy, announce } = useGallery();
  const { authorized } = specimens;
  const { intake, consent } = copy;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const blocked = !canAuthorize(specimens);

  const toggleAuthorization = () => {
    if (blocked) {
      announce(consent.required);
      return;
    }
    dispatch({ type: authorized ? "revoke" : "authorize" });
    announce(authorized ? intake.revoked : intake.authorized);
  };

  const toggleFromDialog = () => {
    if (blocked) return;
    dialogRef.current?.close();
    toggleAuthorization();
  };

  const authorizeLabel = authorized ? "Revoke authorization" : "Authorize & Begin";
  const AuthorizeIcon = authorized ? LockOpen : Lock;

  return (
    <div className={styles.sheetFrame}>
      <div className={styles.sheet}>
        <span aria-hidden className={styles.grabber} />
        <div className={styles.sheetHead}>
          <div>
            <span className={styles.eyebrow}>{intake.eyebrow}</span>
            <h3 className={styles.sheetTitle}>{intake.title}</h3>
          </div>
          <span aria-hidden className={styles.sheetBadge}>
            <ShieldCheck size={18} />
          </span>
        </div>
        <p className={styles.sheetBody}>{intake.body}</p>
        <div className={styles.keyValue}>
          <span>{intake.keyLabel}</span>
          <strong>{intake.keyValue}</strong>
        </div>
        <p data-testid="authorization-state" className={styles.helper}>
          {authorized ? "Authorized for this demo." : "Awaiting authorization."}
        </p>
        {blocked ? <p className={styles.error}>{consent.required}</p> : null}
        <div className={styles.row}>
          <button type="button" className={styles.primary} onClick={toggleAuthorization}>
            <AuthorizeIcon aria-hidden size={16} />
            {authorizeLabel}
          </button>
          <button type="button" className={styles.quiet} onClick={() => dialogRef.current?.showModal()}>
            Review Terms
          </button>
        </div>
      </div>

      {/* A native modal dialog: focus trap, Escape and focus return come from the platform. */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className={styles.dialog}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div data-testid="dialog-body" className={styles.dialogBody}>
          <span aria-hidden className={styles.grabber} />
          <div className={styles.sheetHead}>
            <div>
              <span className={styles.eyebrow}>{intake.eyebrow}</span>
              <h3 id={titleId} className={styles.sheetTitle}>
                {intake.title} terms
              </h3>
            </div>
            <form method="dialog">
              <button type="submit" aria-label="Close terms" className={styles.iconButton}>
                <X aria-hidden size={18} />
              </button>
            </form>
          </div>
          <ul className={styles.terms}>
            {intake.terms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
          {blocked ? <p className={styles.error}>{consent.required}</p> : null}
          <button
            type="button"
            className={styles.primary}
            aria-disabled={blocked}
            onClick={toggleFromDialog}
          >
            <AuthorizeIcon aria-hidden size={16} />
            {authorizeLabel}
          </button>
        </div>
      </dialog>
    </div>
  );
}
