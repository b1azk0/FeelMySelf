---
title: FeelMySelf — Phase 1 (Astro Port) Design
date: 2026-05-02
status: approved
phase: 1 of 3
project: FeelMySelf
---

# FeelMySelf — Phase 1 (Astro Port) Design

## Context

`feelmyself.pl` is a WooCommerce shop currently running on WordPress (Botiga
Pro theme by aThemes), hosted on Hetzner server `.159` (89.167.66.159) on a
LEMP + Redis Object Cache Pro + FastCGI cache stack behind Cloudflare
(Full Strict). The infrastructure is already well-tuned.

Goal: incrementally migrate the site to a modern Astro stack while preserving
visual identity, URL structure, and SEO equity. The migration is staged in
three phases:

- **Phase 1 (this spec):** Visual port — marketing pages, blog, read-only
  product/category pages with deep-links to live Woo for purchases. Deployed
  to `stage.feelmyself.pl` via Cloudflare Pages.
- **Phase 2:** Add real ecommerce — decide between Astro-native commerce
  (Stripe + custom cart) and headless WooCommerce; implement cart, checkout,
  customer accounts.
- **Phase 3:** SEO / GEO / AEO optimization — Core Web Vitals pass, image
  pipeline migration to Cloudflare R2 + Images, structured data expansion,
  geo-targeted variants, answer-engine optimization.

Each phase gets its own brainstorm → spec → plan cycle.

## Phase 1 Scope & Success Criteria

### In scope

- All marketing pages (homepage, about, contact, etc.) ported to Astro with
  visual parity to the live site.
- Blog (all posts) migrated to Markdown in `src/content/blog/` and rendered
  via Astro Content Collections.
- Product category pages and individual product pages — read-only, rendered
  from live WooCommerce Store API data at build time, with "Buy" / "Add to
  cart" buttons deep-linking back to `feelmyself.pl/produkt/<slug>` for
  actual purchases.
- All current URL paths preserved (`/produkt/<slug>`,
  `/kategoria-produktu/<slug>`, blog slugs, page slugs) so eventual cutover
  preserves SEO indexing.
- Deployment pipeline: `main` branch → Cloudflare Pages → `stage.feelmyself.pl`.
  PR previews auto-generated for visual review.
- i18n architecture in place from day one (Polish-only content, EN-ready
  config).

### Out of scope (explicitly deferred)

- Cart, checkout, customer accounts, order history → Phase 2
- Product search → Phase 2 (browse-by-category only in Phase 1)
- Image optimization, R2 migration → Phase 3
- WordPress webhook auto-rebuild → Phase 2 (manual + nightly cron in Phase 1)
- DNS cutover from Woo to Astro at the apex `feelmyself.pl` →
  separate post-Phase-1 / pre-Phase-2 decision

### Success criteria

**Done = "looks the same to a normal visitor."** Side-by-side visual review
of every page archetype against the live site, on mobile and desktop, in
Cloudflare Pages PR previews. Not pixel-perfect; visually-indistinguishable
in normal use.

Hard gates before declaring Phase 1 complete:

- All page archetypes rendered and visually approved
- All current URLs from live sitemap exist on the staging site
  (`scripts/verify-url-parity.mjs` passes)
- `astro check` (typecheck) passes
- `npm run build` produces a successful static output in <2 min
- Lighthouse score on staging ≥ live site (regression alarm)
- `robots.txt` on staging blocks all crawlers

### Workstreams

Phase 1 itself is multi-track. The implementation plan will sequence/parallelize:

1. Repo + deploy scaffolding (Astro skeleton, Cloudflare Pages wiring, GH
   Actions workflows)
2. Design-system extraction (asset pull from `.159`, scrape live HTML, audit
   tokens, populate `tailwind.config.js`)
3. Content migration (WP REST → Markdown blog export)
4. Product/category integration (Woo Store API client, content loader,
   templates)
5. Page templates + visual parity pass (marketing pages, layouts, side-by-side
   review against live site)

