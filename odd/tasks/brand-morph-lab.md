# Brand Morph Lab

Locator: `odd/tasks/brand-morph-lab.md` (Engram mirror: `odd/brand-morph-lab/tasks`).

## Objective

Rebuild the Stitch export `stitch_brand_morph_design_playground.zip` as a Next.js + pnpm app, deployed on Vercel with automatic CD, as a portfolio piece.

## Problem

The export is a mobile-only prototype: dead navigation, Play CDN Tailwind, brand state not shared across screens, and token values that disagree between sources. Several controls are fake (filter chips, per-brand tokens, device preview).

## Why

A portfolio visitor must be able to use every control, on any viewport, from a public URL.

## Scope

- Three routes: `/` Playground, `/components`, `/tokens`.
- One shared brand and tuning state across routes, persisted per visitor.
- Every control either works or is clearly an inert specimen. No dead `href="#"`.
- Mobile, tablet and desktop layouts following `DESIGN.md`.
- GitHub Actions CD to Vercel, following the `ikizen-flow` workflow pattern.

Out of scope: backend, accounts, AI, custom color pickers and sliders (described in `DESIGN.md`, absent from the exported screens).

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

- [ ] T1 Scaffold and token domain. Route: delegated direct (2+ non-trivial files).
  - Acceptance: app builds; typed brand tokens, exporters and tuning reducer are pure and tested; every brand passes AA contrast for primary on-primary and text on surface.
  - Checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- [ ] T2 Studio shell and Playground. Route: delegated direct.
  - Acceptance: shared layout and working navigation; brand cards, density, radius, CTA shape, device preview, auto-match, reset, about dialog and ledger copy all work; ledger always matches state; sandbox is style-isolated.
  - Checks: T1 checks plus browser verification.
- [ ] T3 Components screen. Route: delegated direct.
  - Acceptance: specimens restyle per brand; filter chips filter sections; toggle exposes switch semantics; dismissed alert can be replayed; modal specimen opens; diff binds to active brand.
  - Checks: T1 checks plus browser verification.
- [ ] T4 Tokens screen. Route: delegated direct.
  - Acceptance: every swatch, radius and elevation reflects the active brand; copy reports real success or failure; all copy targets are keyboard buttons; format tabs and download use the generators.
  - Checks: T1 checks plus browser verification.
- [ ] T5 Responsive, accessibility, e2e and README. Route: delegated direct.
  - Acceptance: mobile tabs, tablet and desktop layouts work with no horizontal scroll; Playwright smoke covers navigation and brand persistence; README explains the project.
  - Checks: T1 checks plus `pnpm test:e2e`.
- [ ] T6 CD and deployment. Route: delegated direct.
  - Acceptance: push to `main` runs checks and deploys; public URL verified in a real browser.
  - Checks: workflow run green, production smoke.

## Progress

Repository initialized. No task complete.

## Verification evidence

None yet.

## Next step

T1.
