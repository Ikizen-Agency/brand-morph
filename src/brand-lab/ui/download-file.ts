/** Long enough for a browser to start reading the Blob, even behind a save prompt. */
const REVOKE_DELAY_MS = 30_000;

/** Hands generated text to the browser's download flow. The browser decides what happens next. */
export function downloadFile(fileName: string, mimeType: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}
