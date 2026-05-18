---
title: FeelMySelf — Homepage Live-Design Port
date: 2026-05-18
status: approved
phase: 1 of 3 (interjects between WS4 and WS5)
project: FeelMySelf
supersedes: portions of 2026-05-02-phase-1-astro-port-design.md (homepage section, Header/Footer chrome)
---

# FeelMySelf — Homepage Live-Design Port

## Context

Phase 1 paused 2026-05-02 after WS4 (product/category pages live on
`stage.feelmyself.pl`) awaiting Blazej's design feedback before starting
WS5. The feedback is: **port the live `www.feelmyself.pl` homepage to
stage using the same graphics and layout.**

This spec covers a narrow, surgical body of work that runs before WS5
starts. It replaces the WS1 placeholder `src/pages/index.astro` with a
faithful reconstruction of the live homepage, and adjusts the WS2 Header
and Footer to match the live chrome. All other routes (`/blog`,
`/produkt/<slug>` × 5, `/kosmetyki`) are untouched.

WS5 (`/sklep` archive, SEO/JSON-LD, URL parity script, Lighthouse) is
deferred until this work is merged and reviewed.

## Approach (locked during brainstorm)

1. **Scope:** homepage only. Other routes unchanged.
2. **Fidelity:** structural + visual match. Rebuild with our Astro
   primitives and Tailwind v4 `@theme` tokens — not a verbatim HTML/CSS
   scrape. Visual ≈ 95% match; code is ours.
3. **Assets:** download once from live `wp-content/uploads/` and bundle
   into `src/assets/homepage/`. Astro `<Image>` optimizes at build.
4. **Chrome:** sync Header and Footer to live (small surgical edits to
   existing WS2 files).
5. **Structure:** single `index.astro` with all sections inline. YAGNI
   on extracting per-section components until a second page reuses them.
6. **Copy:** lifted verbatim from a fresh fetch of the live homepage
   during implementation. No paraphrasing.
7. **Search bar (Header):** deep-link to live Woo `?s=…`. Phase 1 has
   no local search.
8. **Footer legal links:** point at existing live URLs
   (`/dostawa/`, `/regulamin/`, `/polityka-prywatnosci/`). Those pages
   don't exist on stage yet — they'll be ported in a later WS.

## Live homepage anatomy

Captured 2026-05-18 from `https://www.feelmyself.pl/`:

| # | Section | Content |
|---|---|---|
| 1 | Header | Logo, nav = `Strona Główna` + `Sklep`, search input, mobile toggle |
| 2 | Hero | Full-width image, overlay tagline: `Wyrażaj siebie. Zadbaj o siebie. Bez kompromisów.` |
| 3 | Brand philosophy | White logo + manifest copy emphasizing inclusivity ("for everyone, without exception") |
| 4 | Featured products | 5 products in a row (live uses a carousel; with 5 items a static grid renders identically) |
| 5 | Minimalism banner | Graphic + caption: "one product, many needs" |
| 6 | Partner logos | VegeZone, Superpharm — linked |
| 7 | Final CTA | "Poczuj siebie. Codziennie. Bez wyjątków." |
| 8 | Footer | Three columns: nav (Home/Blog/Sklep), legal (Dostawa/Regulamin/Polityka prywatności), social (YouTube, Instagram). Copyright row: `© 2026 Feel MySelf`. |

## Components and files

### New

- **`scripts/fetch-homepage-assets.mjs`** — one-shot Node script.
  Reads a small URL list (hero, brand-philosophy white logo,
  minimalism banner, VegeZone logo, Superpharm logo, CTA imagery if
  any), downloads each into `src/assets/homepage/`, preserves
  filenames. Idempotent — re-runs safely. Committed alongside the
  fetched binaries.
- **`src/assets/homepage/`** — directory for downloaded brand assets.
  Tracked in git so CF Pages builds are reproducible without network
  access.

### Modified

- **`src/pages/index.astro`** — replaces WS1 placeholder. Renders the
  7 body sections in order, inside `BaseLayout`. Pulls products via
  `getAllProducts()` from `src/lib/woo.ts` (already in use on
  `/sklep` plans and product pages). Reuses `<ProductCard>` from WS4
  for the featured-products row.
- **`src/components/layout/Header.astro`** — nav reduced to
  `Strona Główna` + `Sklep`; search input added as a plain HTML form:
  `<form action="https://www.feelmyself.pl/" method="get">` with a
  single `<input name="s">`. No JS — browser handles the GET. Mobile
  toggle (existing inline JS in Header) preserved unchanged.
