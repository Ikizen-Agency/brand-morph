import { test as unguarded, type Page } from "@playwright/test";
import { BRAND_IDS } from "../src/brand-lab/domain/brands";
import { expectHydratedBrand, ROUTES } from "./brand-scope";
import { expect, test } from "./guard";

const WIDTHS = [320, 390, 640, 820, 1024, 1440, 1920];

const handle = (page: Page) => page.getByRole("button", { name: /Lab Configuration/ });
const panel = (page: Page) => page.locator("#inspector-panel");
const nav = (page: Page) => page.locator('nav[aria-label="Primary"]:visible');
const brandTab = (page: Page, name: string | RegExp) =>
  page.getByRole("group", { name: "Active brand" }).locator("label").filter({ hasText: name });
const option = (page: Page, group: string, name: string) =>
  page.getByRole("group", { name: group }).locator("label").filter({ hasText: name });
const radio = (page: Page, group: string, name: string) =>
  page.getByRole("group", { name: group }).getByRole("radio", { name });

async function openPlayground(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("sandbox")).toHaveAttribute("data-animate", "true");
}

/** The tablet drawer has to be open before its controls can be used. */
async function revealControls(page: Page) {
  await expect(page.getByTestId("sandbox")).toHaveAttribute("data-animate", "true");
  if (await handle(page).isVisible()) {
    await handle(page).click();
    await expect(panel(page)).toBeVisible();
  }
}

