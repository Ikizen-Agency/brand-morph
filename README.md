# Brand Morph

Change one set of design tokens and watch one product become three different brands, live in your browser. Brand Morph is an interactive design lab by Ikizen.

**Live demo:** [brand-morph-chi.vercel.app](https://brand-morph-chi.vercel.app)

## What you can do

| Screen | Route | Try this |
|--------|-------|----------|
| Playground | `/` | Morph a real landing page between Solace, Orbit and Lumen. Tune density, radius and CTA shape, and preview it at phone, tablet and desktop widths. |
| Components | `/components` | Use a working UI kit that restyles per brand: forms, cards, alerts, a modal and more. Compare brands in the token diff. |
| Tokens | `/tokens` | Edit any color with a live contrast check, then copy or download the result in five formats. |

Your brand, tuning and color edits stay in this browser and follow you across all three screens. There is no backend and no account.

## How the tokens flow

One typed source produces everything you see and everything you export.

```text
brands.ts (3 brands)
  + tuning (density, radius, CTA shape)
  + your color overrides
        │
        ▼
resolveTokens() ──► one TokenSet
        │
        ├──► the live UI, through scoped CSS variables
        └──► 5 exports: CSS · Tailwind v3 · Tailwind v4 · TypeScript · DTCG 2025.10 JSON
```

Because the UI and the exports read the same `TokenSet`, a downloaded file always matches what is on screen.

## Run it locally

You need Node 22 or newer and pnpm 11.

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. No environment variables are required.

## Test it

| Command | What it checks |
|---------|----------------|
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript, including route types |
| `pnpm test` | Unit tests for the domain and application layers |
| `pnpm build` | Production build |
| `pnpm test:e2e` | Playwright at 390px and 1440px. The cross-route smoke and axe specs also run at 820px. |

The first end-to-end run needs a browser:

```bash
pnpm exec playwright install chromium
```

The e2e suite fails on any console error, failed request or third-party request, and on any serious or critical axe violation.

## Architecture

The code lives in `src/brand-lab`, in layers that depend only inward. `src/app` holds thin Next.js routes.

| Path | Holds | Depends on |
|------|-------|------------|
| `domain/` | Brands, token resolution, contrast math, exporters | Nothing |
| `application/` | Lab state and persistence parsing, ledger, gallery and inspector logic | `domain/` |
| `ui/shell/` | Header, navigation, about dialog, status pages | `application/`, `domain/` |
| `ui/playground/` | Brand cards, tuning rack, device stage, tablet drawer, ledger | Same |
| `ui/sandbox/` | The morphing landing page, style-isolated by scoped variables | Same |
| `ui/gallery/` | Component specimens and the token diff | Same |
| `ui/tokens/` | Color editors, type and geometry sections, export panel | Same |

## Layouts

| Width | Layout |
|-------|--------|
| Under 640px | One column with bottom tabs |
| 640px to 1023px | Sandbox first, controls in a bottom drawer. Components and Tokens use two columns. |
| 1024px and up | Tri-pane workbench, capped at 1680px on very wide screens |

## Deployment

Brand Morph is a static Next.js app, so it runs on Vercel with no runtime configuration.

| Variable | Required | Effect |
|----------|----------|--------|
| `VERCEL_PROJECT_PRODUCTION_URL` | No | Vercel sets it. Used at build time for absolute Open Graph URLs, `robots.txt` and `sitemap.xml`. Without it the build still works and the sitemap is empty. |
