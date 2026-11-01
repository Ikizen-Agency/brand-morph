# Brand Morph Lab

Locator: `odd/tasks/brand-morph-lab.md` (Engram mirror: `odd/brand-morph-lab/tasks`).

## Objective

Rebuild the Stitch export `stitch_brand_morph_design_playground.zip` as a Next.js + pnpm app, deployed on Vercel with automatic CD, as a portfolio piece.

Every control in the app must be functional.

## Problem

The export is a mobile-only prototype: dead navigation, Play CDN Tailwind, brand state not shared across screens, and token values that disagree between sources. Several controls are fake (filter chips, per-brand tokens, device preview).

## Why

A portfolio visitor must be able to use every control, on any viewport, from a public URL.

## Scope

- Three routes: `/` Playground, `/components`, `/tokens`.
- One shared brand and tuning state across routes, persisted per visitor.
- Every control works. No inert specimens and no dead `href="#"`.
- Mobile, tablet and desktop layouts following `DESIGN.md`.
- GitHub Actions CD to Vercel, following the `ikizen-flow` workflow pattern.

Out of scope: backend, accounts, AI.

## Constraints

- Fully client-side, no runtime environment variables.
- Stack aligned with `ikizen-flow`: Next 16.4.1, React 19.3.0, Tailwind 4, TypeScript 5, pnpm 11.21.0, Node >= 22.
- No third-party runtime hosts: fonts through `next/font`, images self-hosted, no Material Symbols CDN.
- Brand styles stay scoped to the sandbox and never leak into the studio chrome.
- Use uppercase technical labels, 4px rhythm, quiet shadows and 1px hairlines.

## Canonical design decisions

The sources conflict, so these win:

| Topic | Decision |
| --- | --- |
| Workbench palette | `DESIGN.md` warm palette: canvas `#FBF9F5`, elevated `#FFFFFF`, subtle `#F3EFEA`, borders `#E2DDD4` / `#C8C1B5`, text `#1F2421` / `#5A605B` / `#888C87` |
| Radius | Controls 8px, enclosures 12px, badges pill |
| Brand primaries | Playground values: Solace `#5E8271`, Orbit `#0047FF`, Lumen `#2B1E70` |
| Orbit surface | Dark sandbox on every screen |
| Brand type | Fonts really morph: Solace sans, Orbit mono, Lumen serif |
| Token export | One typed source generates every format |
| Tailwind export | Separate v3 config and v4 `@theme` outputs |
| JSON export | DTCG `$value` / `$type`, complete token set |

## Delivery strategy

`exception-ok`: greenfield bootstrap with no prior base to chain against. Work-unit commits stay on `feat/brand-morph`. Forecast is about 3000 authored lines.

## Tasks

- [x] T1 Scaffold and token domain. Route: delegated direct (2+ non-trivial files).
  - Acceptance: app builds; typed brand tokens, exporters and tuning reducer are pure and tested; every brand passes AA contrast for primary on-primary and text on surface; per-brand color overrides resolve into effective tokens for exports and contrast checks.
  - Checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- [x] T2 Studio shell and Playground. Route: delegated direct (2+ non-trivial files).
  - Acceptance: shared layout and working navigation; brand cards, density, radius, CTA shape, device preview, auto-match, reset, about dialog and ledger copy all work; ledger always matches state; sandbox is style-isolated.
  - Checks: T1 checks plus browser verification.
- [ ] T3 Components screen. Route: delegated direct.
  - Acceptance: specimens restyle per brand; filter chips filter sections; toggle exposes switch semantics; dismissed alert can be replayed; modal specimen opens; diff binds to active brand; no inert specimens: bookmark, share, cancel, reserve, profile, upload, authorize and more all give real local behavior (state change, native file picker, or toast feedback).
  - Checks: T1 checks plus browser verification.
- [ ] T4 Tokens screen. Route: delegated direct.
  - Acceptance: every swatch, radius and elevation reflects the active brand; copy reports real success or failure; all copy targets are keyboard buttons; format tabs and download use the generators; color pickers edit the active brand tokens live with a contrast indicator, and the Playground, Components and exports all reflect the edits.
  - Checks: T1 checks plus browser verification.