test.describe("navigation", () => {
  test("moves across all routes and marks the current one", async ({ page }) => {
    await openPlayground(page);
    for (const [label, path, heading] of [
      ["Components", "/components", "Adaptive UI Kit"],
      ["Tokens", "/tokens", "Token Architecture"],
      ["Playground", "/", /Three distinct personalities/],
    ] as const) {
      await nav(page).getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expect(nav(page).getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
    }
  });

  unguarded("an unknown route shows the studio 404 with a way back", async ({ page }) => {
    const response = await page.goto("/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page is not in the lab");
    await page.getByRole("link", { name: "Back to the Playground" }).click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("persistence", () => {
  test("brand and tuning survive route changes and a reload", async ({ page }) => {
    await page.goto("/tokens");
    await brandTab(page, "Lumen").click();
    await nav(page).getByRole("link", { name: "Playground" }).click();
    await expect(page.getByTestId("brand-indicator")).toHaveText(/Lumen/, { useInnerText: false });

    await revealControls(page);
    await option(page, "Rhythm Density", "Compact").click();
    await option(page, "CTA Silhouette", "Sharp").click();

    await nav(page).getByRole("link", { name: "Components" }).click();
    await expect(page.getByTestId("gallery")).toHaveAttribute("data-ready", "true");
    await expect(page.getByRole("radio", { name: /Lumen/ })).toBeChecked();

    await nav(page).getByRole("link", { name: "Tokens" }).click();
    await expect(page.getByTestId("density")).toHaveText(/compact/i);

    await page.reload();
    await expect(page.getByTestId("tokens-page")).toHaveAttribute("data-brand", "lumen");
    await expect(page.getByTestId("density")).toHaveText(/compact/i);

    await nav(page).getByRole("link", { name: "Playground" }).click();
    await revealControls(page);
    await expect(radio(page, "CTA Silhouette", "Sharp")).toBeChecked();
    await expect(radio(page, "Rhythm Density", "Compact")).toBeChecked();
  });
});

test.describe("tablet drawer", () => {
  test.beforeEach(({ viewport }) => {
    test.skip(viewport?.width !== 820, "the drawer exists only at tablet widths");
  });

  test("starts collapsed, with nothing in it reachable", async ({ page }) => {
    await openPlayground(page);
    await expect(handle(page)).toHaveAttribute("aria-expanded", "false");
    await expect(panel(page)).toBeHidden();
    await expect(page.getByTestId("inspector-summary")).toHaveText(/Solace Health, comfortable/);

    await handle(page).focus();
    await page.keyboard.press("Tab");
    const insidePanel = await page.evaluate(() =>
      Boolean(document.activeElement?.closest("#inspector-panel")),
    );
    expect(insidePanel).toBe(false);
  });

  test("the sandbox gets the viewport, not the controls", async ({ page }) => {
    await openPlayground(page);
    const sandbox = await page.getByTestId("device-frame").boundingBox();
    const drawer = await page.getByTestId("inspector").boundingBox();
    expect(drawer?.height).toBeLessThan(70);
    expect((sandbox?.y ?? 0) + 200).toBeLessThan(drawer?.y ?? 0);
  });

  test("opens from the keyboard, moves focus in, and Escape returns it", async ({ page }) => {
    await openPlayground(page);
    await handle(page).focus();
    await page.keyboard.press("Enter");
    await expect(handle(page)).toHaveAttribute("aria-expanded", "true");
    await expect(panel(page)).toBeVisible();
    await expect(panel(page)).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: /Active Brand Solace Health/ })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(handle(page)).toHaveAttribute("aria-expanded", "false");
    await expect(panel(page)).toBeHidden();
    await expect(handle(page)).toBeFocused();
  });

  test("is not a focus trap: Tab leaves the open drawer", async ({ page }) => {
    await openPlayground(page);
    await handle(page).click();
    await page.locator("#inspector-panel input, #inspector-panel button").last().focus();
    for (let step = 0; step < 4; step += 1) await page.keyboard.press("Tab");
    const insideDrawer = await page.evaluate(() =>
      Boolean(document.activeElement?.closest('[data-testid="inspector"]')),
    );
    expect(insideDrawer).toBe(false);
  });

  test("controls morph the sandbox live, and the summary follows", async ({ page }) => {
    await openPlayground(page);
    await handle(page).click();
    await page.getByRole("button", { name: /Orbit/ }).click();
    await expect(page.getByTestId("sandbox")).toHaveAttribute("data-brand", "orbit");
    await expect(page.getByTestId("inspector-summary")).toHaveText(/^Orbit/);
    await expect(page.getByTestId("device-frame")).toBeInViewport();
  });

  test("Escape closes the About dialog first and leaves the drawer open", async ({ page }) => {
    await openPlayground(page);
    await handle(page).click();
    await page.getByRole("button", { name: "About this lab" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(handle(page)).toHaveAttribute("aria-expanded", "true");
  });

  test("everything behind the open drawer can still be scrolled into view", async ({ page }) => {
    await openPlayground(page);
    await handle(page).click();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const ledger = await page.getByTestId("ledger").boundingBox();
    const drawer = await page.getByTestId("inspector").boundingBox();
    expect((ledger?.y ?? 0) + (ledger?.height ?? 0)).toBeLessThanOrEqual(drawer?.y ?? 0);
  });

  test("components and tokens use two columns", async ({ page }) => {
    await page.goto("/tokens");
    const left = await page.getByRole("heading", { name: "Token Architecture" }).boundingBox();
    const right = await page.getByRole("heading", { name: "Export Architecture" }).boundingBox();
    expect(right?.x ?? 0).toBeGreaterThan((left?.x ?? 0) + 200);
    expect(Math.abs((right?.y ?? 0) - (left?.y ?? 0))).toBeLessThan(120);

    await page.goto("/components");
    const actions = await page.getByTestId("section-actions").boundingBox();
    const form = await page.getByTestId("section-form").boundingBox();
    expect(form?.x ?? 0).toBeGreaterThan(actions?.x ?? 0);
  });
});

test.describe("responsive layout", () => {
  test.beforeEach(({ viewport }) => {
    test.skip(viewport?.width !== 1440, "one project is enough: each test sets its own viewport");
  });

  for (const brand of BRAND_IDS) {
    test(`${brand} never scrolls sideways at any width`, async ({ page }) => {
      await page.goto("/tokens");
      await expectHydratedBrand(page, "/tokens", "solace");
      await brandTab(page, new RegExp(brand, "i")).click();
      await expectHydratedBrand(page, "/tokens", brand);
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 800 });
        for (const route of ROUTES) {
          await page.goto(route);
          await expectHydratedBrand(page, route, brand);
          await expect
            .poll(
              () =>
                page.evaluate(
                  () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
                ),
              { message: `${route} at ${width}px` },
            )
            .toBe(true);
        }
      }
    });
  }

  test("the export output stays usable on a landscape phone", async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto("/tokens");
    const output = page.getByTestId("export-output");
    await output.scrollIntoViewIfNeeded();
    await expect(output).toBeInViewport();
    expect((await output.boundingBox())?.height).toBeGreaterThanOrEqual(200);
  });

  test("breakpoints follow the browser font size, like the Tailwind layout", async ({ page }) => {
    const session = await page.context().newCDPSession(page);
    await session.send("Page.setFontSizes", { fontSizes: { standard: 20, fixed: 16 } });

    // 40rem is 800px and 64rem is 1280px here, so 700px is a phone and 1100px is a tablet.
    await page.setViewportSize({ width: 700, height: 900 });
    await openPlayground(page);
    await expect(page.locator("body")).toHaveCSS("font-size", "20px");
    await expect(handle(page)).toBeHidden();
    await expect(page.locator('nav[aria-label="Primary"]:visible')).toHaveCount(1);

    await page.goto("/components");
    const actions = await page.getByTestId("section-actions").boundingBox();
    const form = await page.getByTestId("section-form").boundingBox();
    expect(form?.x).toBe(actions?.x);

    await page.setViewportSize({ width: 1100, height: 900 });
    await openPlayground(page);
    await handle(page).click();
    await expect(panel(page)).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();
  });

  test("the workbench is a tri-pane from 1024px up", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await openPlayground(page);
    await expect(handle(page)).toBeHidden();
    const left = await page.getByTestId("inspector").boundingBox();
    const center = await page.getByTestId("device-frame").boundingBox();
    const right = await page.getByTestId("ledger").boundingBox();
    expect(left?.x).toBe(0);
    expect((left?.width ?? 0) + (left?.x ?? 0)).toBeLessThanOrEqual(center?.x ?? 0);
    expect((center?.x ?? 0) + (center?.width ?? 0)).toBeLessThanOrEqual(right?.x ?? 0);
  });

  test("very wide screens keep content at a readable width", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    for (const route of ROUTES) {
      await page.goto(route);
      const box = await page.locator("main > div").first().boundingBox();
      expect(box?.width).toBeLessThanOrEqual(1680);
      expect(box?.x).toBeGreaterThan(0);
    }
  });
});

test.describe("metadata", () => {
  test("publishes a title, a description and an Open Graph image", async ({ page, request }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Brand Morph");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /three brands/);
    const image = await page.locator('meta[property="og:image"]').first().getAttribute("content");
    const { pathname } = new URL(image as string);
    const response = await request.get(pathname);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
  });

  test("serves an icon, robots and a sitemap", async ({ request }) => {
    for (const path of ["/icon.svg", "/robots.txt", "/sitemap.xml"]) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
  });
});
