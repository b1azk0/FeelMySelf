# Changelog

All notable changes to the FeelMySelf project are documented here.

## [Unreleased]

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