- [ ] T5 Responsive, accessibility, e2e and README. Route: delegated direct.
  - Acceptance: mobile tabs, tablet and desktop layouts work with no horizontal scroll; Playwright smoke covers navigation and brand persistence; README explains the project.
  - Checks: T1 checks plus `pnpm test:e2e`.
- [ ] T6 CD and deployment. Route: delegated direct.
  - Acceptance: push to `main` runs checks and deploys; public URL verified in a real browser.
  - Checks: workflow run green, production smoke.

## Progress

T1 complete: scaffold, token domain, exporters, contrast helpers, lab reducer with per-brand color overrides, and safe persisted state parsing.

T2 complete: persisted `LabProvider`, studio shell, working navigation with placeholder `/components` and `/tokens`, Playground with brand cards, tuning rack, token-scoped sandbox, derived ledger, about dialog, and self-hosted images and fonts.

## Verification evidence

T1, observed on Node 26.4.0 and pnpm 11.21.0:

- `pnpm lint`: exit 0, no warnings.
- `pnpm typecheck`: exit 0.
- `pnpm test`: 4 files, 60 tests passed.
- `pnpm build`: exit 0, `/` prerendered as static.
- RED: 4 test files failed on missing modules before implementation. With the implementation in place, the AA test failed on the extracted Solace pairing: `expected 4.279216624086874 to be greater than or equal to 4.5`.

Token decisions:

- Solace `onPrimary` changed from `#FFFFFF` (4.28:1) to `#0A0F0C` (4.52:1), because the canonical primary stays `#5E8271`.
- Orbit radii are `0px`, following the playground and `DESIGN.md` rather than the token sheet (2/4/8px).
- Not in the sources, so chosen here: Orbit `border` and semantics, Lumen `border` and semantics, and the `JetBrains Mono` and `Source Serif 4` stacks.
- `warning` values are not AA as text on Solace surfaces; use them as fills or pair them with `onSurface`.

T2, observed on Node 26.4.0 and pnpm 11.21.0:

- `pnpm lint`: exit 0.
- `pnpm typecheck`: exit 0.
- `pnpm test`: 6 files, 79 tests passed.
- `pnpm build`: exit 0, all routes prerendered as static.
- `pnpm test:e2e`: 46 passed, 23 specs each in Chromium at 390px and 1440px, failing on any console error, page error, HTTP error or third-party request.
- RED: `selectBrand on the active brand is a no-op that keeps tuning edits` failed with `expected { brandId: 'orbit', ...} to be { brandId: 'orbit', ...} // Object.is equality`. The ledger and scope variable tests failed on missing modules before implementation.
- Browser testing found a real defect: on phones the reset notice was hidden from assistive technology. Fixed with a single always-present status region.
- Screenshots at 390px, 820px and 1440px compared with `screen.png`.

T2 decisions:

- Device presets are real widths of 390, 768 and 1280, scaled to fit, instead of a fill preset. At 1440px the center pane is narrower than 768, so a fill preset would have been smaller than Tablet.
- The simulated device is part of `LabState` and persists. Selecting a brand and Auto-match keep it; Reset restores Mobile.
- Solace card tag reads `Humanist Sans`, following the canonical decision that Solace is sans.
- The export version label `v1.4` is dropped because it matches no real release.
- Section labels use `muted` rather than `primary`, because Orbit primary on its surface is unreadable.

T2 gaps:

- The export emblem URL returned HTTP 403, so the emblem is an inline SVG drawn for this project.
- The export has no Orbit or Lumen photos. Their heroes are inline SVG driven by scope variables, and their members use monogram avatars.
- The tablet inspector drawer from `DESIGN.md` is not built. Tablet uses a stacked layout; T5 owns the final tablet decision.
- No UI sets color overrides until T4. The e2e covers overrides through seeded persisted state.

## Next step

T3. Build the Components screen on `BrandScope`, replacing the `/components` placeholder. `solace-doctor-portrait.jpg` is already in `public/brands/`.
