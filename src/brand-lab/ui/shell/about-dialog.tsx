"use client";

import { X } from "lucide-react";
import { forwardRef, useId } from "react";

/** A native modal dialog: focus trap, Escape and focus return come from the platform. */
export const AboutDialog = forwardRef<HTMLDialogElement>(function AboutDialog(_props, ref) {
  const titleId = useId();

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="m-auto w-[calc(100vw-2rem)] max-w-md rounded-enclosure border border-line bg-elevated p-0 text-ink shadow-float backdrop:bg-ink/40"
    >
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-display text-headline-md">
            About this lab
          </h2>
          <form method="dialog">
            <button
              type="submit"
              aria-label="Close about dialog"
              className="flex size-9 items-center justify-center rounded-control border border-line text-ink transition-colors duration-150 hover:bg-subtle"
            >
              <X aria-hidden size={18} />
            </button>
          </form>
        </div>
        <p className="text-body-md text-ink-muted">
          Brand Morph is an interactive design lab by Ikizen. One product structure morphs across
          three business identities: Solace Health, Orbit Supply and Lumen Academy.
        </p>
        <p className="text-body-md text-ink-muted">
          Every visual difference comes from design tokens. Pick a brand, tune density, radius and
          CTA shape, and the sandbox, the token ledger and the exports all read from the same typed
          source.
        </p>
        <p className="text-body-md text-ink-muted">
          Your choices stay in this browser. There is no account, backend or tracking, and the
          sandbox forms send nothing.
        </p>
      </div>
    </dialog>
  );
});
