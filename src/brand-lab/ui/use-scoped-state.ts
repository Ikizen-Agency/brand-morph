"use client";

import { useCallback, useState } from "react";

type Update<T> = T | ((current: T) => T);

/**
 * State that belongs to a scope, such as a brand. A new scope discards the old value for good,
 * so returning to an earlier scope starts clean instead of restoring what was hidden.
 */
export function useScopedState<T>(scope: string, initial: () => T) {
  const [stored, setStored] = useState(() => ({ scope, value: initial() }));
  let current = stored;
  if (stored.scope !== scope) {
    current = { scope, value: initial() };
    setStored(current);
  }

  const update = useCallback((next: Update<T>) => {
    setStored((previous) => ({
      scope: previous.scope,
      value: typeof next === "function" ? (next as (value: T) => T)(previous.value) : next,
    }));
  }, []);

  return [current.value, update] as const;
}
