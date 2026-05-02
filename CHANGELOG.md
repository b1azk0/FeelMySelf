# Changelog

All notable changes to the FeelMySelf project are documented here.

## [Unreleased]

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
