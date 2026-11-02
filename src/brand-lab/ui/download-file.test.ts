import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadFile } from "./download-file";

describe("downloadFile", () => {
  const revoke = vi.fn();
  const click = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("URL", { createObjectURL: () => "blob:tokens", revokeObjectURL: revoke });
    vi.stubGlobal("document", {
      createElement: () => ({ click, remove: vi.fn() }),
      body: { append: vi.fn() },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("keeps the object URL alive after the click so the browser can read it", () => {
    downloadFile("tokens.css", "text/css", "a{}");
    expect(click).toHaveBeenCalledOnce();
    expect(revoke).not.toHaveBeenCalled();
  });

  it("releases the object URL once the browser has had time to start", () => {
    downloadFile("tokens.css", "text/css", "a{}");
    vi.runAllTimers();
    expect(revoke).toHaveBeenCalledExactlyOnceWith("blob:tokens");
  });
});
