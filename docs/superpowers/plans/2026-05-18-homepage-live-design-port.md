# Homepage Live-Design Port — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the WS1 placeholder `src/pages/index.astro` with a faithful port of the live `www.feelmyself.pl` homepage; sync `Header` and `Footer` to live; bundle the homepage imagery locally.

**Architecture:** Single `index.astro` with 6 inline sections (Hero → Brand philosophy → Featured products → Minimalism → Partners → Final CTA), all rendered inside the existing `BaseLayout` (which provides Header + Footer chrome). Header/Footer are surgical edits to the WS2 files. Imagery is downloaded once by a Node script and committed to `public/homepage/`. No new dependencies, no JS frameworks, no new tests.

**Tech Stack:** Astro 6 SSG, Tailwind v4 (CSS-first `@theme`), Inter font, Node 22, existing `src/lib/woo.ts` for product data.

**Spec:** `docs/superpowers/specs/2026-05-18-homepage-live-design-port.md`

**Deviation from spec (one):** Assets land in `public/homepage/` (not `src/assets/homepage/` as the spec says). Reason: our existing `<Image>` primitive resolves relative paths through `resolveImageUrl()`, which expects `public/`-style absolute paths or full URLs — it has no `src/assets/` import path. `public/homepage/` works trivially with no plumbing changes and matches the existing favicon/robots pattern in `public/`. Phase 3 owns image optimization regardless of source dir.

---

## Reference: exact copy and assets harvested from live (2026-05-18)

These are lifted verbatim from `https://www.feelmyself.pl/` HTML (not paraphrased). Use exactly as shown.

**Page `<title>`:** `Strona Główna - Feel MySelf`
**Meta description:** `Feel MySelf – Wyrażaj siebie bez ograniczeń. Kosmetyki dla każdego`

**Hero (H1 + lead):**
- H1: `Wyrażaj siebie. Zadbaj o siebie. Bez kompromisów.`
- Lead: `Nie dzielimy ludzi na kategorie. Tworzymy skuteczne, naturalne formuły, które służą wszystkim — niezależnie od tożsamości, wieku czy wyglądu.`

**Brand philosophy (white logo above H3 + body):**
- H3: `Kosmetyki Feel My Self`
- Body: `Feel My Self to więcej niż marka – to manifest wolności, autentyczności i samoakceptacji. Tworzymy kosmetyki i produkty do pielęgnacji dla wszystkich, bez wyjątków. Dla tych, którzy nie boją się być sobą, którzy wierzą, że piękno to nie schemat, lecz odwaga do wyrażania siebie na własnych zasadach.`

**Featured products** — 5 products pulled from `fetchAllProducts()`. Display order on live (alt text):
1. Oczyszczająco-balansujący szampon do włosów, 250 ml
2. Pobudzający żel do mycia ciała z naturalnymi olejkami, 250 ml
3. Olejek regenerujący do ciała i masażu, 150 ml
4. Aksamitnie regenerujący krem do stóp z mocznikiem, 100 ml
5. Rozświetlający krem BB, 30 ml

Slugs in the live URLs (verify by visiting `/produkt/<slug>` on live if order matters):
- `feel-my-hair-purity-balance-shampoo`
- `feel-my-body-energy-boost-shower-gel`
- `feel-my-skin-renewal-body-massage-oil`
- `feel-my-feet-velvet-repair-urea-cream`
- `feel-my-face-perfect-glow-bb`

`fetchAllProducts()` returns by `date desc`. The plan code uses the returned order as-is; if Blazej requires the exact live order during visual review, add an explicit `slugOrder` sort in Task 5.

**Minimalism (H2 + body):**
- H2: `Minimalizm, który działa. Jeden produkt. Wiele potrzeb.`
- Body: `Wierzymy, że skuteczna pielęgnacja nie potrzebuje dziesiątek kosmetyków. Tworzymy uniwersalne formuły, które dbają o Twoją skórę — bez zbędnych warstw.`

**Partners (H2 + body + 2 logos):**
- H2: `Nasi partnerzy`
- Body: `Kosmetyki Feel My Self znajdziesz w dobrych drogeriach oraz w sklepach partnerskich`
- Logos: VegeZone (`https://vegezone.pl`), Superpharm (`https://www.superpharm.pl`)