## Architecture & Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Astro (`output: 'static'`) | Static-first matches Phase 1 scope; islands available for Phase 2 interactivity |
| Styling | Tailwind CSS via `@astrojs/tailwind` | Tokens map cleanly to `tailwind.config.js`; JIT keeps production CSS small (Phase 3 perf); LLM-friendly |
| i18n | Astro built-in i18n, `defaultLocale: 'pl'`, `prefixDefaultLocale: false` | Clean PL URLs today, additive EN later |
| Blog content | Astro Content Collections (Markdown) | Versioned in git, fast builds, no runtime dependency |
| Product content | Custom Astro content loader → Woo Store API at build time | Live data without migration churn; same query interface as blog |
| Images | `<Image>` component + `resolveImageUrl()` helper, proxied from `feelmyself.pl/wp-content/uploads/` | Zero migration in Phase 1; Phase 3 swaps resolver to R2 |
| Hosting | Cloudflare Pages | GitHub-integrated push-to-deploy, free PR previews, native CF DNS |
| CDN / Edge | Cloudflare in front of Pages and proxied WP media | Already in place |
| Build triggers | GH push (code) + nightly cron + manual `workflow_dispatch` (content refresh via deploy hook) | Covers all realistic refresh cases without WP-side changes |

### Architectural commitments

- **All image references go through the `<Image>` abstraction.** No raw
  `<img src="...wp-content/uploads/...">` in templates. Markdown-embedded
  images are routed through the same resolver via a remark plugin. This is
  the precondition for Phase 3 R2 migration being a one-line change.
- **All Woo API calls go through `src/lib/woo.ts`.** Templates never fetch
  directly. Keeps the integration surface auditable.
- **All recurring UI patterns are Astro components, not `@apply` classes.**
  Single source of truth for component styling.

## Repo Structure

```
FeelMySelf/
├── .github/workflows/
│   ├── refresh-content.yml      # nightly cron + manual dispatch → CF Pages deploy hook
│   └── ci.yml                   # typecheck + build on PRs
├── docs/
│   ├── superpowers/specs/       # design docs (this file)
│   └── superpowers/plans/       # implementation plans
├── public/
│   └── favicon.ico, robots.txt, etc.
├── scripts/
│   ├── migrate-blog-from-wp.mjs # one-time WP REST → src/content/blog/*.md
│   └── extract-design-tokens.mjs # helper for the design-system audit
├── src/
│   ├── content/
│   │   ├── config.ts            # collections schema (blog + products loader)
│   │   └── blog/                # migrated WP posts as .md with frontmatter
│   ├── components/
│   │   ├── primitives/          # Button, Image, Link, Container
│   │   ├── layout/              # Header, Footer, Nav
│   │   ├── blog/                # PostCard, PostMeta, PostBody
│   │   ├── product/             # ProductCard, ProductGallery, PriceTag, BuyButton
│   │   └── home/                # HeroBlock, FeaturedCategories, etc.
│   ├── layouts/
│   │   ├── BaseLayout.astro     # <html>, <head>, meta, fonts, analytics
│   │   ├── PageLayout.astro     # marketing pages
│   │   ├── BlogPostLayout.astro
│   │   └── ProductLayout.astro
│   ├── lib/
│   │   ├── woo.ts               # Woo Store API client (typed)
│   │   ├── images.ts            # resolveImageUrl + remark plugin
│   │   ├── i18n.ts              # locale helpers
│   │   └── seo.ts               # canonical/og/schema.org helpers
│   ├── pages/
│   │   ├── index.astro
│   │   ├── [...slug].astro      # static marketing pages
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── produkt/[slug].astro
│   │   └── kategoria-produktu/[slug].astro
│   └── styles/
│       └── global.css           # @tailwind directives, font-face, base resets
├── reference/
│   ├── scraped-pages/           # wget --mirror snapshots of live site (gitignored or git-LFS)
│   └── design-tokens.md         # audit output (color/type/spacing inventory)
├── astro.config.mjs
├── tailwind.config.js           # design tokens live here
├── tsconfig.json
├── package.json
├── README.md
├── CHANGELOG.md
├── CLAUDE.md                    # project-specific instructions for future sessions
└── .gitignore
```

### Conventions

- `src/components/primitives/` is the only place new "atoms" are introduced
  — keeps the design system small and discoverable.
- `src/lib/woo.ts` is the only file that imports/calls the Woo API.
- `scripts/` are one-shot or maintenance utilities, never imported by the app.
- `reference/scraped-pages/` is documentation, not code — gitignored or
  git-LFS depending on size.

## Build & Deploy Pipeline

### Branching model (Phase 1)

- `main` → deployed to `stage.feelmyself.pl`
- Feature branches → PR → Cloudflare Pages auto-generates a preview URL per PR
- No long-lived `develop` / `staging` branch in Phase 1. A `prod` branch and
  prod environment land at cutover (post-Phase-1).

### Cloudflare Pages (one-time setup, manual via CF dashboard)

