import { expect, test as base, type Locator, type Page } from "@playwright/test";

const STORAGE_KEY = "brand-morph/lab/v1";

/** Fails any test that logs a console error, throws, or requests a third-party host. */
const test = base.extend<{ guard: void }>({
  guard: [
    async ({ page, baseURL }, use) => {
      const problems: string[] = [];
      const origin = new URL(baseURL as string).origin;
      page.on("console", (message) => {
        if (message.type() === "error") problems.push(`console: ${message.text()}`);
      });
      page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (url.protocol.startsWith("http") && url.origin !== origin) {
          problems.push(`third-party request: ${request.url()}`);
        }
      });
      page.on("response", (response) => {
        if (response.status() >= 400) problems.push(`${response.status()}: ${response.url()}`);
      });
      await use();
      expect(problems).toEqual([]);
    },
    { auto: true },
  ],
});

const sandbox = (page: Page) => page.getByTestId("sandbox");
const ledger = (page: Page) => page.getByTestId("ledger");
const brandCard = (page: Page, name: string) => page.getByRole("button", { name: new RegExp(name) });
const primaryNav = (page: Page) => page.locator('nav[aria-label="Primary"]:visible');

/** Radios are visually hidden inside their label, so tests click what a visitor clicks. */
const option = (page: Page, group: string, name: string) =>
  page.getByRole("group", { name: group }).locator("label").filter({ hasText: name });
const radio = (page: Page, group: string, name: string) =>
  page.getByRole("group", { name: group }).getByRole("radio", { name });

async function ledgerValue(page: Page, name: string) {
  return ledger(page).locator("div", { hasText: `${name}:` }).locator("dd").first();
}

async function openReady(page: Page, path = "/") {
  await page.goto(path);
  if (path === "/") await expect(sandbox(page)).toHaveAttribute("data-animate", "true");
}

function computed(locator: Locator, property: string) {
  return locator.evaluate(
    (element, name) => getComputedStyle(element).getPropertyValue(name),
    property,
  );
}

