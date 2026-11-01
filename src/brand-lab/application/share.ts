import { writeClipboard, type ClipboardTarget } from "./clipboard";

export type ShareOutcome = "shared" | "copied" | "dismissed" | "failed";

/** The parts of `navigator` used here, optional because browsers ship them unevenly. */
export interface ShareTarget extends ClipboardTarget {
  share?: (data: ShareData) => Promise<void>;
}

export async function copyText(target: ShareTarget, text: string): Promise<boolean> {
  return (await writeClipboard(target, text)) === "copied";
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
