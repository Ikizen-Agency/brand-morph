"use client";

import { useCallback, useEffect, useRef } from "react";
import { useScopedState } from "./use-scoped-state";

export type Announce = (text: string) => void;

const NOTICE_MS = 4000;

export interface Notice {
  id: number;
  text: string;
}

/**
 * Transient feedback owned by a scope. A new scope drops the current message, and work that
 * finishes after the scope changed stays silent instead of reporting on state that is gone.
 */
export function useAnnouncer(scope: string) {
  const [notice, setNotice] = useScopedState<Notice | null>(scope, () => null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const liveScope = useRef(scope);

  useEffect(() => {
    liveScope.current = scope;
  }, [scope]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const announce = useCallback<Announce>(
    (text) => {
      if (liveScope.current !== scope) return;
      setNotice((current) => ({ id: (current?.id ?? 0) + 1, text }));
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setNotice(null), NOTICE_MS);
    },
    [scope, setNotice],
  );

  return { notice, announce };
}
