import type { Page } from "@playwright/test";
import type { BrandId } from "../src/brand-lab/domain/brands";
import { expect } from "./guard";

export const ROUTES = ["/", "/components", "/tokens"] as const;

const SCOPE_BY_ROUTE: Record<(typeof ROUTES)[number], string> = {
  "/": "sandbox",
  "/components": "gallery",
  "/tokens": "tokens-page",
};

/**
 * Pages prerender as the default brand and pick up the persisted one on hydration, so a test
 * that measures too early, or whose state never applied, would silently cover Solace.
 */
export async function expectHydratedBrand(
  page: Page,
  route: (typeof ROUTES)[number],
  brandId: BrandId,
) {
  await expect(page.locator("[data-ready='false'], [data-animate='false']")).toHaveCount(0);
  await expect(page.getByTestId(SCOPE_BY_ROUTE[route])).toHaveAttribute("data-brand", brandId);
}
