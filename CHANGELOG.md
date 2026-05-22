# Changelog

All notable changes to the FeelMySelf project are documented here.

## [Unreleased]

### Added — Header sticky on scroll

- Solid header (every page except home) is now `sticky top-0 z-50` —
  pure CSS, no JS. Stays at the top as the user scrolls the page.
- Transparent header (home only) starts `position: absolute` over the
  hero. Tiny inline script (~10 lines) toggles `.is-scrolled` on the
  `<header data-transparent>` when `scrollY > 80`. CSS in `global.css`
  transitions to `position: fixed`, white background, black text, with
  a subtle shadow.
- Logo swap on the transparent header: both the white and the black
  logo are rendered, and CSS hides one based on `.is-scrolled`. No
  flash on transition.

### Added — Legal pages (Regulamin + Polityka prywatności)

- `src/pages/regulamin.md` — full PL shop terms (Regulamin sklepu
  internetowego), 11 paragraphs covering definitions, ordering flow,
  płatności, dostawa, 14-day prawo odstąpienia (with the full PL
  withdrawal form template embedded), wyłączenia z art. 38 ust. 5 dla
  kosmetyków, rękojmia per rozdz. 5a ustawy o prawach konsumenta in
  the post-2023 wording, ODR platform link, prawo właściwe, sąd
  właściwy. Drafted by a legal+copy agent against real company data
  pulled from the public Polish KRS API.
- `src/pages/polityka-prywatnosci.md` — full RODO Art. 13 + cookies
  notice, 12 sections including a structured table of cele × podstawy
  prawne × dane × okres przechowywania, recipient categories (Hetzner,
  Cloudflare, payment operator, courier, GA4, Meta Pixel), transfer
  outside EOG (SCC + EU-US DPF mechanism), full rights catalog,
  itemized cookie table.
- `src/layouts/LegalLayout.astro` — light wrapper around BaseLayout
  using `prose prose-neutral` typography utilities, with the Obowiązuje
  od date rendered below the article body.
- **Company facts** populated from the official MS KRS API
  (Bloom Labs sp. z o.o., KRS 0001127872, NIP 7722438117, REGON
  529741089, siedziba Jedlno Pierwsze 135, kapitał 5 000,00 zł).
- Contact emails left as placeholders (`kontakt@`, `reklamacje@`,
  `rodo@feelmyself.pl`) — Blazej to confirm mailboxes before public
  cutover.
- `Footer.astro` — new `Informacje` column linking the two legal pages.
  Footer grid expanded to `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`:
  Logo / Nawigacja / Informacje / Obserwuj.

### Changed — Brand name canonicalised + PL dash convention

- Brand name sitewide: `Feel MySelf` → **`Feel My Self`** (three words),
  as the wordmark. Swept across all `.astro` / `.ts` / `.md` files in
  `src/` — titles, alt text, aria-labels, copyright, body copy.
- All em-dashes `—` swept to en-dashes `–` per Polish typographic
  convention (półpauza z odstępami). Affected: every `.astro` and `.md`
  surface with body copy.
- Homepage `<title>` rewritten from `"Strona Główna - Feel MySelf"` to
  `"Feel My Self – wyrażaj siebie bez ograniczeń"` — brand-led, en-dash,
  ready for SEO once `noindex` is lifted in Phase 3.
- Homepage meta description tightened.

### Changed — Homepage typography, CTAs, heading outline, footer hygiene

- **Body weight 200 → 400** in `global.css`. Was visibly too thin once
  Inter actually loaded; matches the live site. Line-height tightened
  from 1.68 to 1.6 in step.
- **Hero CTA** added — `Zobacz kosmetyki` primary button → `/sklep`.
  White button on dark hero, hover inverts to outlined.
- **Final CTA section** gets `Poznaj produkty` button → `/sklep`, which
  also visually separates it from the Minimalism section (they were
  reading as the same image-+-headline slide twice).
- **Heading outline fixed** — philosophy block heading was `<h3>`
  skipping a level from the hero `<h1>`; promoted to `<h2>` with
  matching `text-3xl sm:text-4xl` scale.
- **Logo-invert artefact dropped** — philosophy section was loading
  `logo-white.png` and CSS-inverting it on a white background. Replaced
  with the existing black logo asset directly. Cleaner edges.