**Final CTA (H2 + body):**
- H2: `Poczuj siebie. Każdego dnia. Bez wyjątków.`
- Body: `Feel My Self to przestrzeń, w której nie musisz nikogo udawać. Naturalne kosmetyki, które wspierają Twoją codzienność — taką, jaką jest.`

**Header nav (exact):**
- `Strona Główna` → `/`
- `Sklep` → `/sklep`

**Footer columns (exact on live):**
- `Nawigacja` (H2): `Strona Główna` → `/`, `Blog` → `/blog/`, `Sklep` → `/sklep/`
- `About` (H2 — note the English label on live): `Shipping`, `Terms`, `Policy` — all `href="#"` on live (broken/placeholder). We mirror exactly: same labels, same `#` hrefs. Real legal pages land in a later workstream.
- Social: `https://www.youtube.com/@FeelMySelf.beauty`, `https://www.instagram.com/feel.my.self.beauty/`
- Copyright row: `© 2026 Feel MySelf` (we keep our existing `Wszystkie prawa zastrzeżone.` suffix — minor enrichment, harmless)

**Image asset URLs (live → local filename):**
| Live URL | Local path | Used by |
|---|---|---|
| `https://www.feelmyself.pl/wp-content/uploads/2025/08/FeelMySelf-Hero-Banner.png` | `public/homepage/hero.png` | Hero section background |
| `https://www.feelmyself.pl/wp-content/uploads/2025/08/Feel-My-Self_white_transparent.png` | `public/homepage/logo-white.png` | Brand philosophy section |
| `https://www.feelmyself.pl/wp-content/uploads/2025/08/FeelMySelf-HomeLP-Graphic-3.png` | `public/homepage/minimalism-bg.png` | Minimalism section background |
| `https://www.feelmyself.pl/wp-content/uploads/2025/08/u1515132492_Make_only_backgrounds_with_not_products_or_writin_da661f2a-4ff9-4c09-96bb-17c04cf92282_0.png` | `public/homepage/cta-bg.png` | Final CTA section background |
| `https://www.feelmyself.pl/wp-content/uploads/2025/08/vegezonepl-logo-15556245141-1.webp` | `public/homepage/partner-vegezone.webp` | Partners section |
| `https://www.feelmyself.pl/wp-content/uploads/2025/08/superpharm.png` | `public/homepage/partner-superpharm.png` | Partners section |

---

## Task 1: Asset fetcher script + download

**Files:**
- Create: `scripts/fetch-homepage-assets.mjs`
- Create: `public/homepage/.gitkeep` (then populated by script)
- Modify: none

- [ ] **Step 1.1: Create the scripts directory and the asset script**

Create `scripts/fetch-homepage-assets.mjs`:

