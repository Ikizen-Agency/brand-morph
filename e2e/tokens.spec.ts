import type { Locator, Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { contrastSummary } from "../src/brand-lab/application/token-inspector";
import { BRAND_IDS, BRANDS, COLOR_ROLES, type BrandId, type ColorRole } from "../src/brand-lab/domain/brands";
import { EXPORT_FORMATS, exportAll, exportTokens, kebab } from "../src/brand-lab/domain/exporters";
import { fontFamilies, formatTypeSpec, resolveTokens, TYPE_STYLE_IDS } from "../src/brand-lab/domain/tokens";
import { brandDefaultTuning } from "../src/brand-lab/domain/tuning";
import { expect, test } from "./guard";

const inspector = (page: Page) => page.getByTestId("tokens-page");
const toast = (page: Page) => page.getByTestId("tokens-toast");
const output = (page: Page) => page.getByTestId("export-output");
const row = (page: Page, role: ColorRole) => page.getByTestId(`role-${role}`);
const variable = (role: ColorRole) => `--color-${kebab(role)}`;
const hexField = (page: Page, role: ColorRole) =>
  page.getByRole("textbox", { name: `${variable(role)} hex value`, exact: true });
const picker = (page: Page, role: ColorRole) =>
  page.getByLabel(`Pick ${variable(role)}`, { exact: true });
const brandTab = (page: Page, name: string) =>
  page.getByRole("group", { name: "Active brand" }).locator("label").filter({ hasText: name });
const formatTab = (page: Page, label: string) =>
  page.getByRole("group", { name: "Export format" }).locator("label").filter({ hasText: label });
const primaryNav = (page: Page) => page.getByRole("navigation").first();

const shortName = (id: BrandId) => BRANDS[id].name.split(" ")[0];
const tokensFor = (id: BrandId, overrides = {}) => resolveTokens(BRANDS[id], brandDefaultTuning(id), overrides);

async function open(page: Page) {
  await page.goto("/tokens");
  await expect(inspector(page)).toHaveAttribute("data-ready", "true");
}

async function chooseBrand(page: Page, id: BrandId) {
  await brandTab(page, shortName(id)).click();
  await expect(inspector(page)).toHaveAttribute("data-brand", id);
}

function computed(locator: Locator, property: string) {
  return locator.evaluate(
    (element, name) => getComputedStyle(element).getPropertyValue(name),
    property,
  );
}

const readClipboard = (page: Page) => page.evaluate(() => navigator.clipboard.readText());

test.describe("brand binding", () => {
  for (const id of BRAND_IDS) {
    test(`every value reflects ${id}`, async ({ page }) => {
      await open(page);
      await chooseBrand(page, id);
      const tokens = tokensFor(id);

      await expect(page.getByTestId("active-brand")).toHaveText(tokens.brandName);
      for (const role of COLOR_ROLES) {
        await expect(hexField(page, role)).toHaveValue(tokens.colors[role]);
        await expect(picker(page, role)).toHaveValue(tokens.colors[role].toLowerCase());
      }

      const family = fontFamilies(tokens.fonts.heading)[0];
      await expect(page.getByTestId("family-heading")).toContainText(family);
      const display = page.getByTestId("type-display").getByTestId("type-sample");
      expect(await computed(display, "font-family")).toContain(
        id === "solace" ? "Plus Jakarta" : family.split(" ")[0],
      );

      for (const name of ["sm", "md", "lg", "full", "surface", "cta"] as const) {
        const sample = page.getByTestId(`radius-${name}`).getByTestId("radius-sample");
        await expect(sample).toHaveText(tokens.radii[name]);
        expect(await computed(sample, "border-top-left-radius")).toBe(tokens.radii[name]);
      }

      for (const name of ["elevation1", "elevation2", "elevationCta"] as const) {
        const { x, y, blur, spread, alpha } = tokens.shadows[name];
        const shadow = page.getByTestId(`elevation-${name}`).getByTestId("elevation-sample");
        const css = await computed(shadow, "box-shadow");
        if (x === 0 && y === 0 && blur === 0 && spread === 0) {
          expect(css).toBe("none");
          continue;
        }
        expect(css).toContain(`${x}px ${y}px ${blur}px ${spread}px`);
        if (alpha < 1) expect(css).toContain(`${alpha})`);
      }

      const scope = page.getByTestId("geometry-scope");
      expect(await scope.getAttribute("data-brand")).toBe(id);
    });
  }

  test("the brand switch is the shared lab state", async ({ page }) => {
    await open(page);
    await chooseBrand(page, "lumen");
    await primaryNav(page).getByRole("link", { name: "Components" }).click();
    await expect(page.getByTestId("gallery")).toHaveAttribute("data-brand", "lumen");
    await primaryNav(page).getByRole("link", { name: "Playground" }).click();
    await expect(page.getByTestId("sandbox")).toHaveAttribute("data-brand", "lumen");
  });

  test("playground tuning reaches this screen", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("sandbox")).toHaveAttribute("data-animate", "true");
    await page.getByRole("group", { name: "Rhythm Density" }).locator("label").filter({ hasText: "Compact" }).click();
    await primaryNav(page).getByRole("link", { name: "Tokens" }).click();
    await expect(page.getByTestId("density")).toHaveText("compact density");
    await expect(page.getByTestId("spacing-gap")).toContainText("0.5rem");
    await expect(output(page)).toContainText("--space-gap: 0.5rem;");
  });

  test("a brand change and a lab reset drop a stale message", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await open(page);
    const copyAll = page.getByRole("button", { name: "Copy All" });
    await copyAll.click();
    await expect(toast(page)).not.toBeEmpty();
    await chooseBrand(page, "orbit");
    await expect(toast(page)).toBeEmpty({ timeout: 1000 });

    await copyAll.click();
    await expect(toast(page)).not.toBeEmpty();
    await page.getByRole("button", { name: "Reset lab" }).click();
    await expect(toast(page)).toBeEmpty({ timeout: 1000 });
  });
});

