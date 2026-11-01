"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CopyStatus = "idle" | "copied" | "failed";

const STATUS_MS = 2500;

/** Reports what the clipboard really did: a blocked or missing API yields "failed". */
export function useCopy() {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async (text: string) => {
    let next: CopyStatus;
    try {
      await navigator.clipboard.writeText(text);
      next = "copied";
    } catch {
      next = "failed";
    }
    setStatus(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), STATUS_MS);
  }, []);

  return { status, copy };
}
