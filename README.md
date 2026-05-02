# FeelMySelf

Astro port of [feelmyself.pl](https://feelmyself.pl) — a WooCommerce shop
currently running on WordPress (Botiga Pro theme on Hetzner).

## Status

**Phase 1 — Design approved, awaiting implementation plan.**

The migration is staged in three phases:

1. **Phase 1** — Visual port to Astro, deployed to `stage.feelmyself.pl`.
   Marketing pages, blog, read-only product/category pages with deep-links
   to live Woo for purchases.
2. **Phase 2** — Real ecommerce (Astro-native vs headless Woo TBD).
3. **Phase 3** — SEO / GEO / AEO optimization, Core Web Vitals,
   Cloudflare R2 + Images.

## Documents

- Phase 1 design spec:
  [`docs/superpowers/specs/2026-05-02-phase-1-astro-port-design.md`](docs/superpowers/specs/2026-05-02-phase-1-astro-port-design.md)
- Implementation plan: _(pending)_

## Repo conventions

See [`CHANGELOG.md`](CHANGELOG.md) for change history. Global engineering
practices live in `~/GitHub/ClaudioBrain/` (project author's private
knowledge base).