test.describe("computed labels", () => {
  test("counts match what is rendered", async ({ page }) => {
    await open(page);
    await expect(page.getByTestId("color-count")).toHaveText(`${COLOR_ROLES.length} Defined Tokens`);
    await expect(page.locator('[data-testid^="role-"]')).toHaveCount(COLOR_ROLES.length);
    await expect(page.getByTestId("format-summary")).toContainText(`${EXPORT_FORMATS.length} formats`);
    await expect(page.getByTestId("engine-formats")).toHaveText(`${EXPORT_FORMATS.length}`);
    const lines = (await output(page).innerText()).trim().split("\n").length;
    await expect(page.getByTestId("export-size")).toHaveText(`${lines} lines`);
  });

  test("every type label states the size the specimen really renders", async ({ page }) => {
    await open(page);
    const { typeScale } = tokensFor("solace");
    for (const id of TYPE_STYLE_IDS) {
      const style = typeScale[id];
      const specimen = page.getByTestId(`type-${id}`);
      await expect(specimen.getByTestId("type-spec")).toHaveText(`text-${id} • ${formatTypeSpec(style)}`);
      const sample = specimen.getByTestId("type-sample");
      expect(await computed(sample, "font-size")).toBe(`${style.fontSize}px`);
      expect(await computed(sample, "line-height")).toBe(`${style.lineHeight}px`);
      expect(await computed(sample, "font-weight")).toBe(`${style.fontWeight}`);
    }
  });

  test("the page makes no false claims", async ({ page }) => {
    await open(page);
    await expect(inspector(page)).not.toContainText(/W3C|Compliant|100%|Zero runtime/i);
    await expect(page.getByTestId("format-summary")).toContainText("DTCG 2025.10 JSON");
  });

  test("the engine card follows state", async ({ page }) => {
    await open(page);
    await expect(page.getByTestId("engine-overrides")).toHaveText("0");
    const contrast = page.getByTestId("engine-contrast");
    const { colors } = tokensFor("solace");
    const before = contrastSummary(colors);
    await expect(contrast).toHaveText(`${before.passing} of ${before.total}`);
    await hexField(page, "onPrimary").fill(colors.primary);
    await expect(page.getByTestId("engine-overrides")).toHaveText("1");
    const after = contrastSummary({ ...colors, onPrimary: colors.primary });
    expect(after.passing).toBeLessThan(before.passing);
    await expect(contrast).toHaveText(`${after.passing} of ${after.total}`);
    await chooseBrand(page, "orbit");
    await expect(page.getByTestId("engine-overrides")).toHaveText("0");
  });
});

