export type ClipboardOutcome = "copied" | "failed" | "unavailable";

/** The part of `navigator` used here, optional because insecure contexts do not have it. */
export interface ClipboardTarget {
  clipboard?: { writeText: (text: string) => Promise<void> };
}

/** Reports what the browser really did, only after the write settles. */
export async function writeClipboard(
  target: ClipboardTarget,
  text: string,
): Promise<ClipboardOutcome> {
  if (!target.clipboard) return "unavailable";
  try {
    await target.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