1. Connect Pages project to the GitHub repo (CF GitHub App, read-only access)
2. Build command: `npm run build`, output dir: `dist/`
3. Production branch: `main` → custom domain `stage.feelmyself.pl`
4. Preview branches: all branches → auto preview URLs
5. Environment variables:
   - `WOO_API_BASE=https://feelmyself.pl/wp-json/wc/store/v1`
   (no auth needed for public Store API endpoints)
6. Deploy hook URL stored as GH secret `CF_DEPLOY_HOOK_URL`

### DNS (Cloudflare)

- `stage.feelmyself.pl` CNAME → `feelmyself-stage.pages.dev`
  (CF auto-configures when adding the custom domain)
- Cloudflare proxy ON, Full (Strict) SSL, automatic HTTPS rewrites

### GitHub Actions

- `ci.yml` — runs on PRs: `npm ci`, `astro check` (typecheck),
  `npm run build`. Required check before merging to `main`.
- `refresh-content.yml` — runs nightly at 03:00 UTC via cron +
  `workflow_dispatch` (manual). Single step:
  `curl -X POST $CF_DEPLOY_HOOK_URL`. Pages re-runs the build, fetches
  latest Woo product data.

### Performance budget

- Phase 1 build target: <2 min on Cloudflare Pages.
- If product count grows large enough that Woo API fetch dominates, cache
  the product fetch with a content hash and skip rebuild when product data
  hasn't changed (Phase 3 optimization).

### Secrets / credentials

- `CF_DEPLOY_HOOK_URL` (GH secret) — for the refresh workflow
- That's it for Phase 1. No CF API tokens needed (Pages handles deploy via
  GitHub App).

### Rollout sequence

1. (Claude) scaffold Astro repo locally, first commit
2. (Blazej) create the empty GH repo (decide name + private/public),
   provide the URL
3. (Claude) push the scaffold, verify `npm run build` works locally
4. (Blazej) ~5 min in CF dashboard following step-by-step instructions:
   connect repo, set build command, add `stage.feelmyself.pl` custom
   domain, copy the deploy hook URL back
5. (Claude) add deploy hook as GH secret, push workflow files, verify
   first auto-deploy works end-to-end

## Migration & Asset Strategy

### Blog migration (one-time, runs locally before scaffold push)

- `scripts/migrate-blog-from-wp.mjs` — Node script using `node-fetch`,
  hits `https://feelmyself.pl/wp-json/wp/v2/posts?per_page=100&_embed`,
  paginates through all posts.
- For each post: convert HTML body to Markdown via `turndown`, extract
  featured image URL, extract categories/tags, write to
  `src/content/blog/<slug>.md` with frontmatter (`title`, `slug`, `date`,
  `excerpt`, `featuredImage`, `categories`, `tags`, `locale: 'pl'`).
- Inline `<img>` tags in the body keep their absolute
  `wp-content/uploads/...` URLs — the remark image-resolver plugin handles
  them at build time.
- Re-runnable: idempotent, overwrites existing files.
- Sample of 2–3 migrated posts shown to Blazej for fidelity check before
  bulk migration.

### Product / category integration (runs at every build)

- `src/lib/woo.ts` — typed client for Woo Store API
  (`/wc/store/v1/products`, `/wc/store/v1/products/categories`). Public
  endpoints, no auth. Returns normalized `Product` and `Category` types
  defined in `src/content/config.ts`.
- Build-time fetch in `getStaticPaths()` for `produkt/[slug].astro` and
  `kategoria-produktu/[slug].astro` — generates one static page per
  product/category.
- If Woo API is down at build time → build fails (loud, by design).
  Better to see a red CI than silently ship a stale build with missing
  products.
- Cached locally in dev via `.astro/woo-cache.json` (gitignored) to avoid
  hammering the live API while iterating.

### Design system extraction (one-time audit pass)

- SSH session to `.159` to grab: active theme `style.css`, customizer
  settings export, any custom CSS from a child theme or mu-plugin.
- `wget --mirror -p --convert-links --no-parent https://feelmyself.pl/`
  to capture rendered HTML/CSS for ~5–8 representative pages → committed
  to `reference/scraped-pages/` (gitignored or git-LFS depending on size).
- Manual audit: open scraped CSS in browser devtools, catalog every
  distinct color, font-size, font-weight, spacing value, border-radius,
  breakpoint. Document in `reference/design-tokens.md`.
- Translate audit doc into `tailwind.config.js` extending the default theme.

### Media library (Phase 1 strategy)

- No bulk download. Images proxied via
  `https://feelmyself.pl/wp-content/uploads/...`, cached at Cloudflare edge.