test.describe("color editing", () => {
  test("the native picker edits a role live", async ({ page }) => {
    await open(page);
    await picker(page, "primary").fill("#aa0044");
    await expect(hexField(page, "primary")).toHaveValue("#AA0044");
    await expect(row(page, "primary")).toHaveAttribute("data-overridden", "true");
    await expect(row(page, "primary")).toContainText("Edited");
    await expect(page.getByTestId("edited-count")).toHaveText("1 color edited");
    await expect(output(page)).toContainText("--color-primary: #AA0044;");
  });

  test("the hex field validates and accepts a value without the hash", async ({ page }) => {
    await open(page);
    const field = hexField(page, "primary");

    await field.fill("#12");
    await field.blur();
    await expect(field).toHaveAttribute("aria-invalid", "true");
    await expect(row(page, "primary")).toContainText("Use six hex digits");
    await expect(row(page, "primary")).toHaveAttribute("data-overridden", "false");
    await expect(output(page)).toContainText("--color-primary: #5E8271;");

    await field.fill("112233");
    await expect(field).toHaveValue("#112233");
    await expect(field).toHaveAttribute("aria-invalid", "false");
    await expect(output(page)).toContainText("--color-primary: #112233;");
  });

  test("Escape abandons an invalid draft", async ({ page }) => {
    await open(page);
    const field = hexField(page, "surface");
    await field.fill("nope");
    await field.press("Escape");
    await expect(field).toHaveValue(BRANDS.solace.colors.surface);
    await expect(field).toHaveAttribute("aria-invalid", "false");
  });

  test("low contrast is reported in text and never blocked", async ({ page }) => {
    await open(page);
    const verdict = row(page, "primary").getByTestId("contrast");
    await expect(verdict).toContainText("Passes AA");
    await expect(verdict).toContainText("4.51:1");

    await picker(page, "primary").fill("#0a0f0d");
    await expect(verdict).toContainText("Fails AA");
    await expect(verdict).toContainText("1.00:1");
    await expect(hexField(page, "primary")).toHaveValue("#0A0F0D");
    await expect(row(page, "onPrimary").getByTestId("contrast")).toContainText("Fails AA");
  });

  test("a decorative border states that no AA target applies", async ({ page }) => {
    await open(page);
    await expect(row(page, "border").getByTestId("contrast")).toContainText("No AA target");
  });

  test("an edit reaches the sandbox, the gallery and every export", async ({ page }) => {
    const hex = "#AA0044";
    const edited = tokensFor("solace", { primary: hex });

    await open(page);
    await hexField(page, "primary").fill(hex);

    for (const format of EXPORT_FORMATS) {
      await formatTab(page, format.label).click();
      await expect(page.getByTestId("export-file")).toHaveText(format.fileName("solace"));
      expect(await output(page).textContent()).toBe(exportTokens(edited, format.id));
    }

    await primaryNav(page).getByRole("link", { name: "Components" }).click();
    const gallery = page.getByTestId("gallery");
    await expect(gallery).toHaveAttribute("data-brand", "solace");
    expect(await computed(gallery, "--sb-color-primary")).toBe(hex);

    await primaryNav(page).getByRole("link", { name: "Playground" }).click();
    const sandbox = page.getByTestId("sandbox");
    await expect(sandbox).toBeVisible();
    expect(await computed(sandbox, "--sb-color-primary")).toBe(hex);
  });

  test("edits belong to their brand and survive a reload", async ({ page }) => {
    await open(page);
    await hexField(page, "primary").fill("#AA0044");
    await chooseBrand(page, "orbit");
    await expect(hexField(page, "primary")).toHaveValue(BRANDS.orbit.colors.primary);
    await hexField(page, "surface").fill("#222244");

    await page.reload();
    await expect(inspector(page)).toHaveAttribute("data-ready", "true");
    await expect(inspector(page)).toHaveAttribute("data-brand", "orbit");
    await expect(hexField(page, "surface")).toHaveValue("#222244");
    await expect(output(page)).toContainText("--color-surface: #222244;");

    await chooseBrand(page, "solace");
    await expect(hexField(page, "primary")).toHaveValue("#AA0044");
  });

  test("a role reverts on its own and focus stays in the row", async ({ page }) => {
    await open(page);
    await hexField(page, "primary").fill("#AA0044");
    await hexField(page, "surface").fill("#EEEEEE");

    await row(page, "primary").getByRole("button", { name: "Revert --color-primary" }).click();
    await expect(hexField(page, "primary")).toHaveValue(BRANDS.solace.colors.primary);
    await expect(hexField(page, "primary")).toBeFocused();
    await expect(hexField(page, "surface")).toHaveValue("#EEEEEE");
    await expect(page.getByTestId("edited-count")).toHaveText("1 color edited");
    await expect(toast(page)).toContainText(`Reverted --color-primary to ${BRANDS.solace.colors.primary}`);
  });

  test("all roles revert at once and survive a reload as reverted", async ({ page }) => {
    await open(page);
    await hexField(page, "primary").fill("#AA0044");
    await hexField(page, "surface").fill("#EEEEEE");
    await expect(page.getByTestId("edited-count")).toHaveText("2 colors edited");

    await page.getByRole("button", { name: "Revert all" }).click();
    await expect(page.getByRole("button", { name: "Revert all" })).toHaveCount(0);
    await expect(toast(page)).toHaveText("Reverted 2 colors.");
    await expect(page.getByRole("heading", { name: "Color Palette Tokens" })).toBeFocused();

    await page.reload();
    await expect(inspector(page)).toHaveAttribute("data-ready", "true");
    await expect(hexField(page, "primary")).toHaveValue(BRANDS.solace.colors.primary);
    await expect(row(page, "primary")).toHaveAttribute("data-overridden", "false");
  });

  test("typing the brand value again is not an edit", async ({ page }) => {
    await open(page);
    await hexField(page, "primary").fill("#AA0044");
    await hexField(page, "primary").fill(BRANDS.solace.colors.primary);
    await expect(row(page, "primary")).toHaveAttribute("data-overridden", "false");
    await expect(page.getByTestId("edited-count")).toHaveCount(0);
  });
});

