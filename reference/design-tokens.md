# FeelMySelf Design Tokens (Phase 1 Audit)

Source: `https://www.feelmyself.pl/wp-content/uploads/botiga/custom-styles.css`
Extracted on 2026-05-02 by parsing Botiga Pro's customizer-generated CSS.

This file is the authoritative input for `@theme {}` block in
`src/styles/global.css` (Tailwind v4 CSS-first config).

## Brand identity

**Important reframe:** The Botiga customizer tokens describe the UI
*chrome* (buttons, borders, text), which is monochromatic by design.
The actual brand identity is carried by the **imagery** — saturated,
painterly hero artwork and the logo system. The monochrome chrome is
the *frame* that lets imagery dominate. See "Imagery & Logo System"
below.

UI chrome only: black text and accents on white, mid-gray hover state.
No "brand color" in the chrome — `#212121` (near-black) serves as text,
heading, button, and link color simultaneously.

## Imagery & Logo System

### Logo system

| Asset | URL (proxied via `<Image>`) | Role | Aspect |
|---|---|---|---|
| Primary logo (black) | `/wp-content/uploads/2025/08/Feel-My-Self_black_transparent.png` | Header, footer, light backgrounds | ~1.07:1 (square-ish) |
| Primary logo (white) | `/wp-content/uploads/2025/08/Feel-My-Self_white_transparent.png` | Dark backgrounds, photo overlays | same |
| Heart sub-mark (rainbow + "FOR EVERYONE, EVERY DAY") | `/wp-content/uploads/2025/08/logo-serce_black_transparent_border.png` | Brand identity / inclusivity callout | ~1.24:1 |

**Primary logo composition:** "feel" hand-scripted in cursive (with a
heart-shaped dot/stroke ending) over stacked "MY SELF" in industrial
sans-serif caps. Tension between handcraft (script) and clean
modernism (caps) — friendly + polished.

**Heart sub-mark composition:** Hand-drawn rainbow/Pride heart with
thick black outline, "FOR EVERYONE, EVERY DAY" curved around the
bottom. **Inclusivity / Pride is core brand positioning, not
decoration.** This shows up in body messaging too.

### Photography / illustration style

The hero/marketing graphics are **saturated, painterly, AI-art
aesthetic** with bold color blocking and overlapping geometric shapes.

Reference: `FeelMySelf-Hero-Banner.png` (1456×816, 16:9) — magenta +
orange + teal color blocking; overlapping sun/moon circles; coastal
landscape with cliffs; tiny human figures for scale and emotional
intimacy. Bold, joyful, sensual.

Reference: `FeelMySelf-HomeLP-Graphic-3.png` (1456×816) — same color
language and composition style as the hero. Sister artwork.

Reference: `u1515132492_Make_only_backgrounds...` — explicit Midjourney
output (visible in filename UUID). Used as a section background.

**Style notes:**
- 16:9 aspect ratio for full-width banners
- Saturated palette: magenta (~#E91E80), orange (~#FF6B47), teal
  (~#2A8FA8), white space — but these are *image* colors, not UI
  tokens. They appear only inside imagery.
- Painterly/AI-illustration over photography — no traditional product
  photography for hero/lifestyle
- Color blocking and shape overlap as composition device
- Human figures rendered small, ambient — not portrait-focused

### Product photography style

Different from hero/lifestyle: product shots are clean, centered,
square (1000×1000), white or light-gray background — standard
e-commerce product photography. Lets the bottle/jar shape carry visual
weight.

### Implication for Phase 1 components

- **Hero / banner sections:** full-bleed, 16:9, image dominates;
  overlay text minimal; chrome (CTA buttons) sits at bottom-left or
  bottom-right with white-on-image styling
- **Product cards:** square aspect ratio (1:1), white/light-gray
  background, generous padding around the product to let it breathe
- **Logo placement (Header):** primary black logo on white nav, sized
  generously — this IS the brand mark, not a small icon
- **Inclusivity / heart sub-mark:** worth surfacing in the footer or
  about section; not Phase 1 priority but should be designed for in
  Workstream 5 homepage composition

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
