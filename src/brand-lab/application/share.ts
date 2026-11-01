export type ShareOutcome = "shared" | "copied" | "dismissed" | "failed";

/** The parts of `navigator` used here, optional because browsers ship them unevenly. */
export interface ShareTarget {
  share?: (data: ShareData) => Promise<void>;
  clipboard?: { writeText: (text: string) => Promise<void> };
}

export async function copyText(target: ShareTarget, text: string): Promise<boolean> {
  try {
    await target.clipboard?.writeText(text);
    return Boolean(target.clipboard);
  } catch {
    return false;
  }
}

/** Reports what really happened: a closed share sheet is not a failure and not a success. */
export async function shareLink(
  target: ShareTarget,
  data: { title: string; url: string },
): Promise<ShareOutcome> {
  if (target.share) {
    try {
      await target.share(data);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "dismissed";
    }
  }
  return (await copyText(target, data.url)) ? "copied" : "failed";
}