```javascript
#!/usr/bin/env node
// One-shot script: downloads the live homepage's bundled imagery
// into public/homepage/. Idempotent — re-run safely. Source-of-truth
// for the asset list is this file; update the ASSETS array if live
// gains/changes graphics.

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'homepage');

const ASSETS = [
  { url: 'https://www.feelmyself.pl/wp-content/uploads/2025/08/FeelMySelf-Hero-Banner.png',                       file: 'hero.png' },
  { url: 'https://www.feelmyself.pl/wp-content/uploads/2025/08/Feel-My-Self_white_transparent.png',                file: 'logo-white.png' },
  { url: 'https://www.feelmyself.pl/wp-content/uploads/2025/08/FeelMySelf-HomeLP-Graphic-3.png',                   file: 'minimalism-bg.png' },
  { url: 'https://www.feelmyself.pl/wp-content/uploads/2025/08/u1515132492_Make_only_backgrounds_with_not_products_or_writin_da661f2a-4ff9-4c09-96bb-17c04cf92282_0.png', file: 'cta-bg.png' },
  { url: 'https://www.feelmyself.pl/wp-content/uploads/2025/08/vegezonepl-logo-15556245141-1.webp',                file: 'partner-vegezone.webp' },
  { url: 'https://www.feelmyself.pl/wp-content/uploads/2025/08/superpharm.png',                                    file: 'partner-superpharm.png' },
];

await mkdir(OUT_DIR, { recursive: true });

let failures = 0;
for (const { url, file } of ASSETS) {
  const dest = join(OUT_DIR, file);
  process.stdout.write(`→ ${file}  `);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'feelmyself-asset-sync/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    console.log(`ok (${buf.length.toLocaleString()} B)`);
  } catch (err) {
    failures++;
    console.log(`FAIL — ${err.message}`);
  }
}

if (failures) {
  console.error(`\n${failures}/${ASSETS.length} asset(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${ASSETS.length} assets written to ${OUT_DIR}`);
```

- [ ] **Step 1.2: Create the public/homepage/ directory placeholder**

Run:
```bash
mkdir -p public/homepage && touch public/homepage/.gitkeep
```

- [ ] **Step 1.3: Run the script**

Run:
```bash
node scripts/fetch-homepage-assets.mjs
```

Expected output: 6 `ok (...B)` lines, then `All 6 assets written to .../public/homepage`. Each file should be 50KB–2MB.

- [ ] **Step 1.4: Verify the downloaded files exist**

Run:
```bash
ls -lh public/homepage/
```

Expected: 7 entries — `.gitkeep` plus 6 image files (hero.png, logo-white.png, minimalism-bg.png, cta-bg.png, partner-vegezone.webp, partner-superpharm.png).

- [ ] **Step 1.5: Commit**

```bash
git add scripts/fetch-homepage-assets.mjs public/homepage/
git commit -m "feat(homepage): asset fetcher script + bundled homepage imagery

Downloads 6 brand assets from live wp-content/uploads/ into
public/homepage/ for the homepage port. Script is idempotent;
re-run when live graphics change.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Update Nav to match live (2 items, drop Blog from header)

**Files:**
- Modify: `src/components/layout/Nav.astro` (currently 17 lines)

- [ ] **Step 2.1: Reduce nav links to {Strona Główna, Sklep}**

Replace the entire contents of `src/components/layout/Nav.astro` with:

```astro
---
const links = [
  { href: '/', label: 'Strona Główna' },
  { href: '/sklep', label: 'Sklep' },
];
---
<nav class="flex items-center gap-6" aria-label="Główna nawigacja">
  {links.map((l) => (
    <a
      href={l.href}
      class="text-brand-primary hover:text-brand-secondary transition-colors text-sm font-medium"
    >
      {l.label}
    </a>
  ))}
</nav>
```

Changes from current: removed the `Blog` entry; capitalized `Główna` to match live (`Strona Główna` not `Strona główna`).

- [ ] **Step 2.2: Typecheck**

Run:
```bash
npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 2.3: Commit**

```bash
git add src/components/layout/Nav.astro
git commit -m "feat(nav): match live homepage chrome (Strona Główna + Sklep only)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Add search input to Header

**Files:**
- Modify: `src/components/layout/Header.astro` (currently 23 lines)

- [ ] **Step 3.1: Add the search form alongside Nav**

Replace the entire contents of `src/components/layout/Header.astro` with:

```astro
---
import Container from '../primitives/Container.astro';
import Image from '../primitives/Image.astro';
import Nav from './Nav.astro';
---
<header class="border-b border-divider bg-white">
  <Container>
    <div class="flex items-center justify-between gap-6 py-4">
      <a href="/" aria-label="Feel MySelf — strona główna" class="block shrink-0">
        <Image
          src="https://www.feelmyself.pl/wp-content/uploads/2025/08/Feel-My-Self_black_transparent.png"
          alt="Feel MySelf"
          width={120}
          height={112}
          loading="eager"
          class="h-12 w-auto"
        />
      </a>
      <div class="flex items-center gap-6">
        <Nav />
        <form
          action="https://www.feelmyself.pl/"
          method="get"
          role="search"
          class="hidden sm:flex items-center"
        >
          <label class="sr-only" for="site-search">Szukaj</label>
          <input
            id="site-search"
            type="search"
            name="s"
            placeholder="Szukaj…"
            class="border border-divider px-3 py-1.5 text-sm focus:outline-none focus:border-brand-primary"
          />
        </form>
      </div>
    </div>
  </Container>
</header>
```

Changes from current: added `gap-6` to the flex row, added `shrink-0` on the logo link, added the search `<form>` that GETs to live Woo with `?s=...`. Hidden on `<sm` viewports (mobile-friendly — live also collapses search into the mobile menu, but Phase 1 ships without a true mobile menu rebuild).

- [ ] **Step 3.2: Typecheck + run dev server briefly**

Run:
```bash
npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3.3: Commit**

```bash
git add src/components/layout/Header.astro
git commit -m "feat(header): add search input deep-linking to live Woo

Plain HTML form, GET to https://www.feelmyself.pl/?s=… — no JS.
Hidden on mobile viewports (revisit when mobile menu redesign lands).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Rewrite Footer to match live (Nawigacja + About + Social + copyright)

**Files:**
- Modify: `src/components/layout/Footer.astro` (currently 58 lines)

- [ ] **Step 4.1: Replace Footer contents**

Replace the entire contents of `src/components/layout/Footer.astro` with:

```astro
---
import Container from '../primitives/Container.astro';
import Image from '../primitives/Image.astro';

const year = new Date().getFullYear();

const navLinks = [
  { href: '/', label: 'Strona Główna' },
  { href: '/blog', label: 'Blog' },
  { href: '/sklep', label: 'Sklep' },
];

const aboutLinks = [
  { href: '#', label: 'Shipping' },
  { href: '#', label: 'Terms' },
  { href: '#', label: 'Policy' },
];
---
<footer class="border-t border-divider bg-white mt-16">
  <Container>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">

      <div class="flex items-start gap-4">
        <Image
          src="https://www.feelmyself.pl/wp-content/uploads/2025/08/Feel-My-Self_black_transparent.png"
          alt="Feel MySelf"
          width={100}
          height={93}
          class="h-20 w-auto"
        />
        <Image
          src="https://www.feelmyself.pl/wp-content/uploads/2025/08/logo-serce_black_transparent_border.png"
          alt="For everyone, every day"
          width={100}
          height={81}
          class="h-20 w-auto"
        />
      </div>

      <div>
        <h2 class="text-sm font-semibold uppercase tracking-wide mb-4">Nawigacja</h2>
        <ul class="space-y-2">
          {navLinks.map((l) => (
            <li>
              <a href={l.href} class="text-sm hover:text-brand-secondary transition-colors">{l.label}</a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 class="text-sm font-semibold uppercase tracking-wide mb-4">About</h2>
        <ul class="space-y-2 mb-6">
          {aboutLinks.map((l) => (
            <li>
              <a href={l.href} class="text-sm hover:text-brand-secondary transition-colors">{l.label}</a>
            </li>
          ))}
        </ul>
        <div class="flex items-center gap-4">
          <a
            href="https://www.youtube.com/@FeelMySelf.beauty"
            aria-label="Feel MySelf on YouTube"
            class="text-brand-primary hover:text-brand-secondary transition-colors"
            target="_blank"
            rel="noopener"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.546 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
          <a
            href="https://www.instagram.com/feel.my.self.beauty/"
            aria-label="Feel MySelf on Instagram"
            class="text-brand-primary hover:text-brand-secondary transition-colors"
            target="_blank"
            rel="noopener"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.775.13 4.602.398 3.635 1.366 2.668 2.333 2.4 3.506 2.342 4.783.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.058 1.277.326 2.45 1.294 3.417.967.967 2.14 1.236 3.417 1.294C8.332 21.986 8.741 22 12 22s3.668-.014 4.948-.072c1.277-.058 2.45-.326 3.417-1.294.967-.967 1.236-2.14 1.294-3.417.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.668-.072-4.948-.058-1.277-.326-2.45-1.294-3.417C19.398.398 18.225.13 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
            </svg>
          </a>
        </div>
      </div>

    </div>

    <div class="border-t border-divider py-6 text-sm text-muted">
      <p>© {year} Feel MySelf. Wszystkie prawa zastrzeżone.</p>
    </div>
  </Container>
</footer>
```

Changes from current: third column was "Kontakt" with a single tagline; it becomes "About" with the 3 legal-placeholder links + YouTube/Instagram SVG icons. The logo cluster (column 1) and Nawigacja (column 2) keep their existing markup; navLinks order is updated to match live (Home / Blog / Sklep). No new dependency for icons — inline SVG from the YouTube and Instagram brand glyphs.

- [ ] **Step 4.2: Typecheck**

Run:
```bash
npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 4.3: Commit**

```bash
git add src/components/layout/Footer.astro
git commit -m "feat(footer): match live homepage (Nawigacja + About + Social + ©)

Three columns + copyright row matching live www.feelmyself.pl.
About column mirrors live's broken Shipping/Terms/Policy '#' links
exactly (real legal pages land later). Inline-SVG YouTube + Instagram
icons, no new icon dependency.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Rewrite the homepage with the 6 sections

**Files:**
- Modify: `src/pages/index.astro` (currently 13-line WS1 placeholder)

- [ ] **Step 5.1: Replace `src/pages/index.astro` contents**

Replace the entire contents of `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Container from '../components/primitives/Container.astro';
import Image from '../components/primitives/Image.astro';
import ProductCard from '../components/product/ProductCard.astro';
import { fetchAllProducts } from '../lib/woo';

const products = await fetchAllProducts();
---
<BaseLayout
  title="Strona Główna - Feel MySelf"
  description="Feel MySelf – Wyrażaj siebie bez ograniczeń. Kosmetyki dla każdego"
  noindex
>

  <!-- 1. Hero -->
  <section class="relative isolate flex items-center justify-center min-h-[80vh] overflow-hidden">
    <img
      src="/homepage/hero.png"
      alt=""
      class="absolute inset-0 w-full h-full object-cover -z-10"
    />
    <div class="absolute inset-0 bg-black/20 -z-10"></div>
    <Container size="lg" class="text-center text-white py-24">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
        Wyrażaj siebie. Zadbaj o siebie. Bez kompromisów.
      </h1>
      <p class="mt-6 text-lg sm:text-xl max-w-3xl mx-auto">
        Nie dzielimy ludzi na kategorie. Tworzymy skuteczne, naturalne formuły,
        które służą wszystkim — niezależnie od tożsamości, wieku czy wyglądu.
      </p>
    </Container>
  </section>

  <!-- 2. Brand philosophy -->
  <section class="bg-white py-20">
    <Container size="md" class="text-center">
      <Image
        src="/homepage/logo-white.png"
        alt=""
        width={160}
        height={150}
        class="h-32 w-auto mx-auto mb-8 invert"
      />
      <h3 class="text-2xl sm:text-3xl font-extrabold mb-6">Kosmetyki Feel My Self</h3>
      <p class="text-base sm:text-lg leading-relaxed">
        Feel My Self to więcej niż marka – to manifest wolności, autentyczności
        i samoakceptacji. Tworzymy kosmetyki i produkty do pielęgnacji dla
        wszystkich, bez wyjątków. Dla tych, którzy nie boją się być sobą, którzy
        wierzą, że piękno to nie schemat, lecz odwaga do wyrażania siebie na
        własnych zasadach.
      </p>
    </Container>
  </section>

  <!-- 3. Featured products -->
  <section class="bg-white py-12 border-t border-divider">
    <Container size="xl">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {products.map((product) => <ProductCard product={product} />)}
      </div>
    </Container>
  </section>

  <!-- 4. Minimalism -->
  <section class="relative isolate flex items-center justify-center min-h-[60vh] overflow-hidden">
    <img
      src="/homepage/minimalism-bg.png"
      alt=""
      class="absolute inset-0 w-full h-full object-cover -z-10"
    />
    <div class="absolute inset-0 bg-black/30 -z-10"></div>
    <Container size="md" class="text-center text-white py-20">
      <h2 class="text-3xl sm:text-4xl font-extrabold mb-6">
        Minimalizm, który działa. Jeden produkt. Wiele potrzeb.
      </h2>
      <p class="text-base sm:text-lg max-w-2xl mx-auto">
        Wierzymy, że skuteczna pielęgnacja nie potrzebuje dziesiątek kosmetyków.
        Tworzymy uniwersalne formuły, które dbają o Twoją skórę — bez zbędnych
        warstw.
      </p>
    </Container>
  </section>

  <!-- 5. Partners -->
  <section class="bg-white py-16">
    <Container size="lg" class="text-center">
      <h2 class="text-2xl sm:text-3xl font-extrabold mb-4">Nasi partnerzy</h2>
      <p class="text-base sm:text-lg text-muted mb-10">
        Kosmetyki Feel My Self znajdziesz w dobrych drogeriach oraz w sklepach
        partnerskich
      </p>
      <div class="flex flex-wrap items-center justify-center gap-10">
        <a
          href="https://vegezone.pl"
          aria-label="VegeZone.pl"
          target="_blank"
          rel="noopener"
          class="block hover:opacity-80 transition-opacity"
        >
          <Image
            src="/homepage/partner-vegezone.webp"
            alt="VegeZone.pl"
            width={140}
            height={140}
            class="h-24 w-auto"
          />
        </a>
        <a
          href="https://www.superpharm.pl"
          aria-label="Superpharm.pl"
          target="_blank"
          rel="noopener"
          class="block hover:opacity-80 transition-opacity"
        >
          <Image
            src="/homepage/partner-superpharm.png"
            alt="Superpharm.pl"
            width={200}
            height={80}
            class="h-16 w-auto"
          />
        </a>
      </div>
    </Container>
  </section>

  <!-- 6. Final CTA -->
  <section class="relative isolate flex items-center justify-center min-h-[60vh] overflow-hidden">
    <img
      src="/homepage/cta-bg.png"
      alt=""
      class="absolute inset-0 w-full h-full object-cover -z-10"
    />
    <div class="absolute inset-0 bg-black/30 -z-10"></div>
    <Container size="md" class="text-center text-white py-20">
      <h2 class="text-3xl sm:text-4xl font-extrabold mb-6">
        Poczuj siebie. Każdego dnia. Bez wyjątków.
      </h2>
      <p class="text-base sm:text-lg max-w-2xl mx-auto">
        Feel My Self to przestrzeń, w której nie musisz nikogo udawać. Naturalne
        kosmetyki, które wspierają Twoją codzienność — taką, jaką jest.
      </p>
    </Container>
  </section>

</BaseLayout>
```

Notes for the implementer:
- `noindex` is kept on staging (set globally by Cloudflare's robots policy decision in WS2; matches every other staging page).
- The hero/minimalism/CTA "cover" sections use `<img>` (not background-image) for SEO crawlability and to keep within our `<Image>` abstraction philosophy. Plain `<img>` here (not `<Image>`) because these are paths inside `public/`; `resolveImageUrl()` would round-trip the same string. Using plain `<img>` keeps the markup honest.
- `alt=""` on decorative hero/banner imagery is intentional (presentational, not informational — the headline below carries the meaning).
- The `invert` class on the white-logo `<Image>` flips its colors to black on the white-bg brand-philosophy section. Live shows the white logo on a darker background; we render it on white using inverted-black for legibility. If Blazej wants the live look exactly (white logo on dark band), wrap the section in a `bg-brand-primary text-white` container and drop `invert`. Both are one-line edits.
- `fetchAllProducts()` returns by `date desc`; if visual review surfaces wrong order, sort by the slug list documented above.

- [ ] **Step 5.2: Typecheck**

Run:
```bash
npm run typecheck
```

Expected: 0 errors. (If Astro complains about the async `fetchAllProducts()` call — it shouldn't, the existing `/produkt/[slug].astro` and `/[slug].astro` use the same pattern. If it does, check the imports.)

- [ ] **Step 5.3: Build the site**

Run:
```bash
npm run build
```

Expected:
- `astro check` passes (0 errors).
- `astro build` completes; the build log should mention 8 pages built (1 home + 1 blog index + 0 blog posts + 5 products + 1 category). Build time around 2-4s.
- Build fails noisily if `fetchAllProducts()` can't reach `www.feelmyself.pl` — that's the same error path as product pages. Either ensure network or set `WOO_API_BASE` to an offline fixture (no test fixture exists yet — just run on a network-connected machine).

- [ ] **Step 5.4: Visual smoke test on dev server**

Run:
```bash
npm run dev
```

Open `http://localhost:4321/` and `https://www.feelmyself.pl/` side by side. Walk through each section:

1. Hero — full-width painterly image, tagline overlay readable
2. Brand philosophy — white logo (now inverted to black on white), H3, body paragraph centered
3. Featured products — 5 product cards in a row (responsive: 2 col mobile → 3 col tablet → 5 col desktop)
4. Minimalism banner — full-width image with H2 + lead overlay
5. Partners — VegeZone + Superpharm logos centered, linked
6. Final CTA — full-width image with H2 + lead overlay

Also check:
- Header shows `Strona Główna` + `Sklep` + search input (search hidden on mobile)
- Footer has three columns (logo / Nawigacja / About+social) + `© 2026 Feel MySelf` row
- No console errors, no broken `<img>` requests

Press Ctrl+C when done.

- [ ] **Step 5.5: Run unit tests (regression check)**

Run:
```bash
npm test
```

Expected: 15/15 tests passing (8 Woo, 7 images). The homepage changes shouldn't affect any test file — if anything fails, the change in `Nav.astro` or `Footer.astro` likely tripped something we should investigate before committing.

- [ ] **Step 5.6: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(homepage): port live www.feelmyself.pl design to stage

Six inline sections (Hero → Brand philosophy → Featured products →
Minimalism → Partners → Final CTA), all rendered inside BaseLayout.
Imagery sourced from public/homepage/ (bundled in Task 1). Featured
products pull from fetchAllProducts() at build time, reuse WS4
ProductCard. Cover-style sections use <img> + absolute positioning,
not CSS background-image, to keep crawlers and our <Image> abstraction
philosophy honest.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: CHANGELOG entry

**Files:**
- Modify: `CHANGELOG.md` (prepend a new section under `## [Unreleased]`)

- [ ] **Step 6.1: Add a CHANGELOG section above the existing Workstream 4 entry**

Edit `CHANGELOG.md`. Find the line `### Added — Workstream 4 (product / category integration)` and insert this block immediately ABOVE it:

```markdown
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
```

- [ ] **Step 6.2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: CHANGELOG entry for homepage live-design port

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Push and verify CI + deployed staging

**Files:** none (CI + CF Pages do the work)

- [ ] **Step 7.1: Push to origin/main**

Run:
```bash
git push origin main
```

- [ ] **Step 7.2: Watch CI**

Run:
```bash
gh run watch
```

Expected: typecheck + test + build all green. CI's post-build step triggers the CF Pages deploy hook (per `712efcd` belt-and-braces fix from WS4).

- [ ] **Step 7.3: Verify staging deploy**

Wait ~60s for CF Pages to build and deploy, then open `https://stage.feelmyself.pl/` and walk the same 6-section checklist from Step 5.4. Confirm:

- Hero / Brand philosophy / Featured products / Minimalism / Partners / Final CTA all render
- Header search submits to live Woo (`https://www.feelmyself.pl/?s=<query>`)
- Footer social icons link to YouTube + Instagram
- Featured products show the same 5 SKUs that exist on `/sklep` on live
- `view-source:` reveals `<meta name="robots" content="noindex,nofollow">` (staging policy)

- [ ] **Step 7.4: Report back to Blazej**

Tell Blazej the homepage port is live on stage; ask him to do a side-by-side visual review against `https://www.feelmyself.pl/`. If he flags issues (wrong product order, white-on-white logo, hero crop, etc.), file them as a follow-up task list before resuming WS5.

---

## Self-review against spec

| Spec requirement | Plan task |
|---|---|
| Single inline `index.astro` | Task 5 |
| Homepage only — other routes untouched | Tasks 2–5 leave `/blog`, `/produkt/`, `/[slug].astro` alone |
| Header nav reduced + search input | Tasks 2 + 3 |
| Footer three columns + social + copyright | Task 4 |
| Asset fetcher script | Task 1 |
| Assets bundled locally (deviation: `public/` not `src/assets/` — explained at top) | Task 1 |
| Copy lifted verbatim | Reference section + Task 5 markup |
| Search deep-links to live Woo `?s=…` | Task 3 |
| Footer legal links point at live URLs | Plan deviation: live's legal links are `href="#"` placeholders, so we mirror exactly. Documented in Task 4 and the Reference section. |
| Featured products: 5-col grid, no JS carousel | Task 5 |
| Existing 15 tests still pass | Step 5.5 |
| CI green | Step 7.2 |
| No regression on `/blog`, `/produkt/*`, `/kosmetyki` | Step 7.3 implicit; no files in those paths were modified |

No placeholders. No "TBD". No "fill in later". Every code block is the actual code the engineer types.
