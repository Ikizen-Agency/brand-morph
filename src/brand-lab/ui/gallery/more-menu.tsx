"use client";

import { EllipsisVertical } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import styles from "./gallery.module.css";

export interface MenuAction {
  label: string;
  run: () => void;
}

interface MoreMenuProps {
  label: string;
  actions: readonly MenuAction[];
}

/** The ARIA menu pattern: focus moves into the list, arrows rove, Escape and Tab close it. */
export function MoreMenu({ label, actions }: Readonly<MoreMenuProps>) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstFocus = useRef(0);

  const items = () =>
    Array.from(wrapRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  useEffect(() => {
    if (!open) return;
    items().at(firstFocus.current)?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  const openAt = (index: number) => {
    firstFocus.current = index;
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onTriggerKey = (event: KeyboardEvent) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    openAt(event.key === "ArrowDown" ? 0 : -1);
  };

  const onMenuKey = (event: KeyboardEvent) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    const moves: Record<string, number> = {
      ArrowDown: (index + 1) % list.length,
      ArrowUp: (index - 1 + list.length) % list.length,
      Home: 0,
      End: list.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      list[moves[event.key]].focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className={styles.menuWrap}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={styles.moreButton}
        onClick={() => (open ? setOpen(false) : openAt(0))}
        onKeyDown={onTriggerKey}
      >
        <EllipsisVertical aria-hidden size={18} />
      </button>
      {open ? (
        <ul id={menuId} role="menu" aria-label={label} className={styles.menu} onKeyDown={onMenuKey}>
          {actions.map((action) => (
            <li key={action.label} role="none">
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={styles.menuItem}
                onClick={() => {
                  close();
                  action.run();
                }}
              >
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