- `<Image>` component sets `loading="lazy"` and explicit `width`/`height`
  to prevent CLS.
- Phase 3 R2 migration: separate one-shot script downloads everything,
  uploads to R2, emits a key manifest, swap one line in
  `resolveImageUrl()`.

### SEO continuity (Phase 1 essentials)

- URL structure mirrors live Woo paths exactly — verified by
  `scripts/verify-url-parity.mjs` which crawls the live site's sitemap and
  asserts each URL exists in the built Astro site.
- Meta tags (`<title>`, `<meta description>`) ported from WP. RankMath
  stores these in post meta — extracted during blog migration; for
  products, read from Woo API meta fields.
- `<link rel="canonical">` on every page points to the eventual prod URL
  (`feelmyself.pl/...`), NOT the staging URL. Prevents staging from
  competing with prod in Google's index if it ever gets crawled.
- `robots.txt` on `stage.feelmyself.pl`: `Disallow: /` for all
  user-agents. Removed at cutover.
- Schema.org structured data (Product, Article, BreadcrumbList) generated
  from collection data via `src/lib/seo.ts`.
- Phase 3 expands to GEO and AEO — out of Phase 1 scope.

## Deferred Decisions & Phase 2/3 Hooks

### Deferred to Phase 2 (commerce)

- **Astro-native commerce vs headless WooCommerce** — Phase 1 doesn't
  pick this. Phase 1 `lib/woo.ts` uses the Store API which works for
  both directions (read for Phase 1, read+write for headless-Woo Phase 2).
- **Cart, checkout, customer accounts** — buy buttons in Phase 1
  deep-link to live Woo. When Phase 2 lands, those buttons swap to
  in-app cart actions in one component update.
- **Search** — Phase 1 has no product search UI. Phase 2 likely adds
  Algolia / Meilisearch / pagefind depending on commerce direction.
- **WP → GH webhook for auto-rebuild** — added in Phase 2 when we're
  already touching the WP side.

### Deferred to Phase 3 (SEO / GEO / AEO + perf)

- **Cloudflare R2 + Cloudflare Images migration** — image abstraction is
  in place, swap is one resolver change.
- **Lighthouse / Core Web Vitals optimization pass** — measured in
  Phase 1 but not optimized.
- **Schema.org expansion** — Phase 1 ships Product / Article /
  BreadcrumbList; Phase 3 adds Review, FAQ, Organization, sameAs, etc.
- **GEO** — geo-targeted landing variants, hreflang setup if EN added.
- **AEO** — content restructuring for answer-engine citation
  (ChatGPT/Perplexity/Claude crawlers): semantic HTML, FAQ blocks,
  summary paragraphs, llms.txt, structured Q&A.
- **Sitemap / robots strategy at prod** — Phase 1 blocks all crawlers
  on staging; cutover plan handles prod sitemap submission.

### Open / post-Phase-1, pre-Phase-2

- **DNS cutover** — when `feelmyself.pl` apex stops pointing at the WP
  origin and starts pointing at Cloudflare Pages. Requires: full Phase 1
  visual approval + Phase 2 commerce ready OR a hybrid setup where
  commerce paths still proxy to WP. Separate decision.
- **WP keep-alive vs sunset** — does WP stay running indefinitely (as
  source of truth for product data even with headless Woo), or do we
  rebuild commerce on something else and decommission Woo? Open question
  for Phase 2 brainstorm.

### Explicitly NOT doing in Phase 1 (and why)

- **No CMS layer (Sanity / Storyblok / Contentful).** Blog → MD in git,
  products → Woo API. Adding a CMS is a workflow change, not a tech
  improvement, and was not requested.
- **No analytics / tracking.** Cloudflare Web Analytics is one toggle in
  CF dashboard if wanted; GA4 / Plausible / Umami deferred until cutover.
- **No A/B testing infrastructure.** Premature for a static port.
- **No tests beyond `astro check` and a successful build.** Visual
  regression tooling (Percy / Chromatic) is overkill for Phase 1; PR
  previews + manual side-by-side review do the job. Proper testing lands
  in Phase 2 when there's commerce logic worth testing.

## Next Steps

1. Blazej reviews this spec and approves / requests changes.
2. Claude invokes the `superpowers:writing-plans` skill to produce a
   step-by-step implementation plan covering the five Phase 1 workstreams.
3. Plan review by Blazej.
4. Plan execution begins (scaffold the repo, then proceed through the
   workstreams).
