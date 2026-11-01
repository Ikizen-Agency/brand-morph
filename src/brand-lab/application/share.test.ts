import { describe, expect, it, vi } from "vitest";
import { copyText, shareLink } from "./share";

const data = { title: "Brand Morph", url: "https://example.test/components" };
const reject = (name: string) => () => Promise.reject(new DOMException("no", name));

describe("shareLink", () => {
  it("uses the native sheet when it exists", async () => {
    const share = vi.fn(() => Promise.resolve());
    const writeText = vi.fn(() => Promise.resolve());
    await expect(shareLink({ share, clipboard: { writeText } }, data)).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith(data);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("falls back to copying the link", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    await expect(shareLink({ clipboard: { writeText } }, data)).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith(data.url);
  });

  it("treats a dismissed sheet as dismissed and never copies", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    const target = { share: reject("AbortError"), clipboard: { writeText } };
    await expect(shareLink(target, data)).resolves.toBe("dismissed");
    expect(writeText).not.toHaveBeenCalled();
  });

  it("copies when the native sheet refuses", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    const target = { share: reject("NotAllowedError"), clipboard: { writeText } };
    await expect(shareLink(target, data)).resolves.toBe("copied");
  });

  it("reports failure when nothing works", async () => {
    await expect(shareLink({ clipboard: { writeText: reject("NotAllowedError") } }, data)).resolves.toBe(
      "failed",
    );
    await expect(shareLink({}, data)).resolves.toBe("failed");
  });
});

describe("copyText", () => {
  it("reports what the clipboard did", async () => {
    await expect(copyText({ clipboard: { writeText: () => Promise.resolve() } }, "a")).resolves.toBe(true);
    await expect(copyText({ clipboard: { writeText: reject("NotAllowedError") } }, "a")).resolves.toBe(false);
    await expect(copyText({}, "a")).resolves.toBe(false);
  });
});
