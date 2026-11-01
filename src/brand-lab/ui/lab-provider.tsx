"use client";

import {
  createContext,
  use,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  effectiveTokens,
  initialLabSession,
  labSessionReducer,
  parseLabState,
  serializeLabState,
  type LabAction,
  type LabState,
} from "../application/lab-state";
import type { TokenSet } from "../domain/tokens";

const STORAGE_KEY = "brand-morph/lab/v1";

function readPersisted(): LabState | null {
  try {
    return parseLabState(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function writePersisted(state: LabState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeLabState(state));
  } catch {
    // Storage can be blocked or full. The lab keeps working for this visit.
  }
}

interface LabContextValue {
  state: LabState;
  tokens: TokenSet;
  /** False until the persisted state has been read on this client. */
  ready: boolean;
  resets: number;
  dispatch: Dispatch<LabAction>;
}

const LabContext = createContext<LabContextValue | null>(null);

export function LabProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [session, dispatch] = useReducer(labSessionReducer, initialLabSession);
  const { lab, ready, resets } = session;

  useEffect(() => {
    dispatch({ type: "hydrate", restored: readPersisted() });
  }, []);

  useEffect(() => {
    if (ready) writePersisted(lab);
  }, [lab, ready]);

  const value = useMemo(
    () => ({ state: lab, tokens: effectiveTokens(lab), ready, resets, dispatch }),
    [lab, ready, resets],
  );

  return <LabContext value={value}>{children}</LabContext>;
}

export function useLab(): LabContextValue {
  const value = use(LabContext);
  if (!value) throw new Error("useLab must be used inside LabProvider");
  return value;
}