test.describe("navigation", () => {
  test("every primary link reaches its route and marks itself current", async ({ page }) => {
    await openReady(page);
    const nav = primaryNav(page);
    await expect(nav.getByRole("link", { name: "Playground" })).toHaveAttribute("aria-current", "page");

    await nav.getByRole("link", { name: "Components" }).click();
    await expect(page).toHaveURL(/\/components$/);
    await expect(page.getByRole("heading", { level: 1, name: "Components" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Components" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Playground" })).not.toHaveAttribute("aria-current");

    await nav.getByRole("link", { name: "Tokens" }).click();
    await expect(page).toHaveURL(/\/tokens$/);
    await expect(page.getByRole("heading", { level: 1, name: "Tokens" })).toBeVisible();

    await page.getByRole("link", { name: "Back to Playground" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(sandbox(page)).toBeVisible();
  });

  test("Inspect Tokens links to the tokens route", async ({ page }) => {
    await openReady(page);
    await page.getByRole("link", { name: "Inspect Tokens" }).click();
    await expect(page).toHaveURL(/\/tokens$/);
  });
});

test.describe("brand morph", () => {
  test("brand cards morph copy, fonts, art and the ledger", async ({ page }) => {
    await openReady(page);
    await expect(sandbox(page)).toHaveAttribute("data-brand", "solace");
    const headlineFont = () => computed(sandbox(page).getByRole("heading", { level: 2 }), "font-family");
    const solaceFont = await headlineFont();
    await expect(sandbox(page).getByRole("img", { name: /wellness studio/ })).toBeVisible();

    await brandCard(page, "Orbit Supply").click();
    await expect(sandbox(page)).toHaveAttribute("data-brand", "orbit");
    await expect(sandbox(page).getByRole("heading", { name: /Engineered essentials/ })).toBeVisible();
    await expect(sandbox(page).getByText("DROP 04 • MODULAR EDC KIT")).toBeVisible();
    await expect(page.getByTestId("brand-indicator")).toHaveText("2 / 3 Orbit");
    await expect(await ledgerValue(page, "--brand-primary")).toHaveText("#0047FF;");
    await expect(brandCard(page, "Orbit Supply")).toHaveAttribute("aria-pressed", "true");
    const orbitFont = await headlineFont();
    expect(orbitFont).not.toBe(solaceFont);
    expect(orbitFont).toMatch(/JetBrains/i);

    await brandCard(page, "Lumen Academy").click();
    await expect(sandbox(page).getByText("Prof. Iris Okafor • Dean of Studios")).toBeVisible();
    expect(await headlineFont()).toMatch(/Source.?Serif/i);
    await expect(await ledgerValue(page, "--brand-primary")).toHaveText("#2B1E70;");
  });

  test("every hero exposes its alt text as an accessible name", async ({ page }) => {
    await openReady(page);
    const art = sandbox(page).getByRole("figure").first().getByRole("img");
    await expect(art).toHaveAccessibleName(/Sunlit wellness studio/);
    await brandCard(page, "Orbit Supply").click();
    await expect(art).toHaveAccessibleName(/Blueprint of an orbital hardware assembly/);
    await brandCard(page, "Lumen Academy").click();
    await expect(art).toHaveAccessibleName(/arcade of tall arched windows/);
  });

  test("brand fonts really load", async ({ page }) => {
    await openReady(page);
    await brandCard(page, "Orbit Supply").click();
    await expect
      .poll(() =>
        page.evaluate(async () => {
          await document.fonts.ready;
          return [...document.fonts].some(
            (face) => face.family.includes("JetBrains") && face.status === "loaded",
          );
        }),
      )
      .toBe(true);
  });

  test("quick pills switch brand and support arrow keys", async ({ page }) => {
    await openReady(page);
    await option(page, "Quick brand switch", "Lumen").click();
    await expect(sandbox(page)).toHaveAttribute("data-brand", "lumen");
    await radio(page, "Quick brand switch", "Lumen").focus();
    await page.keyboard.press("ArrowLeft");
    await expect(sandbox(page)).toHaveAttribute("data-brand", "orbit");
  });

  test("selecting the active brand keeps tuning edits", async ({ page }) => {
    await openReady(page);
    await option(page, "Rhythm Density", "Compact").click();
    await brandCard(page, "Solace Health").click();
    await expect(radio(page, "Rhythm Density", "Compact")).toBeChecked();
  });
});

test.describe("tuning rack", () => {
  test("device switch reflows the sandbox at real widths", async ({ page }) => {
    await openReady(page);
    const columns = async () =>
      (await computed(sandbox(page).locator("ul").last(), "grid-template-columns")).split(" ").length;
    const width = () => sandbox(page).evaluate((element) => element.clientWidth);

    expect(await width()).toBe(390);
    expect(await columns()).toBe(1);

    await option(page, "Simulation Stage", "Tablet").click();
    await expect(page.getByTestId("viewport-pill")).toContainText("Tablet 768px");
    await expect.poll(width).toBe(768);
    expect(await columns()).toBe(3);

    await option(page, "Simulation Stage", "Desktop").click();
    await expect(page.getByTestId("viewport-pill")).toContainText("Desktop 1280px");
    await expect.poll(width).toBe(1280);
    await expect
      .poll(() => sandbox(page).getByRole("figure").first().evaluate((el) => el.clientHeight))
      .toBeGreaterThan(400);

    const frame = await page.getByTestId("device-frame").boundingBox();
    const viewport = page.viewportSize();
    expect(frame && viewport && frame.width <= viewport.width).toBe(true);
  });

  test("density, radius and CTA silhouette restyle the sandbox and the ledger", async ({ page }) => {
    await openReady(page);
    const content = sandbox(page).getByRole("heading", { level: 2 }).locator("xpath=ancestor::div[3]");
    const card = sandbox(page).getByRole("listitem").first();
    const cta = sandbox(page).getByRole("button", { name: "Book a consultation" });

    await option(page, "Rhythm Density", "Compact").click();
    await expect.poll(() => computed(content, "row-gap")).toBe("8px");
    await expect(await ledgerValue(page, "--density")).toHaveText("compact;");

    await option(page, "Geometry / Radius", "r-0").click();
    await expect.poll(() => computed(card, "border-top-left-radius")).toBe("0px");
    await expect(await ledgerValue(page, "--radius")).toHaveText("0px;");

    await option(page, "CTA Silhouette", "Block").click();
    await expect.poll(() => computed(cta, "border-top-left-radius")).toBe("0px");
    await expect.poll(() => computed(cta, "box-shadow")).toContain("3px 3px 0px");
    await expect(await ledgerValue(page, "--btn")).toHaveText("block;");

    await option(page, "CTA Silhouette", "Sharp").click();
    await expect.poll(() => computed(cta, "border-top-left-radius")).toBe("6px");
  });

  test("auto-match restores the archetype of the active brand", async ({ page }) => {
    await openReady(page);
    await brandCard(page, "Orbit Supply").click();
    await option(page, "Rhythm Density", "Comfort").click();
    await option(page, "Geometry / Radius", "r-24").click();
    await option(page, "CTA Silhouette", "Pill").click();
    await page.getByRole("button", { name: "Auto-match" }).click();
    await expect(radio(page, "Rhythm Density", "Compact")).toBeChecked();
    await expect(radio(page, "Geometry / Radius", "r-0")).toBeChecked();
    await expect(radio(page, "CTA Silhouette", "Block")).toBeChecked();
    await expect(sandbox(page)).toHaveAttribute("data-brand", "orbit");
  });
});

test.describe("sandbox CTAs", () => {
  test("primary and nav CTAs confirm locally and undo", async ({ page }) => {
    await openReady(page);
    await sandbox(page).getByRole("button", { name: "Book a consultation" }).click();
    await expect(sandbox(page).getByRole("status")).toContainText("nothing was sent");
    await expect(sandbox(page).getByRole("button", { name: "Consultation requested" })).toBeVisible();

    await sandbox(page).getByRole("button", { name: "Undo" }).click();
    await expect(sandbox(page).getByRole("status")).toBeEmpty();

    await sandbox(page).getByRole("button", { name: "Book Consult" }).click();
    await expect(sandbox(page).getByRole("status")).toContainText("nothing was sent");
  });

  test("the confirmation live region is mounted before it has anything to say", async ({ page }) => {
    await openReady(page);
    await expect(sandbox(page).getByRole("status")).toHaveCount(1);
    await expect(sandbox(page).getByRole("status")).toBeEmpty();
  });

  test("returning to a brand does not resurrect its old confirmation", async ({ page }) => {
    await openReady(page);
    await sandbox(page).getByRole("button", { name: "Book a consultation" }).click();
    const details = sandbox(page).getByRole("button", { name: "Meet our practitioners" });
    await details.click();

    await brandCard(page, "Orbit Supply").click();
    await expect(sandbox(page)).toHaveAttribute("data-brand", "orbit");
    await brandCard(page, "Solace Health").click();
    await expect(sandbox(page)).toHaveAttribute("data-brand", "solace");

    await expect(sandbox(page).getByRole("status")).toBeEmpty();
    await expect(sandbox(page).getByRole("button", { name: "Book a consultation" })).toBeVisible();
    await expect(details).toHaveAttribute("aria-expanded", "false");
  });

  test("secondary CTA toggles brand details and morphing clears the demo", async ({ page }) => {
    await openReady(page);
    const details = sandbox(page).getByRole("button", { name: "Meet our practitioners" });
    await details.click();
    await expect(details).toHaveAttribute("aria-expanded", "true");
    await expect(sandbox(page).getByText("Your care team")).toBeVisible();
    await details.click();
    await expect(sandbox(page).getByText("Your care team")).toHaveCount(0);

    await details.click();
    await sandbox(page).getByRole("button", { name: "Book a consultation" }).click();
    await brandCard(page, "Orbit Supply").click();
    await expect(sandbox(page).getByRole("status")).toBeEmpty();
    await expect(sandbox(page).getByText("SPECS MANIFEST", { exact: true })).toHaveCount(0);
  });
});

test.describe("header actions", () => {
  test("reset restores defaults, clears the demo and reports it", async ({ page }) => {
    await openReady(page);
    await brandCard(page, "Orbit Supply").click();
    await option(page, "Simulation Stage", "Tablet").click();
    await sandbox(page).getByRole("button", { name: "Shop drop 04" }).click();
    await page.getByRole("button", { name: "Reset lab" }).click();
    await expect(sandbox(page)).toHaveAttribute("data-brand", "solace");
    await expect(radio(page, "Simulation Stage", "Mobile")).toBeChecked();
    await expect(radio(page, "Geometry / Radius", "r-24")).toBeChecked();
    await expect(sandbox(page).getByRole("status")).toBeEmpty();
    await expect(page.getByRole("banner").getByRole("status")).toHaveText("Lab reset to defaults");
    await page.reload();
    await expect(sandbox(page)).toHaveAttribute("data-brand", "solace");
  });

  test("about dialog traps focus, closes and returns focus", async ({ page }) => {
    await openReady(page);
    const trigger = page.getByRole("button", { name: "About this lab" });
    const dialog = page.getByRole("dialog", { name: "About this lab" });

    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Ikizen");
    await expect(page.getByRole("button", { name: "Close about dialog" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await page.getByRole("button", { name: "Close about dialog" }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await page.mouse.click(4, 4);
    await expect(dialog).toBeHidden();
  });
});

test.describe("persistence", () => {
  test("brand, tuning and device survive navigation and reload", async ({ page }) => {
    await openReady(page);
    await brandCard(page, "Lumen Academy").click();
    await option(page, "Rhythm Density", "Compact").click();
    await option(page, "Simulation Stage", "Tablet").click();

    await primaryNav(page).getByRole("link", { name: "Tokens" }).click();
    await expect(page.getByText("Active brand: Lumen Academy")).toBeVisible();
    await primaryNav(page).getByRole("link", { name: "Playground" }).click();
    await expect(sandbox(page)).toHaveAttribute("data-brand", "lumen");
    await expect(radio(page, "Rhythm Density", "Compact")).toBeChecked();

    await page.reload();
    await expect(sandbox(page)).toHaveAttribute("data-brand", "lumen");
    await expect(radio(page, "Rhythm Density", "Compact")).toBeChecked();
    await expect(radio(page, "Simulation Stage", "Tablet")).toBeChecked();
    await expect(page.getByTestId("brand-indicator")).toHaveText("3 / 3 Lumen");
  });

  test("corrupt storage falls back to defaults", async ({ page }) => {
    await page.addInitScript((key) => localStorage.setItem(key, "{broken"), STORAGE_KEY);
    await openReady(page);
    await expect(sandbox(page)).toHaveAttribute("data-brand", "solace");
  });

  test("blocked storage leaves the lab working", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new Error("blocked");
        },
      });
    });
    await openReady(page);
    await brandCard(page, "Orbit Supply").click();
    await expect(sandbox(page)).toHaveAttribute("data-brand", "orbit");
  });
});

