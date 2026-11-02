/** Vercel exposes the production host without a scheme. Absent means a local or preview build. */
export function siteUrl(host: string | undefined): URL | undefined {
  if (!host) return undefined;
  return URL.canParse(`https://${host}`) ? new URL(`https://${host}`) : undefined;
}