- **`src/components/layout/Nav.astro`** — adjust nav items to match.
- **`src/components/layout/Footer.astro`** — three columns + copyright
  row matching live exactly. Social icons use existing primitive
  patterns (no new icon library — inline SVG).

### Untouched

- `src/layouts/BaseLayout.astro`, `BlogPostLayout.astro`,
  `ProductLayout.astro`
- All of `src/pages/produkt/`, `src/pages/blog/`, `src/pages/[slug].astro`
- All of `src/components/primitives/`, `src/components/product/`,
  `src/components/blog/`
- All of `src/lib/`, `src/content/`, `src/styles/`

## Data flow

Build-time only (Astro SSG, `output: 'static'`):

1. `getAllProducts()` runs once during `astro build` → returns 5
   products from `WOO_API_BASE`
2. `index.astro` maps the array to `<ProductCard>` × 5
3. Bundled images in `src/assets/homepage/` are optimized by Astro
   `<Image>` at build (responsive variants, WebP/AVIF)
4. Output: 1 static HTML file at `dist/index.html`

No runtime fetches, no client JS for the homepage body. (Header's
existing mobile-menu toggle JS remains; nothing new added.)

## Copy fidelity protocol

During implementation, before writing `index.astro`, run a fresh
`curl https://www.feelmyself.pl/` and lift exact Polish copy for:

- Hero tagline
- Brand-philosophy block body text
- Minimalism banner caption
- Final CTA line
- Footer legal-link labels (Dostawa? Wysyłka i zwroty?)

This avoids drift from the WebFetch-summarized version used in this
spec (which is paraphrased, not verbatim).

## Asset list (to be confirmed on first fetch)

The exact URL list goes into `scripts/fetch-homepage-assets.mjs`.
Initial best-guess from the live homepage:

- Hero background image
- Brand-philosophy section background (the dark/colored block behind
  the white logo)
- White-on-transparent logo variant (if not already in
  `public/logos/`)
- Minimalism banner graphic
- VegeZone logo
- Superpharm logo
- Final CTA section image (if any)

If the live homepage's HTML reveals additional assets (texture
backgrounds, decorative graphics, Pride heart sub-mark), they're added
to the list. The script logs each asset it fetched.

## Error handling

- **Asset script failure** — script is manual + re-runnable. CF Pages
  builds use already-committed assets, so a failed fetch doesn't break
  deploys.
- **Woo API failure during build** — already handled in
  `src/lib/woo.ts` (existing 8 unit tests). Build fails noisily if Woo
  is down at build time; same behavior as product pages.
- **Missing image at build** — Astro `<Image>` throws at build time;
  CI catches it before deploy.

## Testing

- No new unit tests. The new code is composition (markup + image
  references); unit tests would assert markup, which is low-value.
- Existing 15 unit tests (8 Woo, 7 images) continue to pass — no
  changes to their subjects.
- CI gate: typecheck + test + build green on PR.
- Visual verification: run `npm run dev`, open
  `http://localhost:4321/` and `https://www.feelmyself.pl/` side by
  side, eyeball each of the 7 sections. Then merge → CF Pages deploys
  → re-check on `https://stage.feelmyself.pl/`.

## Out of scope

Explicitly deferred to WS5 or later:

- `/sklep` archive page
- SEO essentials (`src/lib/seo.ts`, JSON-LD, canonical/OG meta)
- `scripts/verify-url-parity.mjs`
- Lighthouse comparison
- Real `/dostawa/`, `/regulamin/`, `/polityka-prywatnosci/` pages on
  stage (Footer links to live for now)
- Local search (Header search deep-links to live)
- Mobile menu redesign (existing WS2 behavior preserved)
- Any product/category/blog page changes

## Success criteria

1. `https://stage.feelmyself.pl/` renders the 7 sections in order,
   visually recognizable as the live homepage.
2. Header shows `Strona Główna` + `Sklep` only; search input present
   and submits to live Woo search.
3. Footer matches live: three columns + copyright row, legal links
   point at live URLs.
4. CI green (typecheck + test + build) on the merging PR.
5. No regression on `/blog`, `/produkt/<slug>` × 5, or `/kosmetyki`.
6. Page weight ≤ live homepage's (we expect significantly less; not
   formally measured here — WS5 owns Lighthouse).

## Resume after this work

Once merged and Blazej signs off visually, the project returns to the
WS5 plan: `/sklep` archive, SEO essentials, URL parity script,
Lighthouse comparison.
