"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { describeLab } from "../../application/ledger";
import { useLab } from "../lab-provider";
import styles from "./inspector-drawer.module.css";

const TABLET_QUERY = "(40rem <= width < 64rem)";

/**
 * The lab configuration: a non-modal bottom drawer on tablets, so the sandbox stays live and
 * reachable behind it. Phones and desktops show the same single copy of the controls in the flow.
 */
export function InspectorDrawer({
  open,
  onOpenChange,
  className,
  children,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className: string;
  children: ReactNode;
}>) {
  const { state } = useLab();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(open);

  useEffect(() => {
    if (open && !wasOpen.current) panelRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !matchMedia(TABLET_QUERY).matches) return;
      // A native dialog on top owns this Escape.
      if (document.querySelector("dialog[open]")) return;
      if (panelRef.current?.contains(document.activeElement)) toggleRef.current?.focus();
      onOpenChange(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onOpenChange]);

  return (
    <aside aria-label="Lab configuration" data-testid="inspector" data-open={open} className={`${styles.drawer} ${className}`}>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls="inspector-panel"
        onClick={() => onOpenChange(!open)}
        className={styles.handle}
      >
        <span className="min-w-0">
          <span className="block text-label-mono font-semibold uppercase">Lab Configuration</span>
          <span data-testid="inspector-summary" className="block truncate text-label-md text-ink-muted">
            {describeLab(state)}
          </span>
        </span>
        <ChevronUp aria-hidden size={20} className={styles.chevron} />
      </button>
      <div
        ref={panelRef}
        id="inspector-panel"
        tabIndex={-1}
        className={`flex flex-col gap-6 pb-6 outline-none sm:pb-0 lg:gap-5 lg:p-5 ${styles.panel}`}
      >
        {children}
      </div>
    </aside>
  );
}