test.describe("copy", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  test("every target is a named button that copies the real value", async ({ page }) => {
    await open(page);
    const tokens = tokensFor("solace");
    const targets: ReadonlyArray<readonly [string, string]> = [
      ["--color-primary", `--color-primary: ${tokens.colors.primary};`],
      ["--color-success", `--color-success: ${tokens.colors.success};`],
      ["--radius-md", `--radius-md: ${tokens.radii.md};`],
      ["--radius-cta", `--radius-cta: ${tokens.radii.cta};`],
      ["--elevation-2", "--elevation-2: 0px 12px 24px -6px rgba(29, 51, 40, 0.08);"],
      ["--space-gap", `--space-gap: ${tokens.spacing.gap};`],
      [
        "text-body",
        "font-family: 'Inter', sans-serif; font-size: 14px; line-height: 22px; letter-spacing: -0.006em; font-weight: 400;",
      ],
    ];
    for (const [name, expected] of targets) {
      await page.getByRole("button", { name: new RegExp(`^Copy .*${name}( |$)`) }).click();
      await expect.poll(() => readClipboard(page)).toBe(expected);
      await expect(toast(page)).toHaveText(`Copied ${name}.`);
    }
  });

  test("works from the keyboard", async ({ page }) => {
    await open(page);
    const target = page.getByRole("button", { name: "Copy 8px --radius-sm", exact: true });
    await target.focus();
    await page.keyboard.press("Enter");
    await expect(toast(page)).toHaveText("Copied --radius-sm.");
    expect(await readClipboard(page)).toBe("--radius-sm: 8px;");

    await page.evaluate(() => navigator.clipboard.writeText(""));
    await target.focus();
    await page.keyboard.press("Space");
    await expect.poll(() => readClipboard(page)).toBe("--radius-sm: 8px;");
  });

  test("Copy Tokens takes the active format and Copy All takes every format", async ({ page }) => {
    await open(page);
    await hexField(page, "primary").fill("#AA0044");
    const edited = tokensFor("solace", { primary: "#AA0044" });

    await formatTab(page, "DTCG JSON").click();
    await page.getByRole("button", { name: "Copy Tokens to Clipboard" }).click();
    await expect(toast(page)).toHaveText("Copied DTCG JSON tokens.");
    expect(await readClipboard(page)).toBe(exportTokens(edited, "json"));

    await page.getByRole("button", { name: "Copy All" }).click();
    await expect(toast(page)).toHaveText(`Copied all ${EXPORT_FORMATS.length} formats.`);
    expect(await readClipboard(page)).toBe(exportAll(edited));
  });
});