test.describe("token ledger", () => {
  test("reflects color overrides through the effective tokens", async ({ page }) => {
    const saved = {
      brandId: "orbit",
      tuning: { density: "compact", radius: "0px", cta: "block" },
      overrides: { orbit: { primary: "#FF0066" } },
      device: "mobile",
    };
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [STORAGE_KEY, JSON.stringify(saved)],
    );
    await openReady(page);
    await expect(await ledgerValue(page, "--brand-primary")).toHaveText("#FF0066;");
    const cta = sandbox(page).getByRole("button", { name: "Shop drop 04" });
    await expect.poll(() => computed(cta, "background-color")).toBe("rgb(255, 0, 102)");
    await page.getByRole("button", { name: "Auto-match" }).click();
    await expect(await ledgerValue(page, "--brand-primary")).toHaveText("#0047FF;");
  });

  test("copy writes the live ledger to the clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await openReady(page);
    await brandCard(page, "Orbit Supply").click();
    await page.getByRole("button", { name: "Copy tokens" }).click();
    await expect(page.getByText("Copied to clipboard")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain("--brand-primary: #0047FF;");
    expect(copied).toContain("--btn: block;");
  });

  test("the copy button focus ring stays visible on the ink panel", async ({ page }) => {
    await openReady(page);
    const copy = page.getByRole("button", { name: "Copy tokens" });
    await copy.focus();
    await expect(copy).toBeFocused();
    await expect.poll(() => computed(copy, "outline-color")).toBe("rgb(251, 249, 245)");
    await expect.poll(() => computed(copy, "outline-style")).toBe("solid");
  });

  test("copy reports a real failure", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.clipboard.writeText = () => Promise.reject(new Error("denied"));
    });
    await openReady(page);
    await page.getByRole("button", { name: "Copy tokens" }).click();
    await expect(page.getByText(/Copy failed/)).toBeVisible();
  });
});