- **Footer cleanup** — `About` column with English `Shipping / Terms /
  Policy` placeholders (`href="#"`) removed entirely. Live WP has no
  legal pages at these URLs either, so the port was carrying dead
  links. Footer now: Logo cluster / Nawigacja / Obserwuj (social).
  Adds back when real legal pages exist.
- **Polish hygiene** along the way — `Strona Główna` → `Strona główna`
  in footer nav (PL title-case rule); social `aria-label`s `Feel
  MySelf on YouTube/Instagram` → `na YouTube/Instagramie` (we're inside
  `<html lang="pl">`).

### Added — Mobile hamburger menu + on-site search

- `Header.astro` — on `<md` viewports the inline `Sklep / Blog` nav is
  hidden in favour of a hamburger `<details>` that drops a vertical
  menu below the header. Zero JS, matches the existing search
  disclosure pattern. Desktop chrome unchanged.
- `Nav.astro` — gains an `orientation?: 'horizontal' | 'vertical'`
  prop so the same component drives both the inline desktop nav and
  the stacked mobile drawer.
- **Search no longer teleports users to live prod.** Header search
  form action changed from `https://www.feelmyself.pl/?s=…` to
  `/sklep?s=…`.
- `/sklep` reads `?s=` and runs a small inline client-side filter
  over the product grid (matches against product name,
  case-insensitive). Renders a polite live status: `Wyniki dla „X" —
  N produktów.` or `Brak wyników dla „X".`
- `ProductCard.astro` — gains a `data-product-name` attribute hook
  for the filter.

### Changed — Product card + price typography unified

- `ProductCard.astro` — title was `font-bold` at inherited 16px; now
  `text-sm font-medium leading-snug` (14px / 500). Card title was
  fighting the page's body-200 + heading-800 system and reading too
  heavy. Wrapper margin trimmed from `mt-2` to `mt-1`.
- `PriceTag.astro` — gains a `size?: 'sm' | 'lg'` prop. Default `sm`
  renders `text-base font-medium` (cards) instead of the previous
  `text-2xl font-bold`. `lg` renders `text-2xl font-medium` for the
  product detail page so the price stays focal but stops shouting.
- `ProductLayout.astro` — passes `size="lg"` to PriceTag; H1 promoted
  from `font-bold` (700) to `font-extrabold` (800) so the page heading
  matches the rest of the site's heading system (set in `global.css`).

### Added — `/sklep` catalog page

- `src/pages/sklep.astro` — full product catalog. Solid header, "Sklep"
  H1 + manifesto subline, category chips (linking to `/[slug]` category
  pages via `categoryPath()`), then a 2/3/4-column responsive
  `ProductCard` grid mirroring `/[slug].astro`'s visual rhythm.
- Resolves the 404 the Nav has been pointing at since WS4. The
  Nav `/sklep` link is now live.
- Phase 1 noindex retained. WS5 work officially started.

### Fixed — Homepage audit top-3 fixes (fonts, hero perf, transparent-header contrast)

- **Inter font now actually loads.** The `@import` in `src/styles/global.css`
  was placed after `@theme` and got stripped by Tailwind v4 / Lightning CSS
  during compilation — the served bundle had zero font references, so the
  whole site was rendering in `system-ui`. Replaced with `<link rel="preconnect">`
  + stylesheet tags in `BaseLayout.astro` `<head>`. Verified Inter weights
  200/400/500/600/800 are now requested.
- **Hero PNGs converted to WebP** (`hero`, `minimalism-bg`, `cta-bg`).
  Total page-asset payload dropped from **1.13 MB → 230 KB** (~80% smaller,
  ~933 KB saved). q=82 visually lossless. Hero gets `fetchpriority="high"` —
  `Image.astro` now forwards that attribute. Source PNGs retained;
  `scripts/fetch-homepage-assets.mjs` regenerates the `.webp` variants
  via `cwebp` on every re-run so the two formats stay in sync.
- **Transparent header now contrasts against the hero.** When
  `transparent`, the header swaps to the local white logo
  (`/homepage/logo-white.png`) and adds `text-white` so the Nav links
  and search icon inherit white via `currentColor`. Previously the black
  logo + black-by-default nav rendered illegibly over the painterly hero.

