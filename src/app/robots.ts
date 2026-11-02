import type { MetadataRoute } from "next";
import { siteUrl } from "@/brand-lab/application/site-url";

export default function robots(): MetadataRoute.Robots {
  const site = siteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: site ? new URL("/sitemap.xml", site).href : undefined,
  };
}
