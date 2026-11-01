import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./guard";

const STORAGE_KEY = "brand-morph/lab/v1";

const gallery = (page: Page) => page.getByTestId("gallery");
const toast = (page: Page) => page.getByTestId("gallery-toast");
const section = (page: Page, id: string) => page.getByTestId(`section-${id}`);
const button = (page: Page, name: string | RegExp) => gallery(page).getByRole("button", { name });
const brandTab = (page: Page, name: string) =>
  page.getByRole("group", { name: "Active brand" }).locator("label").filter({ hasText: name });
const chip = (page: Page, name: string) =>
  page.getByRole("group", { name: "Filter specimens by category" }).getByRole("button", { name });
const moreButton = (page: Page) => gallery(page).getByRole("button", { name: /^More actions/ });

async function open(page: Page) {
  await page.goto("/components");
  await expect(gallery(page)).toHaveAttribute("data-ready", "true");
}

async function chooseBrand(page: Page, name: string, id: string) {
  await brandTab(page, name).click();
  await expect(gallery(page)).toHaveAttribute("data-brand", id);
}

function computed(locator: Locator, property: string) {
  return locator.evaluate(
    (element, name) => getComputedStyle(element).getPropertyValue(name),
    property,
  );
}

test.describe("brand tabs", () => {
  test("restyle the specimens through scoped tokens and shared lab state", async ({ page }) => {
    await open(page);
    await expect(gallery(page)).toHaveAttribute("data-brand", "solace");
    await expect(page.getByTestId("brand-tone")).toHaveText("BIO-ORGANIC");
    await expect(gallery(page).getByRole("heading", { name: "Dr. Maya Lin, DO" })).toBeVisible();

    await chooseBrand(page, "Orbit", "orbit");
    await expect(page.getByTestId("brand-tone")).toHaveText("BRUTALIST TECH");
    await expect(gallery(page).getByText("Orbit Supply", { exact: true })).toBeVisible();
    await expect.poll(() => computed(gallery(page), "background-color")).toBe("rgb(17, 17, 17)");
    expect(await computed(gallery(page), "font-family")).toMatch(/JetBrains/i);
    await expect
      .poll(() => computed(button(page, "Queue dispatch"), "background-color"))
      .toBe("rgb(0, 71, 255)");

    await chooseBrand(page, "Lumen", "lumen");
    await expect(page.getByTestId("brand-tone")).toHaveText("SCHOLARLY FLUID");
    expect(await computed(gallery(page), "font-family")).toMatch(/Source.?Serif/i);

    await page.locator('nav[aria-label="Primary"]:visible').getByRole("link", { name: "Playground" }).click();
    await expect(page.getByTestId("sandbox")).toHaveAttribute("data-brand", "lumen");
  });

  test("support arrow keys", async ({ page }) => {
    await open(page);
    await page.getByRole("group", { name: "Active brand" }).getByRole("radio", { name: "Solace" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(gallery(page)).toHaveAttribute("data-brand", "orbit");
  });

  test("keep clinical copy away from other brands", async ({ page }) => {
    await open(page);
    await expect(gallery(page)).toContainText("HIPAA ENCRYPTED");
    for (const [name, id] of [
      ["Orbit", "orbit"],
      ["Lumen", "lumen"],
    ]) {
      await chooseBrand(page, name, id);
      await expect(gallery(page)).not.toContainText(/hipaa|clinical|patient|telehealth|doctor|consultation/i);
    }
  });

  test("specimens follow playground tuning and color overrides", async ({ page }) => {
    const saved = {
      brandId: "solace",
      tuning: { density: "compact", radius: "0px", cta: "block" },
      overrides: { solace: { primary: "#FF0066" } },
      device: "mobile",
    };
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [STORAGE_KEY, JSON.stringify(saved)],
    );
    await open(page);
    const book = button(page, "Book consultation");
    await expect.poll(() => computed(book, "background-color")).toBe("rgb(255, 0, 102)");
    expect(await computed(book, "border-top-left-radius")).toBe("0px");
    expect(await computed(book, "box-shadow")).toContain("3px 3px 0px");
    expect(await computed(page.getByRole("article"), "border-top-left-radius")).toBe("0px");
    expect(await computed(gallery(page), "row-gap")).toBe("8px");
  });

  test("brand styles stay out of the studio chrome", async ({ page }) => {
    await open(page);
    await chooseBrand(page, "Orbit", "orbit");
    const heading = page.getByRole("heading", { level: 1, name: "Adaptive UI Kit" });
    expect(await computed(heading, "font-family")).not.toMatch(/JetBrains/i);
    expect(await computed(heading, "--sb-color-primary")).toBe("");
    expect(await computed(page.getByTestId("token-diff"), "--sb-color-primary")).toBe("");
  });
});

test.describe("filter chips", () => {
  test("filter the sections with an All option and a pressed state", async ({ page }) => {
    await open(page);
    const ids = ["actions", "form", "badges", "card", "feedback", "modal"];
    const expectVisible = async (visible: string[]) => {
      for (const id of ids) {
        if (visible.includes(id)) await expect(section(page, id)).toBeVisible();
        else await expect(section(page, id)).toBeHidden();
      }
      await expect(page.getByText(`Showing ${visible.length} of 6 sections`)).toBeVisible();
    };

    await expect(chip(page, "All")).toHaveAttribute("aria-pressed", "true");
    await expectVisible(ids);

    await chip(page, "Cards & Badges").click();
    await expect(chip(page, "Cards & Badges")).toHaveAttribute("aria-pressed", "true");
    await expect(chip(page, "All")).toHaveAttribute("aria-pressed", "false");
    await expectVisible(["badges", "card"]);

    await chip(page, "Buttons").click();
    await expectVisible(["actions"]);
    await chip(page, "Inputs & Form").click();
    await expectVisible(["form"]);
    await chip(page, "Feedback").click();
    await expectVisible(["feedback"]);
    await chip(page, "Modals").click();
    await expectVisible(["modal"]);
    await expect(page.getByTestId("token-diff")).toBeVisible();

    await chip(page, "All").click();
    await expectVisible(ids);
  });

  test("filtering keeps specimen state and a brand change keeps the filter", async ({ page }) => {
    await open(page);
    await button(page, "Like").click();
    await chip(page, "Modals").click();
    await chip(page, "All").click();
    await expect(button(page, "Like")).toHaveAttribute("aria-pressed", "true");

    await chip(page, "Modals").click();
    await chooseBrand(page, "Orbit", "orbit");
    await expect(chip(page, "Modals")).toHaveAttribute("aria-pressed", "true");
    await expect(section(page, "actions")).toBeHidden();
  });
});

test.describe("buttons", () => {
  test("like and bookmark toggle pressed state", async ({ page }) => {
    await open(page);
    for (const name of ["Like", "Bookmark"]) {
      const control = button(page, name);
      await expect(control).toHaveAttribute("aria-pressed", "false");
      await control.click();
      await expect(control).toHaveAttribute("aria-pressed", "true");
      await expect(control.locator("svg")).toHaveAttribute("fill", "currentColor");
      await control.click();
      await expect(control).toHaveAttribute("aria-pressed", "false");
    }
  });

  test("share uses the native sheet when it exists", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", {
        value: (data: ShareData) => {
          (window as unknown as { shared: ShareData }).shared = data;
          return Promise.resolve();
        },
      });
    });
    await open(page);
    await button(page, "Share").click();
    await expect(toast(page)).toHaveText("Link shared.");
    const shared = await page.evaluate(() => (window as unknown as { shared: ShareData }).shared);
    expect(shared.url).toMatch(/\/components$/);
  });

  test("share reports a dismissed sheet", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", {
        value: () => Promise.reject(new DOMException("closed", "AbortError")),
      });
    });
    await open(page);
    await button(page, "Share").click();
    await expect(toast(page)).toHaveText("Share cancelled.");
  });

  test("share copies the page link without a native sheet", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", { value: undefined });
    });
    await open(page);
    await button(page, "Share").click();
    await expect(toast(page)).toHaveText("Page link copied to clipboard.");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/components$/);
  });

  test("share reports a real failure", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", { value: undefined });
      navigator.clipboard.writeText = () => Promise.reject(new Error("denied"));
    });
    await open(page);
    await button(page, "Share").click();
    await expect(toast(page)).toHaveText("Could not share. Clipboard access is blocked.");
  });

  test("book, cancel and start over move through real states", async ({ page }) => {
    await open(page);
    const status = page.getByTestId("booking-status");
    await expect(status).toHaveText("No appointment booked yet.");

    await button(page, "Cancel appointment").click();
    await expect(toast(page)).toHaveText("No appointment to cancel yet. Book one first.");
    await expect(status).toHaveText("No appointment booked yet.");

    await button(page, "Book consultation").click();
    await expect(status).toContainText("nothing was sent");
    await expect(button(page, "Consultation booked")).toBeVisible();
    await expect(page.getByTestId("slot-state")).toHaveText("Reserved");

    await button(page, "Consultation booked").click();
    await expect(toast(page)).toHaveText("This appointment is already held for you.");

    await button(page, "Cancel appointment").click();
    await expect(status).toContainText("Appointment cancelled");
    await expect(button(page, "Book consultation")).toBeVisible();
    await expect(page.getByTestId("slot-state")).toHaveText("Video Call");

    await button(page, "Start over").click();
    await expect(status).toHaveText("No appointment booked yet.");
    await expect(button(page, "Start over")).toHaveCount(0);
    await expect(button(page, "Book consultation")).toBeFocused();
  });

  test("view providers discloses the brand team", async ({ page }) => {
    await open(page);
    const providers = button(page, "View providers");
    await expect(gallery(page).getByText("Dr. Mei Tanaka, Integrative Medicine")).toBeHidden();
    await providers.click();
    await expect(providers).toHaveAttribute("aria-expanded", "true");
    await expect(gallery(page).getByText("Dr. Mei Tanaka, Integrative Medicine")).toBeVisible();
    await providers.click();
    await expect(gallery(page).getByText("Dr. Mei Tanaka, Integrative Medicine")).toBeHidden();
  });

  test("the state matrix reacts and the disabled specimen is really disabled", async ({ page }) => {
    await open(page);
    await button(page, "Confirm, default state").click();
    await expect(toast(page)).toHaveText("Default button pressed.");
    await button(page, "Confirm, hover or focused state").click();
    await expect(toast(page)).toHaveText("Hover state button pressed.");
    await expect(button(page, "Confirm, disabled state")).toBeDisabled();
  });
});

