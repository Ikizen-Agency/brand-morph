import { describe, expect, it, vi } from "vitest";
import { writeClipboard } from "./clipboard";

describe("writeClipboard", () => {
  it("reports copied only after the write resolves", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await expect(writeClipboard({ clipboard: { writeText } }, "tokens")).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith("tokens");
  });

  it("reports a rejected write as failed", async () => {
    const writeText = vi.fn().mockRejectedValue(new DOMException("no", "NotAllowedError"));
    await expect(writeClipboard({ clipboard: { writeText } }, "tokens")).resolves.toBe("failed");
  });

  it("reports a missing clipboard as unavailable", async () => {
    await expect(writeClipboard({}, "tokens")).resolves.toBe("unavailable");
  });
});
