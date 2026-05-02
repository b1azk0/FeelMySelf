# FeelMySelf Design Tokens (Phase 1 Audit)

Source: `https://www.feelmyself.pl/wp-content/uploads/botiga/custom-styles.css`
Extracted on 2026-05-02 by parsing Botiga Pro's customizer-generated CSS.

This file is the authoritative input for `@theme {}` block in
`src/styles/global.css` (Tailwind v4 CSS-first config).

## Brand identity

The brand is **monochromatic** — black text and accents on white, with
mid-gray as the only accent. There is no "brand color" in the typical
sense: the whole UI uses `#212121` (near-black) as both the text color
and the primary action color.

## Colors

| Token | Hex | Botiga var | Usage |
|---|---|---|---|
| `--color-brand-primary` | `#212121` | `--bt-color-button-bg`, `--bt-color-link-default` | Buttons, links, primary text |
| `--color-brand-secondary` | `#757575` | `--bt-color-button-bg-hover`, `--bt-color-link-hover` | Hover state on buttons and links |
| `--color-text` | `#212121` | `--bt-color-body-text` | Default text color |
| `--color-text-muted` | `#666666` | `--bt-color-post-meta` | Captions, metadata, dates |
| `--color-card-bg` | `#f5f5f5` | `--bt-color-content-cards-bg` | Card backgrounds |
| `--color-border` | `#dddddd` | `--bt-color-forms-dividers` | Dividers, form borders, card borders |
| `--color-bg` | `#ffffff` | `--bt-color-bg`, `--bt-color-menu-bg` | Page and menu backgrounds |
| `--color-button` | `#ffffff` | `--bt-color-button` | Button text (on dark button bg) |

## Typography

**Font family:** `Inter` (sans-serif fallback). Currently locally hosted
via a WP plugin that caches Google Fonts. We'll use Google Fonts CDN in
Phase 1 (`@import url("https://fonts.googleapis.com/...")`); Phase 3
will optimize/self-host.

**Weights used:**
- Body: **200** (extra-light) — unusual choice; very airy
- Headings (h1–h6, `.site-title`): **800** (extra-bold)
- Navigation: 200

**Type scale (responsive — three sizes per token: mobile / tablet / desktop):**

| Token | Mobile | Tablet | Desktop |
|---|---|---|---|
| h1 | 32px | 42px | 64px |
| h2 | 24px | 32px | 56px |
| h3 | 20px | 24px | 32px |
| h4 | 16px | 18px | 24px |
| h5 | 16px | 18px | (—) |
| h6 | 16px | (—) | (—) |
| body | 16px | (constant) | |
| button | 14px | (constant) | |
| footer-widgets-title | 20px | (constant) | |

**Line heights:**
- Body: `1.68`
- Headings: `1.2`

**Other:**
- `text-transform: none` (no uppercase headings)
- `letter-spacing: 0`
- `font-style: normal`

## Buttons

- `border-radius: 0` (sharp corners)
- `border-width: 0` (no border in default state)
- Background: `#212121` → `#757575` on hover
- Text: `#ffffff` → `#ffffff` on hover (no change)
- Font size: 14px

## Spacing & breakpoints

Use Tailwind v4 defaults — Botiga uses standard 4/8/16/24/32/64
multiples consistent with Tailwind's spacing scale. No deviations
detected.

Breakpoints (Tailwind defaults match Botiga's responsive tiers):
- `sm: 640px`
- `md: 768px`
- `lg: 1024px`
- `xl: 1280px`

## Shadows

Not heavily used. Cards rely on `--color-card-bg` (light gray) for
visual separation rather than shadow. Define minimal shadow tokens for
discretionary use:

- `shadow-card: 0 1px 3px rgba(0,0,0,.06)`
- `shadow-card-hover: 0 4px 12px rgba(0,0,0,.10)`

## What's NOT in the brand

- **No accent colors** — the Gutenberg-default colors (`#0693e3` blue,
  `#00d084` green, etc.) appear only in `<style>` blocks injected by
  Gutenberg blocks; they are NOT used in actual content. Ignore them
  during component construction.
- **No gradients** — all backgrounds are flat fills.
- **No rounded corners** — `border-radius: 0` is the brand stance.
- **No drop shadows on text or icons** — flat aesthetic throughout.

## Translation to Tailwind v4 `@theme`

(Goes into `src/styles/global.css` — see Task 2.4)

```css
@theme {
  /* Colors */
  --color-brand-primary: #212121;
  --color-brand-secondary: #757575;
  --color-text: #212121;
  --color-text-muted: #666666;
  --color-card: #f5f5f5;
  --color-border-default: #dddddd;
  --color-button-fg: #ffffff;
  /* white/black are Tailwind defaults */

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-weight-body: 200;
  --font-weight-heading: 800;

  /* Custom shadows (sparingly used) */
  --shadow-card: 0 1px 3px rgba(0,0,0,.06);
  --shadow-card-hover: 0 4px 12px rgba(0,0,0,.10);

  /* Border radius — brand uses 0 by default; Tailwind's defaults
     remain available via utilities (rounded-sm/md/etc.) for
     edge cases */
}
```

H1/H2 desktop sizes (64/56px) map to Tailwind's `text-6xl` (60px) and
`text-5xl` (48px) close-enough; we'll use those by default and override
inline if exact 64/56 matters.

## Open questions

- **None for Phase 1.** Brand identity is fully captured by Botiga's
  customizer output. If anything looks off in side-by-side review, we
  iterate.