Source: 4-agent UX/UI + design + frontend + copy audit run 2026-05-22.
Remaining audit findings (mobile menu, body weight 200, no CTAs, footer
About column English, etc.) tracked for the next pass.

### Changed — Header restructured to match live chrome pixel-perfectly

- 3-column grid: nav left (`Sklep` + `Blog`) / logo center (h-16, ~64px
  close to live's 75px) / search loupe right (live SVG geometry).
- Nav drops `Strona Główna` — logo is the home link, per live convention.
- Search loupe uses `<details>` to expand a text-input form on click
  (zero JS, native HTML). Form GETs to `https://www.feelmyself.pl/?s=…`.
- `Header.astro` accepts `transparent?: boolean`. When true, header is
  `position: absolute` over the page content with no background or
  border. Homepage passes it via the new `BaseLayout` prop
  `transparentHeader`. Other pages (product, blog, category) keep the
  solid white + border-bottom variant — no regressions.

### Added — Homepage live-design port (between WS4 and WS5)

- `scripts/fetch-homepage-assets.mjs` — one-shot Node script that
  downloads the live homepage's 6 brand assets into
  `public/homepage/`. Idempotent, re-runnable when live graphics
  change. Source-of-truth asset list lives in the script.
- `public/homepage/` — bundled imagery (hero, white logo,
  minimalism + CTA backgrounds, VegeZone + Superpharm partner logos).
- `src/pages/index.astro` — replaces the WS1 placeholder with a
  faithful 6-section port of www.feelmyself.pl: Hero → Brand
  philosophy → Featured products → Minimalism → Partners → Final CTA.
  Featured products use `fetchAllProducts()` and reuse the WS4
  `ProductCard`.
- `src/components/layout/Header.astro` — adds a plain-HTML search
  form that GETs to `https://www.feelmyself.pl/?s=…`. No JS.
- `src/components/layout/Footer.astro` — restructured to match live:
  logo cluster / Nawigacja / About (Shipping/Terms/Policy '#'
  placeholders mirroring live) + YouTube + Instagram inline-SVG
  icons / copyright row.
- `src/components/layout/Nav.astro` — reduced to `Strona Główna` +
  `Sklep` to match live header.

Spec: `docs/superpowers/specs/2026-05-18-homepage-live-design-port.md`.
Plan: `docs/superpowers/plans/2026-05-18-homepage-live-design-port.md`.

### Added — Workstream 4 (product / category integration)

- `src/lib/woo.ts` — typed Woo Store API client. 8 unit tests
  (mocked fetch) cover normalization, pagination short-circuit,
  full-page pagination, error throwing, Polish złoty formatting.
- `WOO_API_BASE` resolved via `import.meta.env` (Astro's canonical
  env-var path; CF Pages Production env var set to www.feelmyself.pl).
- Product UI: PriceTag (sale-discount strikethrough), BuyButton
  (deep-links to live Woo permalink with target=_self;
  "Niedostępny" ghost-disabled when out of stock), ProductCard
  (square image with light-gray bg fill + title + price),
  ProductGallery (main + thumbnail grid, no JS lightbox in P1).
- ProductLayout (gallery left, title+price+description+BuyButton
  right). Canonical points at the live Woo permalink (so staging
  doesn't compete with prod in Google's index).
- `/produkt/[slug]` route — 5 product pages generated from live
  Woo Store API at build time.
- `/[slug]` (root-level) route — 1 category page generated
  (`/kosmetyki/` per the live URL pattern).

### Phase 1 URL plan adjustment

The plan assumed category URLs at `/kategoria-produktu/<slug>/`
(default Woo). Live site has customized to `/<slug>/` (e.g.
`/kosmetyki/`). Verified via `curl -I` — the default path 404s.
Astro route moved from `/src/pages/kategoria-produktu/[slug].astro`
to `/src/pages/[slug].astro`. URL preservation intent is unchanged
(staging URLs match what Google has indexed for prod).

### Added — Workstream 3 (blog UI shell, no migration)

- Blog content collection schema at `src/content.config.ts` using
  Astro 6's `glob()` loader. Schema covers what a future migration
  script would produce (title, slug, date, excerpt, featuredImage,
  categories, tags, locale, SEO overrides, draft flag).
- Blog UI components: PostCard (image + title + excerpt + date),
  PostMeta (date + updated + categories chips), PostBody (Tailwind
  Typography prose wrapper).
- Tailwind Typography plugin via `@plugin` directive in `global.css`
  (Tailwind v4 plugin loading).
- BlogPostLayout (hero featured image + title + meta + body slot,
  canonical to www.feelmyself.pl/blog/<slug>).
- `/blog` index page — grid of PostCards or Polish empty state
  (`Wkrótce pojawią się tu pierwsze wpisy.`).
- `/blog/[slug]` dynamic route via getStaticPaths (generates 0 pages
  currently since 0 posts).
- `zod` installed directly (replacing the deprecated `astro:content`
  re-export).

### Skipped in WS3 (live site has 0 posts)

- WP→Markdown migration script (Tasks 3.2, 3.3, 3.4 in plan).
  Deferred until the first post is published. The schema in
  `content.config.ts` is the contract any future migration must
  satisfy.

### Added — Workstream 2 (design system + primitives + layout)

- Design tokens audit at `reference/design-tokens.md`. Brand chrome is
  monochromatic (black/white/mid-gray) — the chrome is the *frame*
  for full-color imagery to dominate. Imagery audit captures the
  saturated painterly hero artwork, hand-scripted "feel MY SELF" logo,
  and rainbow/Pride heart sub-mark with "FOR EVERYONE, EVERY DAY"
  inclusivity messaging.
- Tailwind v4 `@theme {}` tokens in `src/styles/global.css`:
  `--color-brand-primary` (#212121), `--color-brand-secondary`
  (#757575), `--color-muted` (#666666), `--color-card` (#f5f5f5),
  `--color-divider` (#dddddd), `--font-sans` (Inter), card shadows.
- Inter font from Google Fonts CDN; base typography (body weight 200,
  headings weight 800, line-height 1.68 / 1.2) in `@layer base`.
- Primitive components: Button (variant × size), Container (size
  variants, responsive padding), Link (auto-external detection).
- Image abstraction: `src/lib/images.ts` `resolveImageUrl()` +
  `remarkResolveImages` plugin (wired into `astro.config.mjs`
  `markdown.remarkPlugins`). 7 unit tests cover the URL
  normalization paths. `<Image>` primitive uses it.
- Layout components: Header (real primary logo, eager-loaded, Nav
  to right), Nav (PL 3-item menu matching live: Strona główna /
  Sklep / Blog), Footer (3-column with logo block + Pride heart
  sub-mark + nav + © auto-year).
- BaseLayout updated to flex-col `min-h-screen`, Header/Footer
  wrap `<main>`, `bareLayout` escape hatch for special pages.

### Plan deviations during WS2

- **Botiga theme source NOT extracted via SSH** — `claude` user not
  yet provisioned on `.159` per devops `SETUP-GUIDE.md`. Decision
  (2026-05-02): rely on wget mirror of rendered HTML/CSS for the audit
  rather than provision Claude on .159 mid-task. Botiga's customizer
  CSS gave us 100% of the chrome tokens; theme source would have been
  reference noise. If future audits need it, provision Claude on .159
  per `feedback/server-safety` rules first.
- **No browser-devtools manual audit step** — Botiga's
  customizer-generated CSS at
  `https://www.feelmyself.pl/wp-content/uploads/botiga/custom-styles.css`
  exports every token as a CSS variable (`--bt-color-*`,
  `--bt-font-size-*`, etc.). Direct extraction was higher fidelity
  than getComputedStyle in devtools.
- **Tailwind v4 `@theme` block** instead of v3 JS config (already noted
  in WS1 changelog — confirmed working in WS2).

### Site reconnaissance findings

- **Canonical domain is `www.feelmyself.pl`**, not the apex —
  `feelmyself.pl/` 301-redirects. Astro `site` config + CI workflow
  `WOO_API_BASE` updated. Cloudflare Pages `WOO_API_BASE` env var
  needs the same update in the dashboard (action item for Blazej).
- **0 blog posts** — Workstream 3's WP→MD migration is effectively a
  no-op. We still build the blog UI components and routes (empty
  state) so adding posts later is friction-free.
- **5 products in 1 category** — Workstream 4 trivial.
- **6 pages total**, but 3 are commerce (cart / checkout / my account
  — Phase 2). Real content surfaces are home / sklep / blog only —
  no separate about/contact/terms pages on the live site. Footer
  "About" widget on the live site has placeholder `href="#"` links
  not actually wired up.
- **Brand identity carried by imagery, not chrome** — saturated
  painterly hero artwork (Midjourney-generated style), hand-scripted
  logo, rainbow Pride heart sub-mark. UI chrome stays monochrome to
  let imagery dominate.

### Added — Workstream 1 (scaffold + deploy)

- Initial repo scaffolding (git init).
- Phase 1 (Astro port) design spec at
  `docs/superpowers/specs/2026-05-02-phase-1-astro-port-design.md`.
- Phase 1 implementation plan at
  `docs/superpowers/plans/2026-05-02-feelmyself-phase-1-astro-port.md`.
- Astro 6.x scaffold (TypeScript strict).
- Astro config (`astro.config.mjs`): `output: 'static'`, site URL set to
  prod (`https://feelmyself.pl`), i18n with `pl` default and no URL
  prefix, `trailingSlash: 'never'`.
- Tailwind CSS v4 via `@tailwindcss/vite` (CSS-first config in
  `src/styles/global.css`). Tokens populated in Workstream 2.
- Vitest + `@astrojs/check` wired up; `npm run test` and
  `npm run typecheck` both green; smoke test passes.
- `BaseLayout.astro` with `title` / `description` / `canonical` /
  `noindex` props, `<html lang="pl">`, viewport meta, generator meta,
  conditional description and robots, favicon link.
- Placeholder `index.astro` using `BaseLayout` (full content lands in
  Workstream 5).
- `public/robots.txt` (`User-agent: *` / `Disallow: /`) — see Known
  issues below regarding Cloudflare's zone-level managed content.
- GitHub Actions:
  - `ci.yml` — typecheck + test + build on PRs and `main` push,
    Node 22, 10-min timeout.
  - `refresh-content.yml` — nightly cron + manual `workflow_dispatch`
    that POSTs to the Cloudflare Pages deploy hook.
- Cloudflare Pages project `feelmyself-stage` connected to
  `b1azk0/FeelMySelf` via GitHub App; `main` deploys to
  `https://stage.feelmyself.pl/`; PR previews enabled.
- GitHub repo secret `CF_DEPLOY_HOOK_URL` configured.
- End-to-end verified: manual workflow trigger → HTTP 200 from CF →
  Pages rebuild → `https://stage.feelmyself.pl/` serves the placeholder
  with `<title>FeelMySelf — Astro staging</title>`, canonical link to
  prod URL, and `noindex,nofollow` meta.

### Plan deviations recorded during execution

- **Tailwind v4** (not v3 as the plan assumed) — `npx astro add tailwind`
  on Astro 6.x installs `@tailwindcss/vite` + `tailwindcss@^4.x` with
  CSS-first config, no `tailwind.config.mjs`. Workstream 2 token
  population will use `@theme {}` blocks inside `global.css` rather
  than a JS config file.
- **Node 22, not Node 20** — Astro 6's `engines.node` requires
  `>=22.12.0`. CI workflow updated; Cloudflare Pages `NODE_VERSION`
  env var set to `22`.

### Known issues

- **`robots.txt` partially overridden by Cloudflare Content Signals**:
  the `feelmyself.pl` zone has CF's "Managed Content / AI Audit"
  feature enabled, which prepends an AI-bot block list and a
  `User-agent: * / Allow: /` rule above our `Disallow: /`. Per Google's
  robots spec, equally-specific rules resolve to least-restrictive,
  meaning Googlebot might not honor our staging-block. Mitigation: the
  `<meta name="robots" content="noindex,nofollow">` in `BaseLayout`
  (every staging page emits it) is honored by all major search engines
  and prevents indexing. Decision deferred — fixing requires a
  zone-level CF setting change that also affects live `feelmyself.pl`.
