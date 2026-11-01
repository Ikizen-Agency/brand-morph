"use client";

import { useCallback } from "react";
import { writeClipboard, type ClipboardOutcome } from "../../application/clipboard";
import type { Announce } from "../use-announcer";

/** Copies text, then reports the real outcome under a short name for what was copied. */
export type CopyToken = (text: string, label: string) => Promise<void>;

const MESSAGES: Record<ClipboardOutcome, (label: string) => string> = {
  copied: (label) => `Copied ${label}.`,
  failed: () => "Copy failed. Clipboard access is blocked.",
  unavailable: () => "Clipboard is unavailable here. Select the text and copy it by hand.",
};

export function useTokenCopy(announce: Announce): CopyToken {
  return useCallback(
    async (text, label) => {
      const outcome = await writeClipboard(navigator, text);
      announce(MESSAGES[outcome](label));
    },
    [announce],
  );
}