test.describe("form controls", () => {
  test("search filters a local directory and can be cleared", async ({ page }) => {
    await open(page);
    const search = gallery(page).getByRole("searchbox");
    const results = gallery(page).getByRole("list", { name: "Search results" });
    await expect(results).toHaveCount(0);

    await search.fill("tanaka");
    await expect(page.getByTestId("search-status")).toHaveText("1 provider found");
    await expect(results).toContainText("Integrative Medicine");

    await search.fill("clinic");
    await expect(page.getByTestId("search-status")).toHaveText("3 providers found");

    await search.fill("zzz");
    await expect(page.getByTestId("search-status")).toHaveText("0 providers found");
    await expect(results).toHaveCount(0);

    await button(page, "Clear search").click();
    await expect(search).toHaveValue("");
    await expect(search).toBeFocused();
    await expect(page.getByTestId("search-status")).toBeEmpty();
  });

  test("name validates visibly", async ({ page }) => {
    await open(page);
    const name = gallery(page).getByRole("textbox", { name: "Full Legal Name" });
    const help = page.getByTestId("name-help");
    await expect(name).toHaveValue("Elena Rostova, MSc");
    await expect(name).toHaveAttribute("aria-invalid", "false");
    await expect(name).toHaveAccessibleDescription("Matches government identification records");

    await name.fill("");
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(help).toHaveText("Full Legal Name is required.");
    await expect(name).toHaveAccessibleDescription("Full Legal Name is required.");

    await name.fill("E");
    await expect(help).toHaveText("Use at least 2 characters.");

    await name.fill("Elena");
    await expect(name).toHaveAttribute("aria-invalid", "false");
    await expect(help).toHaveText("Matches government identification records");
  });

  test("select is controlled and follows the brand", async ({ page }) => {
    await open(page);
    const select = gallery(page).getByRole("combobox", { name: "Preferred Care Specialty" });
    await select.selectOption("Preventative Cardiology");
    await expect(select).toHaveValue("Preventative Cardiology");
    await chooseBrand(page, "Lumen", "lumen");
    await expect(
      gallery(page).getByRole("combobox", { name: "Preferred Fellowship Track" }),
    ).toHaveValue("Cognitive Architecture");
  });

  test("toggle exposes switch semantics by mouse and keyboard", async ({ page }) => {
    await open(page);
    const toggle = gallery(page).getByRole("switch", { name: "SMS Care Reminders" });
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await expect(toggle).toHaveAccessibleDescription("Real-time alerts for virtual intake queues");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  test("checkbox validates and gates authorization", async ({ page }) => {
    await open(page);
    const consent = gallery(page).getByRole("checkbox");
    await expect(consent).toBeChecked();
    await expect(page.getByTestId("consent-error")).toHaveCount(0);

    await consent.uncheck();
    await expect(page.getByTestId("consent-error")).toBeVisible();
    await expect(consent).toHaveAccessibleDescription(/Agree to the privacy practices/);
    await button(page, "Authorize & Begin").click();
    await expect(page.getByTestId("authorization-state")).toHaveText("Awaiting authorization.");
    await expect(toast(page)).toContainText("Agree to the privacy practices");

    await consent.check();
    await button(page, "Authorize & Begin").click();
    await expect(page.getByTestId("authorization-state")).toHaveText("Authorized for this demo.");
    await consent.uncheck();
    await expect(page.getByTestId("authorization-state")).toHaveText("Awaiting authorization.");
  });
});

test.describe("card", () => {
  test("instant reserve shares the booking with the actions section", async ({ page }) => {
    await open(page);
    await button(page, "Instant Reserve").click();
    await expect(page.getByTestId("booking-status")).toContainText("Dr. Maya Lin");
    await expect(button(page, "Reserved")).toBeVisible();
    await button(page, "Cancel appointment").click();
    await expect(button(page, "Instant Reserve")).toBeVisible();
  });

  test("profile toggles a local panel", async ({ page }) => {
    await open(page);
    const profile = button(page, "Profile");
    const bio = gallery(page).getByText("osteopathic family medicine");
    await expect(bio).toBeHidden();
    await profile.click();
    await expect(profile).toHaveAttribute("aria-expanded", "true");
    await expect(bio).toBeVisible();
    await profile.click();
    await expect(bio).toBeHidden();
  });

  test("the portrait really loads and other brands use monograms", async ({ page }) => {
    await open(page);
    const portrait = page.getByRole("article").locator("img");
    await expect
      .poll(() => portrait.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0);
    await chooseBrand(page, "Orbit", "orbit");
    await expect(portrait).toHaveCount(0);
    await expect(page.getByRole("article")).toContainText("KV");
  });

  test("more menu works from the keyboard", async ({ page }) => {
    await open(page);
    const more = moreButton(page);
    const item = (name: string) => page.getByRole("menuitem", { name });
    await expect(more).toHaveAttribute("aria-haspopup", "menu");

    await more.focus();
    await page.keyboard.press("Enter");
    await expect(more).toHaveAttribute("aria-expanded", "true");
    await expect(item("View profile")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(item("Copy name")).toBeFocused();
    await page.keyboard.press("End");
    await expect(item("Hide rating")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(item("View profile")).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(item("Hide rating")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(item("View profile")).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(more).toBeFocused();

    await page.keyboard.press("ArrowUp");
    await expect(item("Hide rating")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("card-rating")).toHaveCount(0);
    await expect(more).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await expect(item("View profile")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("menu")).toHaveCount(0);
  });

  test("more menu actions do real work and outside clicks close it", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await open(page);
    const more = moreButton(page);

    await more.click();
    await page.getByRole("menuitem", { name: "View profile" }).click();
    await expect(gallery(page).getByText("osteopathic family medicine")).toBeVisible();
    await expect(button(page, "Profile")).toHaveAttribute("aria-expanded", "true");

    await more.click();
    await expect(page.getByRole("menuitem", { name: "Hide profile" })).toBeVisible();
    await page.getByRole("menuitem", { name: "Copy name" }).click();
    await expect(toast(page)).toHaveText("Copied Dr. Maya Lin, DO.");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("Dr. Maya Lin, DO");

    await more.click();
    await page.getByRole("menuitem", { name: "Hide rating" }).click();
    await more.click();
    await page.getByRole("menuitem", { name: "Show rating" }).click();
    await expect(page.getByTestId("card-rating")).toBeVisible();

    await more.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await page.getByRole("heading", { level: 1 }).click();
    await expect(page.getByRole("menu")).toHaveCount(0);
  });

  test("copy name reports a real failure", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.clipboard.writeText = () => Promise.reject(new Error("denied"));
    });
    await open(page);
    await moreButton(page).click();
    await page.getByRole("menuitem", { name: "Copy name" }).click();
    await expect(toast(page)).toHaveText("Copy failed. Clipboard access is blocked.");
  });
});

test.describe("feedback", () => {
  test("alert dismisses and replays with focus following", async ({ page }) => {
    await open(page);
    const region = page.getByTestId("alert-region");
    await expect(region).toContainText("Consultation Confirmed");

    await button(page, "Dismiss alert").click();
    await expect(region).toBeEmpty();
    await expect(button(page, "Replay alert")).toBeFocused();

    await button(page, "Replay alert").click();
    await expect(region).toContainText("Consultation Confirmed");
    await expect(button(page, "Dismiss alert")).toBeFocused();
    await expect(button(page, "Replay alert")).toHaveCount(0);
  });

  test("upload uses the native picker and stays local", async ({ page }) => {
    await open(page);
    const writes: string[] = [];
    page.on("request", (request) => {
      if (request.method() !== "GET") writes.push(request.url());
    });

    const progress = gallery(page).getByRole("progressbar");
    await expect(progress).toHaveAttribute("aria-valuenow", "75");
    await expect(page.getByTestId("progress-value")).toHaveText("75% Complete");

    const chooser = page.waitForEvent("filechooser");
    await button(page, "Upload records").click();
    await (
      await chooser
    ).setFiles({ name: "metabolic-panel.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(2048) });

    const summary = page.getByTestId("upload-summary");
    await expect(summary).toContainText("metabolic-panel.pdf");
    await expect(summary).toContainText("2.0 KB");
    await expect(progress).toHaveAttribute("aria-valuenow", "100");
    await expect(toast(page)).toContainText("Nothing was uploaded");

    await button(page, "Remove file").click();
    await expect(summary).toHaveCount(0);
    await expect(gallery(page).getByText("No previous lab results found")).toBeVisible();
    await expect(button(page, "Upload records")).toBeFocused();
    await expect(progress).toHaveAttribute("aria-valuenow", "75");

    const again = page.waitForEvent("filechooser");
    await button(page, "Upload records").click();
    await (
      await again
    ).setFiles({ name: "metabolic-panel.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(2048) });
    await expect(summary).toContainText("metabolic-panel.pdf");
    expect(writes).toEqual([]);
  });

  test("progress answers to the form", async ({ page }) => {
    await open(page);
    await gallery(page).getByRole("checkbox").uncheck();
    await expect(page.getByTestId("progress-value")).toHaveText("50% Complete");
    await gallery(page).getByRole("textbox", { name: "Full Legal Name" }).fill("");
    await expect(page.getByTestId("progress-value")).toHaveText("25% Complete");
  });

  test("the skeleton stays out of the accessibility tree", async ({ page }) => {
    await open(page);
    await expect(page.getByTestId("skeleton")).toHaveAttribute("aria-hidden", "true");
    await expect(page.getByTestId("skeleton")).toBeVisible();
  });
});

test.describe("toast scope", () => {
  /** The toast expires by itself after 4s, so a default wait could not tell a fix from a timeout. */
  const FASTER_THAN_TOAST_EXPIRY = 1000;

  test("a brand change clears a stale message", async ({ page }) => {
    await open(page);
    await button(page, "Default").click();
    await expect(toast(page)).toHaveText("Default button pressed.");
    await chooseBrand(page, "Orbit", "orbit");
    await expect(toast(page)).toBeEmpty({ timeout: FASTER_THAN_TOAST_EXPIRY });
  });

  test("lab reset clears a stale message", async ({ page }) => {
    await open(page);
    await button(page, "Default").click();
    await expect(toast(page)).toHaveText("Default button pressed.");
    await page.getByRole("button", { name: "Reset lab" }).click();
    await expect(toast(page)).toBeEmpty({ timeout: FASTER_THAN_TOAST_EXPIRY });
  });

  test("work that finishes after a brand change stays silent", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", {
        value: () =>
          new Promise<void>((resolve) => {
            (window as unknown as { finishShare: () => void }).finishShare = resolve;
          }),
      });
    });
    await open(page);
    await button(page, "Share").click();
    await chooseBrand(page, "Orbit", "orbit");
    await page.evaluate(async () => {
      (window as unknown as { finishShare: () => void }).finishShare();
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    await expect(toast(page)).toBeEmpty({ timeout: FASTER_THAN_TOAST_EXPIRY });
  });
});

test.describe("modal specimen", () => {
  const dialog = (page: Page) => page.getByRole("dialog", { name: "Confirm Clinical Intake terms" });

  // The second size is a landscape phone at 200% zoom, where the content really overflows.
  for (const { clipped, ...size } of [
    { width: 667, height: 375, clipped: false },
    { width: 844, height: 200, clipped: true },
  ]) {
    test(`keeps every control reachable at ${size.width}x${size.height}`, async ({ page }) => {
      await page.setViewportSize(size);
      await open(page);
      await button(page, "Review Terms").click();
      await expect(dialog(page)).toBeVisible();

      const box = await dialog(page).boundingBox();
      expect(box?.y).toBeGreaterThanOrEqual(0);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(size.height);

      const body = dialog(page).getByTestId("dialog-body");
      const scroller = await body.evaluate((element) => ({
        overflow: getComputedStyle(element).overflowY,
        clipped: element.scrollHeight > element.clientHeight,
      }));
      expect(scroller).toEqual({ overflow: "auto", clipped });

      const authorize = dialog(page).getByRole("button", { name: "Authorize & Begin" });
      await authorize.scrollIntoViewIfNeeded();
      await expect(authorize).toBeInViewport({ ratio: 1 });
      await authorize.click();
      await expect(dialog(page)).toBeHidden();
    });
  }

  test("traps focus, closes on Escape and returns focus", async ({ page }) => {
    await open(page);
    const trigger = button(page, "Review Terms");
    await trigger.click();
    await expect(dialog(page)).toBeVisible();
    await expect(page.getByRole("button", { name: "Close terms" })).toBeFocused();
    const authorize = await dialog(page).getByRole("button", { name: "Authorize & Begin" }).boundingBox();
    expect(authorize?.height).toBeLessThan(64);

    for (let press = 0; press < 5; press += 1) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(
        () => document.activeElement === document.body || !!document.activeElement?.closest("dialog"),
      );
      expect(inside).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await page.getByRole("button", { name: "Close terms" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await page.mouse.click(4, 4);
    await expect(dialog(page)).toBeHidden();
  });

  test("wears the active brand inside the top layer", async ({ page }) => {
    await open(page);
    await chooseBrand(page, "Orbit", "orbit");
    await button(page, "Review Terms").click();
    const sheet = page.getByRole("dialog", { name: "Confirm Freight Release terms" });
    await expect(sheet).toBeVisible();
    expect(await computed(sheet, "background-color")).toBe("rgb(31, 36, 33)");
    expect(await computed(sheet, "font-family")).toMatch(/JetBrains/i);
  });

  test("authorize and revoke from the sheet and from the dialog", async ({ page }) => {
    await open(page);
    const state = page.getByTestId("authorization-state");
    const frame = section(page, "modal");

    await frame.getByRole("button", { name: "Authorize & Begin" }).click();
    await expect(state).toHaveText("Authorized for this demo.");
    await expect(toast(page)).toContainText("nothing was sent");

    await frame.getByRole("button", { name: "Revoke authorization" }).click();
    await expect(state).toHaveText("Awaiting authorization.");
    await expect(toast(page)).toHaveText("Intake authorization revoked.");

    await button(page, "Review Terms").click();
    await dialog(page).getByRole("button", { name: "Authorize & Begin" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(state).toHaveText("Authorized for this demo.");
    await expect(button(page, "Review Terms")).toBeFocused();
  });

  test("the dialog refuses to authorize without consent", async ({ page }) => {
    await open(page);
    await gallery(page).getByRole("checkbox").uncheck();
    await button(page, "Review Terms").click();
    const authorize = dialog(page).getByRole("button", { name: "Authorize & Begin" });
    await expect(authorize).toHaveAttribute("aria-disabled", "true");
    await expect(dialog(page)).toContainText("Agree to the privacy practices");
    await authorize.click({ force: true });
    await expect(dialog(page)).toBeVisible();
    await expect(page.getByTestId("authorization-state")).toHaveText("Awaiting authorization.");
  });
});

test.describe("token diff", () => {
  const row = (page: Page, id: string) => page.getByTestId(`diff-${id}`);

  test("binds the active row to the active brand", async ({ page }) => {
    await open(page);
    await expect(row(page, "solace")).toContainText("Solace Health (Active)");
    await expect(row(page, "solace")).toHaveAttribute("aria-current", "true");
    await expect(row(page, "orbit")).not.toContainText("(Active)");

    await chooseBrand(page, "Orbit", "orbit");
    await expect(row(page, "orbit")).toContainText("Orbit Supply (Active)");
    await expect(row(page, "orbit")).toHaveAttribute("aria-current", "true");
    await expect(row(page, "solace")).not.toContainText("(Active)");
    await expect(row(page, "solace")).not.toHaveAttribute("aria-current");
  });

  test("reads effective tokens, including tuning and overrides", async ({ page }) => {
    const saved = {
      brandId: "orbit",
      tuning: { density: "comfortable", radius: "24px", cta: "pill" },
      overrides: { orbit: { primary: "#FF0066" }, lumen: { primary: "#00AA88" } },
      device: "mobile",
    };
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [STORAGE_KEY, JSON.stringify(saved)],
    );
    await open(page);
    const value = (id: string, name: string) =>
      row(page, id).locator("div", { hasText: name }).locator("dd").last();
    await expect(value("orbit", "Primary")).toHaveText("#FF0066");
    await expect(value("orbit", "Radius")).toHaveText("24px");
    await expect(value("lumen", "Primary")).toHaveText("#00AA88");
    await expect(value("solace", "Primary")).toHaveText("#5E8271");
  });
});

test.describe("scope", () => {
  const dirty = async (page: Page) => {
    await button(page, "Like").click();
    await button(page, "Book consultation").click();
    await button(page, "Dismiss alert").click();
    await gallery(page).getByRole("textbox", { name: "Full Legal Name" }).fill("");
  };

  const expectClean = async (page: Page) => {
    await expect(button(page, "Like")).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByTestId("booking-status")).toHaveText("No appointment booked yet.");
    await expect(page.getByTestId("alert-region")).toContainText("Consultation Confirmed");
    await expect(gallery(page).getByRole("textbox", { name: "Full Legal Name" })).toHaveValue(
      "Elena Rostova, MSc",
    );
  };

  test("a brand change never resurrects old specimen state", async ({ page }) => {
    await open(page);
    await dirty(page);
    await chooseBrand(page, "Orbit", "orbit");
    await expect(button(page, "Like")).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByTestId("booking-status")).toHaveText("NO DISPATCH QUEUED.");
    await chooseBrand(page, "Solace", "solace");
    await expectClean(page);
  });

  test("header reset clears specimens and the filter", async ({ page }) => {
    await open(page);
    await dirty(page);
    await chip(page, "Feedback").click();
    await page.getByRole("button", { name: "Reset lab" }).click();
    await expect(chip(page, "All")).toHaveAttribute("aria-pressed", "true");
    await expectClean(page);
  });

  test("live regions exist before they have anything to say", async ({ page }) => {
    await open(page);
    await expect(toast(page)).toHaveAttribute("role", "status");
    await expect(toast(page)).toBeEmpty();
    await expect(page.getByTestId("search-status")).toHaveAttribute("role", "status");
    await expect(page.getByTestId("search-status")).toBeEmpty();
    await expect(page.getByTestId("alert-region")).toHaveAttribute("role", "status");
  });

  test("the toast clears itself", async ({ page }) => {
    await open(page);
    await button(page, "Confirm, default state").click();
    await expect(toast(page)).toHaveText("Default button pressed.");
    await expect(toast(page)).toBeEmpty({ timeout: 6000 });
  });

  test("a brand restored from storage starts with its own copy", async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [
        STORAGE_KEY,
        JSON.stringify({
          brandId: "lumen",
          tuning: { density: "comfortable", radius: "12px", cta: "sharp" },
          overrides: {},
          device: "mobile",
        }),
      ],
    );
    await open(page);
    await expect(gallery(page).getByRole("textbox", { name: "Fellow Name" })).toHaveValue("Amara Sen, PhD");
  });
});

test.describe("layout and accessibility", () => {
  test("no brand or filter scrolls the page sideways", async ({ page }) => {
    await open(page);
    const fits = () =>
      page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    for (const [name, id] of [
      ["Solace", "solace"],
      ["Orbit", "orbit"],
      ["Lumen", "lumen"],
    ]) {
      await chooseBrand(page, name, id);
      expect(await fits()).toBe(true);
    }
    await button(page, "Review Terms").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await fits()).toBe(true);
  });

  test("every text specimen meets AA contrast in every brand", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page);

    for (const [name, id] of [
      ["Solace", "solace"],
      ["Orbit", "orbit"],
      ["Lumen", "lumen"],
    ]) {
      await chooseBrand(page, name, id);
      await gallery(page).getByRole("searchbox").fill("a");
      await gallery(page).getByRole("textbox").last().fill("");
      await gallery(page).getByRole("checkbox").uncheck();
      await button(page, /View|Profile/).first().click();
      await expect(page.getByTestId("consent-error")).toBeVisible();

      const { checked, failures } = await page.evaluate(() => {
        type Rgba = [number, number, number, number];
        const parse = (value: string): Rgba => {
          const numbers = (value.match(/-?[\d.]+/g) ?? []).map(Number);
          if (value.startsWith("color(srgb")) {
            const [r, g, b, a = 1] = numbers;
            return [r * 255, g * 255, b * 255, a];
          }
          const [r, g, b, a = 1] = numbers;
          return [r, g, b, a];
        };
        const over = (top: Rgba, bottom: Rgba): Rgba => {
          const [r, g, b, a] = top;
          return [
            r * a + bottom[0] * (1 - a),
            g * a + bottom[1] * (1 - a),
            b * a + bottom[2] * (1 - a),
            1,
          ];
        };
        const backdrop = (element: Element | null): Rgba => {
          if (!element) return [255, 255, 255, 1];
          const color = parse(getComputedStyle(element).backgroundColor);
          return color[3] === 1 ? color : over(color, backdrop(element.parentElement));
        };
        const channel = (value: number) => {
          const srgb = value / 255;
          return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
        };
        const luminance = ([r, g, b]: Rgba) =>
          0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

        const root = document.querySelector('[data-testid="gallery"]') as Element;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const problems: string[] = [];
        let measured = 0;
        while (walker.nextNode()) {
          const element = walker.currentNode.parentElement as HTMLElement;
          const text = walker.currentNode.textContent?.trim();
          if (!text || !element.checkVisibility()) continue;
          if (element.closest("button:disabled, [aria-hidden='true'], option, select")) continue;
          if (getComputedStyle(element).clipPath !== "none") continue;
          measured += 1;
          const foreground = parse(getComputedStyle(element).color);
          const background = backdrop(element);
          const light = Math.max(luminance(foreground), luminance(background));
          const dark = Math.min(luminance(foreground), luminance(background));
          const ratio = (light + 0.05) / (dark + 0.05);
          if (ratio < 4.5) problems.push(`${ratio.toFixed(2)} ${text}`);
        }
        return { checked: measured, failures: problems };
      });
      expect(checked).toBeGreaterThan(50);
      expect(failures, `contrast failures in ${name}`).toEqual([]);
    }
  });
});