test.describe("copy failure", () => {
  test("reports a blocked clipboard", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.clipboard.writeText = () => Promise.reject(new DOMException("no", "NotAllowedError"));
    });
    await open(page);
    await page.getByRole("button", { name: "Copy --color-primary", exact: true }).click();
    await expect(toast(page)).toHaveText("Copy failed. Clipboard access is blocked.");
  });

  test("gives a fallback when the clipboard does not exist", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { value: undefined });
    });
    await open(page);
    await page.getByRole("button", { name: "Copy Tokens to Clipboard" }).click();
    await expect(toast(page)).toHaveText(
      "Clipboard is unavailable here. Select the text and copy it by hand.",
    );
  });

  test("waits for the write before reporting", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.clipboard.writeText = () =>
        new Promise((resolve) => {
          (window as unknown as { finishCopy: () => void }).finishCopy = () => resolve();
        });
    });
    await open(page);
    await page.getByRole("button", { name: "Copy --color-primary", exact: true }).click();
    await page.waitForFunction(() => "finishCopy" in window);
    await expect(toast(page)).toBeEmpty();
    await page.evaluate(() => (window as unknown as { finishCopy: () => void }).finishCopy());
    await expect(toast(page)).toHaveText("Copied --color-primary.");
  });
});

test.describe("export panel", () => {
  test("offers every format as native radios with arrow keys", async ({ page }) => {
    await open(page);
    const group = page.getByRole("group", { name: "Export format" });
    await expect(group.getByRole("radio")).toHaveCount(EXPORT_FORMATS.length);
    for (const { label } of EXPORT_FORMATS) {
      await expect(group.getByRole("radio", { name: label })).toHaveCount(1);
    }
    await group.getByRole("radio", { name: "CSS" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(group.getByRole("radio", { name: "Tailwind v3" })).toBeChecked();
    await expect(page.getByTestId("export-file")).toHaveText("tailwind.config.solace.js");
  });

  test("the scrollable code can be reached from the keyboard", async ({ page }) => {
    await open(page);
    await output(page).focus();
    await expect(output(page)).toBeFocused();
  });

  for (const format of EXPORT_FORMATS) {
    test(`downloads ${format.label} with its name, type and contents`, async ({ page }) => {
      await page.addInitScript(() => {
        const original = URL.createObjectURL.bind(URL);
        URL.createObjectURL = (blob) => {
          (window as unknown as { blobType: string }).blobType = (blob as Blob).type;
          return original(blob);
        };
      });
      await open(page);
      await chooseBrand(page, "orbit");
      await hexField(page, "error").fill("#ABCDEF");
      const edited = tokensFor("orbit", { error: "#ABCDEF" });
      await formatTab(page, format.label).click();

      const fileName = format.fileName("orbit");
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", { name: `Download ${fileName}` }).click(),
      ]);

      expect(download.suggestedFilename()).toBe(fileName);
      const path = await download.path();
      const contents = await readFile(path, "utf8");
      expect(contents).toBe(exportTokens(edited, format.id));
      expect(contents).toContain("#ABCDEF");
      expect(await page.evaluate(() => (window as unknown as { blobType: string }).blobType)).toBe(
        format.mimeType,
      );
      await expect(toast(page)).toHaveText(`Download requested: ${fileName}.`);
    });
  }

  test("the DTCG download keeps the structured format", async ({ page }) => {
    await open(page);
    await formatTab(page, "DTCG JSON").click();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download solace.tokens.json" }).click(),
    ]);
    const tree = JSON.parse(await readFile(await download.path(), "utf8"));
    expect(tree.color.primary.$value.colorSpace).toBe("srgb");
    expect(tree.radius.sm.$value).toEqual({ value: 8, unit: "px" });
    expect(tree.font.heading.$value).toEqual(["Plus Jakarta Sans", "sans-serif"]);
  });
});

test.describe("layout", () => {
  for (const id of BRAND_IDS) {
    test(`${id} has no horizontal page scroll in any format`, async ({ page }) => {
      await open(page);
      await chooseBrand(page, id);
      for (const { label } of EXPORT_FORMATS) {
        await formatTab(page, label).click();
        const width = await page.evaluate(() => ({
          page: document.documentElement.scrollWidth,
          view: document.documentElement.clientWidth,
        }));
        expect(width.page).toBeLessThanOrEqual(width.view);
      }
    });
  }

  test("brand styles stay out of the studio chrome", async ({ page }) => {
    await open(page);
    await chooseBrand(page, "orbit");
    const heading = page.getByRole("heading", { level: 1, name: "Token Architecture" });
    expect(await computed(heading, "font-family")).not.toMatch(/JetBrains/i);
    expect(await computed(page.locator("body"), "background-color")).toBe("rgb(251, 249, 245)");
    await expect(page.getByTestId("type-scope")).toHaveCSS("background-color", "rgb(17, 17, 17)");
  });
});
