import type { MetadataRoute } from "next";
import { siteUrl } from "@/brand-lab/application/site-url";
import { NAV_ITEMS } from "@/brand-lab/ui/shell/nav-items";

/** A sitemap needs absolute URLs, so a build with no known domain publishes an empty one. */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = siteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  return site ? NAV_ITEMS.map(({ href }) => ({ url: new URL(href, site).href })) : [];
}