test.describe("isolation and layout", () => {
  test("the header shows the full product name", async ({ page }) => {
    await openReady(page);
    const name = page.getByRole("banner").getByText("Brand Morph", { exact: true });
    expect(await name.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  });

  test("brand styles never leak into the studio chrome", async ({ page }) => {
    await openReady(page);
    const chrome = page.getByRole("heading", { level: 1 });
    const read = () =>
      page.evaluate(() => {
        const heading = document.querySelector("h1") as HTMLElement;
        return {
          font: getComputedStyle(heading).fontFamily,
          color: getComputedStyle(heading).color,
          background: getComputedStyle(document.body).backgroundColor,
          radius: getComputedStyle(document.querySelector("header button") as Element).borderRadius,
        };
      });
    const before = await read();
    await brandCard(page, "Orbit Supply").click();
    await expect(sandbox(page)).toHaveAttribute("data-brand", "orbit");
    expect(await read()).toEqual(before);
    expect(await computed(chrome, "--sb-color-primary")).toBe("");
    expect(await computed(chrome, "--font-jetbrains-mono")).toBe("");
    expect(await computed(page.locator("html"), "--font-source-serif")).toBe("");
  });

  test("the page never scrolls sideways on any device preset", async ({ page }) => {
    await openReady(page);
    for (const device of ["Mobile", "Tablet", "Desktop"]) {
      await option(page, "Simulation Stage", device).click();
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        )
        .toBe(true);
    }
  });

  test("reduced motion removes the morph transition", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openReady(page);
    expect(Number.parseFloat(await computed(sandbox(page), "transition-duration"))).toBeLessThan(0.001);
  });
});
