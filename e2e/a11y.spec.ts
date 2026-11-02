import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { initialLabState, serializeLabState } from "../src/brand-lab/application/lab-state";
import { BRAND_IDS, type BrandId } from "../src/brand-lab/domain/brands";
import { expect, test } from "./guard";

const STORAGE_KEY = "brand-morph/lab/v1";
const ROUTES = ["/", "/components", "/tokens"] as const;

async function seedBrand(page: Page, brandId: BrandId) {
  const value = serializeLabState({ ...initialLabState, brandId });
  await page.addInitScript(([key, state]) => localStorage.setItem(key, state), [STORAGE_KEY, value]);
}

async function seriousViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();
  return violations
    .filter(({ impact }) => impact === "serious" || impact === "critical")
    .map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target.join(" ")) }));
}

test.describe("axe", () => {
  // Reduced motion lets colors settle, so contrast is measured on final values.
  test.beforeEach(({ page }) => page.emulateMedia({ reducedMotion: "reduce" }));

  for (const brandId of BRAND_IDS) {
    for (const route of ROUTES) {
      test(`${route} has no serious violations in ${brandId}`, async ({ page }) => {
        await seedBrand(page, brandId);
        await page.goto(route);
        await page.getByRole("heading", { level: 1 }).waitFor();
        await expect(page.locator("[data-ready='false'], [data-animate='false']")).toHaveCount(0);
        expect(await seriousViolations(page)).toEqual([]);
      });
    }

    test(`an open dialog and the drawer have no serious violations in ${brandId}`, async ({ page }) => {
      await seedBrand(page, brandId);
      await page.goto("/");
      await expect(page.getByTestId("sandbox")).toHaveAttribute("data-animate", "true");
      const handle = page.getByRole("button", { name: /Lab Configuration/ });
      if (await handle.isVisible()) await handle.click();
      expect(await seriousViolations(page)).toEqual([]);
      await page.getByRole("button", { name: "About this lab" }).click();
      expect(await seriousViolations(page)).toEqual([]);
    });
  }
});

test.describe("page structure", () => {
  for (const route of ROUTES) {
    test(`${route} has landmarks and one h1`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(1);
    });
  }

  test("the skip link is the first stop, visible, and moves focus to the content", async ({ page }) => {
    await page.goto("/tokens");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
  });

  test("keyboard focus is visible on a navigation link", async ({ page }) => {
    await page.goto("/");
    const link = page.locator('nav[aria-label="Primary"]:visible').getByRole("link").first();
    await link.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();
    const outline = await link.evaluate((element) => getComputedStyle(element).outlineStyle);
    expect(outline).toBe("solid");
  });

  test("solace secondary and warning never color text", async ({ page }) => {
    const seen = await Promise.all(
      (["/", "/components", "/tokens"] as const).map(async (route) => {
        const tab = await page.context().newPage();
        await tab.goto(route);
        await tab.getByRole("heading", { level: 1 }).waitFor();
        const offenders = await tab.evaluate(() => {
          const flagged = new Set(["rgb(212, 163, 115)", "rgb(217, 130, 43)"]);
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          const found: string[] = [];
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const parent = node.parentElement;
            if (!parent || !node.textContent?.trim()) continue;
            if (flagged.has(getComputedStyle(parent).color)) found.push(node.textContent.trim());
          }
          return found;
        });
        await tab.close();
        return offenders;
      }),
    );
    expect(seen.flat()).toEqual([]);
  });
});
