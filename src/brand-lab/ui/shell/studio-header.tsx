"use client";

import { Info, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLab } from "../lab-provider";
import { AboutDialog } from "./about-dialog";
import { HeaderNav } from "./studio-nav";

const NOTICE_MS = 2500;

function Emblem() {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className="size-8 shrink-0">
      <rect width="32" height="32" rx="8" fill="#1F2421" />
      <circle cx="12" cy="13" r="6" fill="#5E8271" />
      <circle cx="20" cy="13" r="6" fill="#0047FF" fillOpacity="0.85" />
      <circle cx="16" cy="20" r="6" fill="#FFAE00" fillOpacity="0.85" />
    </svg>
  );
}

const iconButton =
  "flex size-11 items-center justify-center rounded-control border border-line text-ink transition-colors duration-150 hover:bg-subtle";

export function StudioHeader() {
  const { dispatch } = useLab();
  const aboutRef = useRef<HTMLDialogElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [notice, setNotice] = useState("");

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  const reset = () => {
    dispatch({ type: "reset" });
    setNotice("Lab reset to defaults");
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), NOTICE_MS);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-2 px-4 md:px-7 xl:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Emblem />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="truncate font-display text-headline-sm">Brand Morph</span>
              <span className="shrink-0 rounded-full bg-subtle px-1.5 py-0.5 text-[9px] leading-3 font-medium tracking-wider text-ink-muted uppercase">
                Lab
              </span>
            </div>
            <p className="truncate text-label-sm text-ink-muted">An interactive design lab by Ikizen</p>
          </div>
        </div>
        <HeaderNav />
        <div className="flex shrink-0 items-center justify-end gap-1 md:flex-1">
          <button type="button" aria-label="Reset lab" onClick={reset} className={iconButton}>
            <RotateCcw aria-hidden size={18} />
          </button>
          <button
            type="button"
            aria-label="About this lab"
            aria-haspopup="dialog"
            onClick={() => aboutRef.current?.showModal()}
            className={iconButton}
          >
            <Info aria-hidden size={18} />
          </button>
        </div>
      </div>
      <p
        role="status"
        className="absolute top-full right-4 mt-1 rounded-full border border-line bg-elevated px-3 py-1 text-label-md text-ink shadow-float empty:border-0 empty:p-0 md:right-7 xl:right-5"
      >
        {notice}
      </p>
      <AboutDialog ref={aboutRef} />
    </header>
  );
}
