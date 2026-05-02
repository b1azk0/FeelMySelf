# FeelMySelf Phase 1 (Astro Port) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a static Astro site at `stage.feelmyself.pl` that visually mirrors `feelmyself.pl`, with all current URLs preserved, no commerce functionality (deep-links to live Woo for purchases), and a foundation that supports Phase 2 (commerce) and Phase 3 (SEO/perf) without rework.

**Architecture:** Astro static-site mode (`output: 'static'`), Tailwind CSS with design tokens extracted from the live Botiga Pro theme, Astro Content Collections for the blog (Markdown), a custom content loader for products (live Woo Store API at build time), single `<Image>` abstraction over `wp-content/uploads/` URLs (Phase-3-swappable to Cloudflare R2). Deploy via Cloudflare Pages with GitHub integration.

**Tech Stack:** Astro 4.x, TypeScript, Tailwind CSS, Vitest, Node 20, GitHub Actions, Cloudflare Pages, Cloudflare DNS.

**Spec:** `docs/superpowers/specs/2026-05-02-phase-1-astro-port-design.md`

---

## Plan Conventions

- **TDD discipline:** for testable code (`src/lib/*.ts`, `scripts/*.mjs`), write the failing test first, see it fail, implement minimum to pass, see it pass, commit. For Astro config / components / layouts, the equivalent "test" is `npm run build` succeeding and visual verification in the dev server.
- **Commit cadence:** one commit per task step that produces a meaningful unit. TDD red-green pairs commit together as `feat:` or `test:`. Workstream completion includes a CHANGELOG update.
- **CHANGELOG:** add a single bullet at the end of each workstream summarizing what landed. Don't add per-task entries.
- **`[BLAZEJ]` tag:** marks tasks Blazej executes manually (GH repo creation, Cloudflare dashboard config, sample-fidelity approvals). I'll pause and provide step-by-step instructions when these come up.
- **Checkpoint markers:** between workstreams, I pause for Blazej review of what just shipped before moving on. Each checkpoint is an opportunity to redirect.
- **Code style:** Astro components use TypeScript in the frontmatter (`---` block). Pure logic lives in `.ts` files. Scripts are `.mjs` (ES modules, run directly with Node).

---

## Workstream 1 — Repo + Deploy Scaffolding

**Outcome:** Empty Astro shell builds locally, deploys to Cloudflare Pages, serves at `stage.feelmyself.pl` (placeholder homepage), CI runs on PRs, refresh workflow ready to trigger rebuilds.

### Task 1.1: Initialize npm and install Astro

**Files:**
- Create: `package.json`
- Create: `package-lock.json` (auto)
- Create: `node_modules/` (auto, gitignored)

- [ ] **Step 1: Verify Node version**

```bash
node --version
```

Expected: `v20.x.x` or higher. If older, install Node 20 first.

- [ ] **Step 2: Create package.json with Astro scaffold**

Run from repo root (`/Users/bajzel/GitHub/FeelMySelf`):

```bash
npm create astro@latest -- --template minimal --no-install --no-git --typescript strict --skip-houston --yes .
```

Notes:
- `--template minimal` — empty starter (we build everything)
- `--no-git` — repo is already initialized
- `--typescript strict` — strict TS from day one
- `.` — install in current dir

- [ ] **Step 3: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, `package-lock.json` written, no errors.

- [ ] **Step 4: Verify scaffold builds**

```bash
npm run build
```

Expected: build succeeds, `dist/` folder created with placeholder `index.html`.

- [ ] **Step 5: Commit scaffold**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src public .gitignore
git commit -m "chore: scaffold Astro minimal template"
```

### Task 1.2: Configure Astro for i18n + static output + site URL

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Replace astro.config.mjs**

```javascript
// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://feelmyself.pl',
  output: 'static',
  trailingSlash: 'never',
  i18n: {
    defaultLocale: 'pl',
    locales: ['pl'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  build: {
    format: 'directory',
  },
});
```

Notes:
- `site` is set to PROD URL (not staging) — used for canonical URLs and sitemap. Staging will have a `<robots>` block and canonical pointing here, so prod indexing is unaffected.
- `prefixDefaultLocale: false` keeps Polish URLs clean today; adding `'en'` later is additive.

- [ ] **Step 2: Verify build still succeeds**

```bash
npm run build
```

Expected: build succeeds, no warnings about config.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "config(astro): set site URL, static output, i18n with PL default"
```

### Task 1.3: Install and configure Tailwind CSS

**Files:**
- Modify: `package.json`, `astro.config.mjs`
- Create: `tailwind.config.js`
- Create: `src/styles/global.css`

- [ ] **Step 1: Install Tailwind integration**

```bash
npx astro add tailwind --yes
```

Expected: installs `@astrojs/tailwind`, `tailwindcss`, creates `tailwind.config.mjs`, modifies `astro.config.mjs`.

- [ ] **Step 2: Replace tailwind.config.mjs (or .js, whichever was created) with explicit content paths**

```javascript
// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      // Tokens populated in Workstream 2 from design audit
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Create src/styles/global.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Verify build still succeeds**

```bash
npm run build
```

Expected: success, `dist/` includes a small CSS bundle.

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs tailwind.config.mjs src/styles/global.css package.json package-lock.json
git commit -m "deps: add Tailwind CSS via @astrojs/tailwind"
```

### Task 1.4: Install and configure Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/.gitkeep`

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest @vitest/ui
```

- [ ] **Step 2: Create vitest.config.ts**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    // node_modules and dist are excluded by default
  },
});
```

Note: broad include pattern covers `tests/`, `src/`, and `scripts/` — the migration script tests in Workstream 3 land under `scripts/`.

- [ ] **Step 3: Add test scripts to package.json**

Edit the `"scripts"` block in `package.json`:

```json
{
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "typecheck": "astro check"
  }
}
```

- [ ] **Step 4: Add a smoke test**

Create `tests/smoke.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run the smoke test**

```bash
npm test
```

Expected: 1 test passes.

- [ ] **Step 6: Add `astro/check` for typecheck**

```bash
npm install -D @astrojs/check typescript
```

Verify:

```bash
npm run typecheck
```

Expected: no type errors (the scaffold is clean).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/smoke.test.ts
git commit -m "deps: add Vitest + astro check, wire up test/typecheck scripts"
```

### Task 1.5: Create BaseLayout and placeholder homepage

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create BaseLayout.astro**

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
}

const { title, description, canonical, noindex } = Astro.props;
const fullCanonical = canonical ?? new URL(Astro.url.pathname, Astro.site).toString();
---
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <link rel="canonical" href={fullCanonical} />
    {noindex && <meta name="robots" content="noindex,nofollow" />}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="bg-white text-gray-900 antialiased">
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Replace src/pages/index.astro with placeholder**

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="FeelMySelf — Astro staging" description="Placeholder homepage. Phase 1 scaffold." noindex>
  <main class="mx-auto max-w-2xl px-4 py-16">
    <h1 class="text-4xl font-bold">FeelMySelf — staging</h1>
    <p class="mt-4 text-gray-600">
      This is the Astro staging build. Real content lands during Phase 1
      implementation.
    </p>
  </main>
</BaseLayout>
```

- [ ] **Step 3: Run dev server, visit homepage**

```bash
npm run dev
```

In another terminal:

```bash
curl -s http://localhost:4321/ | grep -E "(FeelMySelf|noindex)"
```

Expected: title "FeelMySelf — Astro staging" present, `noindex,nofollow` meta tag present.

Stop the dev server.

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: success, `dist/index.html` contains the placeholder.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro
git commit -m "feat(layout): BaseLayout with title/canonical/noindex props + placeholder home"
```

### Task 1.6: Add public/ assets — robots.txt blocking staging crawlers

**Files:**
- Create: `public/robots.txt`
- Verify: `public/favicon.svg` (likely created by the Astro scaffold; if not, create a placeholder)

- [ ] **Step 1: Create public/robots.txt**

```
User-agent: *
Disallow: /
```

This blocks all crawlers from staging. Will be replaced at cutover.

- [ ] **Step 2: Verify favicon exists**

```bash
ls public/
```

If `favicon.svg` is missing, create a 1x1 placeholder:

```bash
cat > public/favicon.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="#000"/></svg>
EOF
```

- [ ] **Step 3: Verify build copies them to dist/**

```bash
npm run build && ls dist/robots.txt dist/favicon.svg
```

Expected: both files present in `dist/`.

- [ ] **Step 4: Commit**

```bash
git add public/robots.txt public/favicon.svg
git commit -m "chore: add staging robots.txt (block all crawlers) + placeholder favicon"
```

### Task 1.7: Verify local end-to-end build

- [ ] **Step 1: Clean build**

```bash
rm -rf dist node_modules/.astro
npm run build
```

Expected: build succeeds in <30s, no warnings about missing files.

- [ ] **Step 2: Preview the build**

```bash
npm run preview
```

Visit `http://localhost:4321/` — should see the placeholder homepage. Visit `http://localhost:4321/robots.txt` — should see `Disallow: /`.

Stop preview server.

- [ ] **Step 3: Run all checks**

```bash
npm run typecheck && npm test && npm run build
```

Expected: all three commands succeed.

### Task 1.8: [BLAZEJ] Create empty GitHub repo

**Step-by-step instructions for Blazej:**

- [ ] **Step 1: Create the repo via gh CLI (or web UI)**

Recommended (CLI):

```bash
gh repo create FeelMySelf --private --description "Astro port of feelmyself.pl (WordPress/WooCommerce → Astro)" --source=/Users/bajzel/GitHub/FeelMySelf --remote=origin
```

Notes:
- `--private` — keep private until ready (can flip to public later via dashboard)
- `--source` + `--remote=origin` — wires the local repo to the new remote in one shot
- Don't use `--push` yet; we want to push the scaffold ourselves to verify build first

If using the web UI:
1. Go to https://github.com/new
2. Name: `FeelMySelf`
3. Visibility: Private
4. Don't initialize with README/license/.gitignore (we already have these)
5. Click Create
6. Run locally:
   ```bash
   git remote add origin git@github.com:Blazej-M/FeelMySelf.git
   ```
   (Adjust the URL to match the actual GitHub username/org you used.)

- [ ] **Step 2: Verify remote is set**

```bash
git remote -v
```

Expected: `origin` listed with the GitHub URL.

### Task 1.9: Push initial scaffold to GitHub

- [ ] **Step 1: Push main branch**

```bash
git push -u origin main
```

Expected: push succeeds. The repo on GitHub now contains the spec, scaffold, layouts, robots.txt.

- [ ] **Step 2: Verify on GitHub**

```bash
gh repo view --web
```

Or visit the URL printed by `gh repo view`. Confirm the file tree is correct.

### Task 1.10: [BLAZEJ] Configure Cloudflare Pages

**Step-by-step instructions for Blazej:**

- [ ] **Step 1: Open Cloudflare dashboard**

Navigate to: https://dash.cloudflare.com → select the account that owns `feelmyself.pl` → Workers & Pages → Create application → Pages → Connect to Git.

- [ ] **Step 2: Authorize Cloudflare GitHub App**

Click "Connect GitHub" → authorize the Cloudflare Pages GitHub App for the FeelMySelf repo (read-only access). Select the FeelMySelf repo from the list → Begin setup.

- [ ] **Step 3: Configure build settings**

Fill in:
- **Project name:** `feelmyself-stage` (this becomes the `*.pages.dev` subdomain)
- **Production branch:** `main`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** (leave blank — repo root)
- **Environment variables (Production):**
  - `WOO_API_BASE` = `https://feelmyself.pl/wp-json/wc/store/v1`
  - `NODE_VERSION` = `20`

Click "Save and Deploy".

- [ ] **Step 4: Wait for first deploy**

Pages will run `npm install` then `npm run build`. Should take ~2 min. When green, you'll get a URL like `https://feelmyself-stage.pages.dev`.

Visit that URL — should show the placeholder homepage.

- [ ] **Step 5: Add custom domain `stage.feelmyself.pl`**

In the Pages project: Custom domains → Set up a custom domain → enter `stage.feelmyself.pl` → Continue. Cloudflare auto-configures the CNAME if `feelmyself.pl` is on this Cloudflare account.

Wait ~1 minute for SSL provisioning. Visit `https://stage.feelmyself.pl` — should show the placeholder.

- [ ] **Step 6: Get the deploy hook URL**

In the Pages project: Settings → Builds & deployments → Deploy hooks → Add deploy hook.
- **Hook name:** `manual-and-cron-refresh`
- **Branch to build:** `main`

Click Save. Cloudflare gives you a URL like `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/<UUID>`.

**Copy this URL** — you'll paste it into a GitHub secret in Task 1.13.

### Task 1.11: Add CI workflow (typecheck + build on PRs)

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create workflow file**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
        env:
          WOO_API_BASE: https://feelmyself.pl/wp-json/wc/store/v1
```

- [ ] **Step 2: Commit and push**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: typecheck + test + build on PRs and main"
git push
```

- [ ] **Step 3: Verify the workflow runs**

```bash
gh run watch
```

Expected: green check on the latest commit. If red, inspect the logs and fix before continuing.

### Task 1.12: Add refresh-content workflow (cron + manual dispatch)

**Files:**
- Create: `.github/workflows/refresh-content.yml`

- [ ] **Step 1: Create workflow file**

```yaml
# .github/workflows/refresh-content.yml
name: Refresh Content

on:
  schedule:
    # Nightly at 03:00 UTC (≈05:00 Warsaw)
    - cron: '0 3 * * *'
  workflow_dispatch:

jobs:
  trigger-rebuild:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cloudflare Pages rebuild
        run: |
          response=$(curl -s -X POST -w "%{http_code}" -o /tmp/cf_response.json "$DEPLOY_HOOK_URL")
          echo "HTTP $response"
          cat /tmp/cf_response.json
          if [ "$response" != "200" ]; then
            echo "Deploy hook failed with HTTP $response"
            exit 1
          fi
        env:
          DEPLOY_HOOK_URL: ${{ secrets.CF_DEPLOY_HOOK_URL }}
```

- [ ] **Step 2: Commit and push**

```bash
git add .github/workflows/refresh-content.yml
git commit -m "ci: nightly cron + manual dispatch refresh via Pages deploy hook"
git push
```

### Task 1.13: [BLAZEJ] Add CF_DEPLOY_HOOK_URL as GitHub secret

**Step-by-step instructions for Blazej:**

- [ ] **Step 1: Add secret via gh CLI**

Run from the repo root, replacing `<URL>` with the deploy hook URL from Task 1.10 step 6:

```bash
gh secret set CF_DEPLOY_HOOK_URL --body "<URL>"
```

Or via web UI: Repo → Settings → Secrets and variables → Actions → New repository secret → Name: `CF_DEPLOY_HOOK_URL`, Value: paste the URL.

- [ ] **Step 2: Verify secret is set**

```bash
gh secret list
```

Expected: `CF_DEPLOY_HOOK_URL` listed.

### Task 1.14: Verify end-to-end deploy + manual refresh trigger

- [ ] **Step 1: Manually trigger the refresh workflow**

```bash
gh workflow run refresh-content.yml
```

- [ ] **Step 2: Watch it run**

```bash
gh run watch
```

Expected: HTTP 200 from Cloudflare, workflow green.

- [ ] **Step 3: Verify Pages rebuild started**

In CF Pages dashboard, you should see a new deployment kicked off. Wait for it to finish (~2 min).

- [ ] **Step 4: Verify staging URL still works**

```bash
curl -sI https://stage.feelmyself.pl/ | head -1
```

Expected: `HTTP/2 200`.

- [ ] **Step 5: Verify robots.txt blocks crawlers**

```bash
curl -s https://stage.feelmyself.pl/robots.txt
```

Expected: `User-agent: *\nDisallow: /`.

### Task 1.15: Workstream 1 wrap — CHANGELOG + checkpoint

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Update CHANGELOG**

Replace the Unreleased section content:

```markdown
## [Unreleased]

### Added

- Phase 1 scaffold: Astro 4.x + TypeScript strict + Tailwind CSS + Vitest.
- Astro config: `output: 'static'`, i18n with `pl` default (no URL prefix),
  site URL set to prod domain.
- Base layout (`BaseLayout.astro`) with title/description/canonical/noindex
  props.
- Placeholder homepage at `/`.
- `public/robots.txt` blocking all crawlers on staging.
- GitHub Actions: CI workflow (typecheck + test + build on PRs and main);
  refresh-content workflow (nightly cron + manual dispatch via CF Pages
  deploy hook).
- Cloudflare Pages project `feelmyself-stage` deployed to
  `stage.feelmyself.pl` with PR previews enabled.
- Phase 1 design spec at
  `docs/superpowers/specs/2026-05-02-phase-1-astro-port-design.md`.
```

- [ ] **Step 2: Commit and push**

```bash
git add CHANGELOG.md
git commit -m "docs: CHANGELOG entry for Workstream 1 (scaffold + deploy)"
git push
```

- [ ] **Step 3: Checkpoint review with Blazej**

Pause and confirm:
- `https://stage.feelmyself.pl` shows the placeholder
- PR preview URLs work (open a throwaway PR if needed)
- CI is green on `main`
- Refresh workflow runs successfully on manual trigger

If everything is green, proceed to Workstream 2.

---

## Workstream 2 — Design System Extraction

**Outcome:** Tailwind config populated with tokens extracted from the live Botiga Pro site; primitive components (Button, Container, Link, Image) and layout components (Header, Footer, Nav) built and verifiable in a sandbox page.

### Task 2.1: SSH to .159, extract theme + customizer

**Files:**
- Create: `reference/theme-source/` (gitignored — large, license-grey)

- [ ] **Step 1: SSH to the box**

```bash
ssh root@89.167.66.159
```

(Use the existing `.159` SSH config alias if set up.)

- [ ] **Step 2: Locate WP install for feelmyself.pl**

On the box:

```bash
ls /var/www/
```

Find the directory for `feelmyself.pl` (likely `/var/www/feelmyself.pl/` or similar).

- [ ] **Step 3: Identify active theme**

```bash
cd /var/www/feelmyself.pl/wp-content/themes/
ls
```

Expected: directories including `botiga` and `botiga-child` (or similar). Botiga Pro plugin is separate (in `wp-content/plugins/`).

- [ ] **Step 4: Tarball theme + relevant plugins**

```bash
cd /tmp
tar -czf feelmyself-theme.tgz \
  /var/www/feelmyself.pl/wp-content/themes/botiga* \
  /var/www/feelmyself.pl/wp-content/plugins/botiga-pro
exit
```

- [ ] **Step 5: Pull tarball locally**

From your local machine:

```bash
scp root@89.167.66.159:/tmp/feelmyself-theme.tgz /tmp/feelmyself-theme.tgz
mkdir -p /Users/bajzel/GitHub/FeelMySelf/reference/theme-source
cd /Users/bajzel/GitHub/FeelMySelf/reference/theme-source
tar -xzf /tmp/feelmyself-theme.tgz --strip-components=4
```

- [ ] **Step 6: Add reference/theme-source/ to .gitignore**

Add to `.gitignore`:

```
# Reference material (not source of truth, kept locally for audit)
reference/theme-source/
reference/scraped-pages/
```

- [ ] **Step 7: Verify ignored**

```bash
git status
```

Expected: `reference/theme-source/` does NOT appear in untracked files. The `.gitignore` change DOES.

- [ ] **Step 8: Commit gitignore change**

```bash
git add .gitignore
git commit -m "chore: gitignore reference/ extraction artifacts"
```

### Task 2.2: Mirror live site for visual reference

**Files:**
- Create: `reference/scraped-pages/` (gitignored)

- [ ] **Step 1: Mirror representative pages**

```bash
mkdir -p reference/scraped-pages
cd reference/scraped-pages
wget --mirror --page-requisites --convert-links --no-parent \
  --domains=feelmyself.pl \
  --reject="*.zip,*.exe,*.dmg" \
  --user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" \
  https://feelmyself.pl/
```

This downloads HTML, CSS, JS, fonts, images for the homepage and everything linked from it (1 level). Limit it: if it's pulling too much, stop with Ctrl-C — we just need representative samples.

- [ ] **Step 2: Verify scrape**

```bash
ls reference/scraped-pages/feelmyself.pl/
```

Expected: `index.html`, `wp-content/`, etc.

- [ ] **Step 3: Open the mirrored homepage in a browser**

```bash
open reference/scraped-pages/feelmyself.pl/index.html
```

Verify it renders close to the live site (some JS may be broken, that's fine — we care about layout/CSS).

- [ ] **Step 4: cd back to repo root**

```bash
cd /Users/bajzel/GitHub/FeelMySelf
```

(No commit — these files are gitignored.)

### Task 2.3: Audit design tokens, write reference/design-tokens.md

**Files:**
- Create: `reference/design-tokens.md`

- [ ] **Step 1: Open scraped CSS in browser devtools**

Open `reference/scraped-pages/feelmyself.pl/index.html` in Chrome/Firefox. Open devtools.

- [ ] **Step 2: Catalog tokens systematically**

For each, find the canonical value used on the live site (use the elements panel + computed styles):

| Token category | Examples to find |
|---|---|
| Brand colors | Primary, secondary, accent, background |
| Neutrals | Text default, text muted, border, divider |
| Functional | Success, warning, error |
| Type scale | h1, h2, h3, h4, body, small, caption |
| Type weights | Regular, medium, semibold, bold |
| Font families | Sans, serif (if any), monospace (rare) |
| Spacing scale | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px (Tailwind defaults usually OK) |
| Border radii | sm, md, lg, full |
| Shadows | sm, md, lg, hover |
| Breakpoints | mobile, tablet, desktop, wide |

- [ ] **Step 3: Write reference/design-tokens.md**

Create the file with sections matching the table above. Example skeleton (replace values with actuals from audit):

```markdown
# FeelMySelf Design Tokens (Phase 1 Audit)

Extracted from https://feelmyself.pl on 2026-05-02 via browser devtools
inspection of the live Botiga Pro theme. Source of truth for
`tailwind.config.mjs`.

## Brand colors

| Name | Hex | Usage |
|---|---|---|
| brand-primary | #XXXXXX | Buttons, links, accents |
| brand-secondary | #XXXXXX | Hover states |
| brand-accent | #XXXXXX | Highlights, badges |

## Neutrals

| Name | Hex | Usage |
|---|---|---|
| text-default | #XXXXXX | Body text |
| text-muted | #XXXXXX | Captions, meta |
| border | #XXXXXX | Card borders |
| bg-default | #XXXXXX | Page background |

## Type scale

| Token | Size | Line height | Weight |
|---|---|---|---|
| h1 | XXpx | XX | 700 |
| h2 | XXpx | XX | 700 |
| h3 | XXpx | XX | 600 |
| body | 16px | 1.6 | 400 |

## Font families

- **Sans:** "XXX", system-ui, sans-serif

## Spacing scale

Use Tailwind defaults (0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64) unless audit reveals deviations.

## Breakpoints

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

## Shadows

- card: 0 1px 3px rgba(0,0,0,.08)
- card-hover: 0 4px 12px rgba(0,0,0,.12)

## Notes

- (any non-standard values, gradients, etc.)
```

- [ ] **Step 4: Commit**

```bash
git add reference/design-tokens.md
git commit -m "docs(reference): design tokens extracted from live Botiga Pro audit"
```

### Task 2.4: Populate tailwind.config.mjs with tokens

**Files:**
- Modify: `tailwind.config.mjs`

- [ ] **Step 1: Replace tailwind.config.mjs**

Use the values from `reference/design-tokens.md` (replace the placeholder hex values below with actual audit values):

```javascript
// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#XXXXXX',     // from audit
          secondary: '#XXXXXX',
          accent: '#XXXXXX',
        },
        text: {
          DEFAULT: '#XXXXXX',
          muted: '#XXXXXX',
        },
        border: {
          DEFAULT: '#XXXXXX',
        },
      },
      fontFamily: {
        sans: ['"XXX"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Override only if audit shows deviation from Tailwind defaults
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.08)',
        'card-hover': '0 4px 12px rgba(0,0,0,.12)',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Verify build still succeeds**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.mjs
git commit -m "feat(design-system): populate Tailwind config from audit tokens"
```

### Task 2.5: Add font-face and base styles to global.css

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Determine font source**

From audit, identify the brand font (likely Google Fonts since Botiga uses webfonts). Check `reference/scraped-pages/feelmyself.pl/index.html` for `<link>` tags pointing to fonts.googleapis.com or similar.

- [ ] **Step 2: Update src/styles/global.css**

Replace with:

```css
/* src/styles/global.css */

/* Self-host or proxy via Google Fonts CDN. Example using Google Fonts: */
@import url('https://fonts.googleapis.com/css2?family=XXX:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: theme('fontFamily.sans');
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    color: theme('colors.text.DEFAULT');
    background-color: theme('colors.white');
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold;
  }
}
```

(Replace `XXX` with the actual font family name from audit. If self-hosting fonts is preferred, swap the `@import` for `@font-face` rules pointing to `/fonts/...` files in `public/fonts/`.)

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Open `dist/index.html` in a browser, confirm the font loads.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(design-system): brand font + base typography in global.css"
```

### Task 2.6: Create primitive — Button

**Files:**
- Create: `src/components/primitives/Button.astro`

- [ ] **Step 1: Write the component**

```astro
---
// src/components/primitives/Button.astro
type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  variant?: Variant;
  size?: Size;
  href?: string;
  type?: 'button' | 'submit';
  class?: string;
  rel?: string;
  target?: string;
}

const {
  variant = 'primary',
  size = 'md',
  href,
  type = 'button',
  class: className = '',
  rel,
  target,
} = Astro.props;

const base = 'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-primary text-white hover:bg-brand-secondary focus:ring-brand-primary',
  secondary: 'bg-white text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white focus:ring-brand-primary',
  ghost: 'bg-transparent text-brand-primary hover:bg-brand-primary/10 focus:ring-brand-primary',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
---
{href ? (
  <a href={href} class={classes} rel={rel} target={target}>
    <slot />
  </a>
) : (
  <button type={type} class={classes}>
    <slot />
  </button>
)}
```

- [ ] **Step 2: Use it in the placeholder homepage to verify**

Edit `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Button from '../components/primitives/Button.astro';
---
<BaseLayout title="FeelMySelf — Astro staging" description="Scaffold." noindex>
  <main class="mx-auto max-w-2xl px-4 py-16 space-y-4">
    <h1 class="text-4xl font-bold">FeelMySelf — staging</h1>
    <div class="flex gap-2">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  </main>
</BaseLayout>
```

- [ ] **Step 3: Verify visually**

```bash
npm run dev
```

Visit `http://localhost:4321/`. Confirm three button variants render with brand colors. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add src/components/primitives/Button.astro src/pages/index.astro
git commit -m "feat(primitives): Button with variant/size props"
```

### Task 2.7: Create primitive — Container

**Files:**
- Create: `src/components/primitives/Container.astro`

- [ ] **Step 1: Write the component**

```astro
---
// src/components/primitives/Container.astro
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  class?: string;
}

const { size = 'lg', class: className = '' } = Astro.props;

const sizes: Record<NonNullable<Props['size']>, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
};
---
<div class={`mx-auto px-4 sm:px-6 lg:px-8 ${sizes[size]} ${className}`}>
  <slot />
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/primitives/Container.astro
git commit -m "feat(primitives): Container with size variants"
```

### Task 2.8: Create primitive — Link

**Files:**
- Create: `src/components/primitives/Link.astro`

- [ ] **Step 1: Write the component**

```astro
---
// src/components/primitives/Link.astro
interface Props {
  href: string;
  external?: boolean;
  class?: string;
  underline?: boolean;
}

const { href, external = false, class: className = '', underline = true } = Astro.props;

const isExternal = external || /^https?:\/\//.test(href);
const rel = isExternal ? 'noopener noreferrer' : undefined;
const target = isExternal ? '_blank' : undefined;
---
<a
  href={href}
  rel={rel}
  target={target}
  class={`text-brand-primary hover:text-brand-secondary transition-colors ${underline ? 'underline underline-offset-2' : 'no-underline'} ${className}`}
>
  <slot />
</a>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/primitives/Link.astro
git commit -m "feat(primitives): Link with external auto-detect + rel/target"
```

### Task 2.9: Create src/lib/images.ts (resolveImageUrl + remark plugin)

**Files:**
- Create: `src/lib/images.ts`
- Create: `src/lib/images.test.ts`

- [ ] **Step 1: Write the failing test first**

`src/lib/images.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { resolveImageUrl } from './images';

describe('resolveImageUrl', () => {
  it('returns absolute URLs unchanged', () => {
    expect(resolveImageUrl('https://example.com/foo.jpg')).toBe('https://example.com/foo.jpg');
  });

  it('proxies wp-content/uploads paths through feelmyself.pl', () => {
    expect(resolveImageUrl('/wp-content/uploads/2024/img.jpg'))
      .toBe('https://feelmyself.pl/wp-content/uploads/2024/img.jpg');
  });

  it('handles wp-content/uploads paths without leading slash', () => {
    expect(resolveImageUrl('wp-content/uploads/2024/img.jpg'))
      .toBe('https://feelmyself.pl/wp-content/uploads/2024/img.jpg');
  });

  it('strips host from already-prefixed feelmyself.pl URLs and re-resolves', () => {
    expect(resolveImageUrl('https://feelmyself.pl/wp-content/uploads/img.jpg'))
      .toBe('https://feelmyself.pl/wp-content/uploads/img.jpg');
  });

  it('returns site-relative paths for non-uploads paths unchanged', () => {
    expect(resolveImageUrl('/images/local.jpg')).toBe('/images/local.jpg');
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
npm test
```

Expected: error "Cannot find module './images'".

- [ ] **Step 3: Implement src/lib/images.ts**

```typescript
// src/lib/images.ts

const WP_HOST = 'https://feelmyself.pl';

/**
 * Resolves an image source to its delivery URL.
 *
 * Phase 1: proxies `wp-content/uploads/*` through the live WP origin.
 * Phase 3: swap to Cloudflare R2 + Cloudflare Images (one-line change).
 *
 * Architectural rule: every image reference goes through this function.
 * No raw <img src> to wp-content URLs in templates.
 */
export function resolveImageUrl(src: string): string {
  if (!src) return src;

  // Already absolute (any host) — leave alone
  if (/^https?:\/\//.test(src)) {
    return src;
  }

  // Strip leading slash for normalization
  const normalized = src.replace(/^\//, '');

  // wp-content/uploads → proxy through WP origin
  if (normalized.startsWith('wp-content/uploads/')) {
    return `${WP_HOST}/${normalized}`;
  }

  // Site-relative (e.g., /images/local.jpg, /favicon.svg) — leave alone
  return src.startsWith('/') ? src : `/${src}`;
}

/**
 * Remark plugin that rewrites image URLs in Markdown blog post bodies
 * through resolveImageUrl(). Ensures embedded `<img>` and `![]()` images
 * also flow through the abstraction.
 */
export function remarkResolveImages() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (node.type === 'image' && typeof node.url === 'string') {
        node.url = resolveImageUrl(node.url);
      }
      // HTML <img src="..."> nodes
      if (node.type === 'html' && typeof node.value === 'string') {
        node.value = node.value.replace(
          /<img([^>]*?)src=["']([^"']+)["']/g,
          (_match: string, attrs: string, url: string) => `<img${attrs}src="${resolveImageUrl(url)}"`
        );
      }
    });
  };
}

// Minimal AST visitor (avoids unist-util-visit dependency for this small need)
function visit(node: any, fn: (n: any) => void) {
  fn(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) visit(child, fn);
  }
}
```

- [ ] **Step 4: Run the test, confirm it passes**

```bash
npm test
```

Expected: 5 tests pass for `resolveImageUrl`.

- [ ] **Step 5: Wire the remark plugin into Astro config**

Edit `astro.config.mjs`:

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { remarkResolveImages } from './src/lib/images.ts';

export default defineConfig({
  site: 'https://feelmyself.pl',
  output: 'static',
  trailingSlash: 'never',
  integrations: [tailwind()],
  i18n: {
    defaultLocale: 'pl',
    locales: ['pl'],
    routing: { prefixDefaultLocale: false },
  },
  build: { format: 'directory' },
  markdown: {
    remarkPlugins: [remarkResolveImages],
  },
});
```

- [ ] **Step 6: Verify build still succeeds**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/images.ts src/lib/images.test.ts astro.config.mjs
git commit -m "feat(images): resolveImageUrl abstraction + remark plugin for MD images"
```

### Task 2.10: Create primitive — Image

**Files:**
- Create: `src/components/primitives/Image.astro`

- [ ] **Step 1: Write the component**

```astro
---
// src/components/primitives/Image.astro
import { resolveImageUrl } from '../../lib/images';

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  class?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
}

const {
  src,
  alt,
  width,
  height,
  class: className = '',
  loading = 'lazy',
  decoding = 'async',
} = Astro.props;

const resolvedSrc = resolveImageUrl(src);
---
<img
  src={resolvedSrc}
  alt={alt}
  width={width}
  height={height}
  loading={loading}
  decoding={decoding}
  class={className}
/>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/primitives/Image.astro
git commit -m "feat(primitives): Image component using resolveImageUrl abstraction"
```

### Task 2.11: Create layout — Header

**Files:**
- Create: `src/components/layout/Header.astro`

- [ ] **Step 1: Write the component (skeleton; visual parity polished in Workstream 5)**

```astro
---
// src/components/layout/Header.astro
import Container from '../primitives/Container.astro';
import Nav from './Nav.astro';
---
<header class="border-b border-border bg-white">
  <Container>
    <div class="flex items-center justify-between py-4">
      <a href="/" class="text-2xl font-bold text-brand-primary">FeelMySelf</a>
      <Nav />
    </div>
  </Container>
</header>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Header.astro
git commit -m "feat(layout): Header skeleton (visual parity tuned in Workstream 5)"
```

### Task 2.12: Create layout — Nav

**Files:**
- Create: `src/components/layout/Nav.astro`

- [ ] **Step 1: Write the component (skeleton)**

The actual menu items will be derived from the live site's nav menu in Workstream 5. For now, a placeholder.

```astro
---
// src/components/layout/Nav.astro
const links = [
  { href: '/', label: 'Strona główna' },
  { href: '/sklep', label: 'Sklep' },
  { href: '/blog', label: 'Blog' },
  { href: '/kontakt', label: 'Kontakt' },
];
---
<nav class="flex items-center gap-6">
  {links.map((l) => (
    <a href={l.href} class="text-text hover:text-brand-primary transition-colors">{l.label}</a>
  ))}
</nav>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Nav.astro
git commit -m "feat(layout): Nav skeleton with placeholder menu (real items in WS5)"
```

### Task 2.13: Create layout — Footer

**Files:**
- Create: `src/components/layout/Footer.astro`

- [ ] **Step 1: Write the component (skeleton)**

```astro
---
// src/components/layout/Footer.astro
import Container from '../primitives/Container.astro';
const year = new Date().getFullYear();
---
<footer class="border-t border-border bg-white mt-16">
  <Container>
    <div class="py-8 text-sm text-text-muted">
      <p>© {year} FeelMySelf. Wszystkie prawa zastrzeżone.</p>
    </div>
  </Container>
</footer>
```

- [ ] **Step 2: Wire Header + Footer into BaseLayout**

Edit `src/layouts/BaseLayout.astro`:

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';

interface Props {
  title: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  bareLayout?: boolean;
}

const { title, description, canonical, noindex, bareLayout = false } = Astro.props;
const fullCanonical = canonical ?? new URL(Astro.url.pathname, Astro.site).toString();
---
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <link rel="canonical" href={fullCanonical} />
    {noindex && <meta name="robots" content="noindex,nofollow" />}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="bg-white text-text antialiased min-h-screen flex flex-col">
    {!bareLayout && <Header />}
    <main class="flex-1">
      <slot />
    </main>
    {!bareLayout && <Footer />}
  </body>
</html>
```

- [ ] **Step 3: Verify dev server**

```bash
npm run dev
```

Visit `http://localhost:4321/` — Header (with logo + nav) and Footer (with copyright) should appear above and below the existing button demo. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Footer.astro src/layouts/BaseLayout.astro
git commit -m "feat(layout): Footer + wire Header/Footer into BaseLayout (bareLayout escape hatch)"
```

### Task 2.14: Workstream 2 wrap — verify, CHANGELOG, checkpoint

- [ ] **Step 1: Run all checks**

```bash
npm run typecheck && npm test && npm run build
```

Expected: all green.

- [ ] **Step 2: Update CHANGELOG**

Append under Unreleased → Added:

```markdown
- Design tokens audit (`reference/design-tokens.md`) extracted from live
  Botiga Pro theme; tokens populated in `tailwind.config.mjs`.
- Brand font + base typography wired in `global.css`.
- Primitive components: Button (variant/size), Container, Link
  (auto-external), Image (resolveImageUrl abstraction — Phase-3 swappable).
- `src/lib/images.ts` with `resolveImageUrl()` and remark plugin for
  Markdown image rewriting.
- Layout components: Header (logo + Nav), Footer, Nav (skeleton menu —
  real items in Workstream 5).
- BaseLayout updated to flex column with Header/Footer wrapping
  `<main>`, plus `bareLayout` escape hatch.
```

- [ ] **Step 3: Commit and push**

```bash
git add CHANGELOG.md
git commit -m "docs: CHANGELOG entry for Workstream 2 (design system + primitives)"
git push
```

- [ ] **Step 4: Checkpoint review with Blazej**

Pause and confirm:
- Visit a PR preview (or `https://stage.feelmyself.pl` after deploy hook)
- Header looks correct (font, color, logo)
- Footer correct
- Three button variants render with brand colors
- No console errors

If anything looks off vs. live site, log it and fix before moving to Workstream 3.

---

## Workstream 3 — Blog Migration

**Outcome:** All WP blog posts migrated to Markdown in `src/content/blog/`, blog index and individual post pages render with visual parity.

### Task 3.1: Create content collections schema

**Files:**
- Create: `src/content/config.ts`

- [ ] **Step 1: Write the schema**

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    excerpt: z.string().optional(),
    featuredImage: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    locale: z.enum(['pl']).default('pl'),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "feat(content): blog collection schema (PL-only for now, EN-ready)"
```

### Task 3.2: Write the blog migration script (test first)

**Files:**
- Create: `scripts/migrate-blog-from-wp.test.ts`
- Create: `scripts/migrate-blog-from-wp.mjs`

- [ ] **Step 1: Install dependencies**

```bash
npm install -D turndown gray-matter slugify
```

- [ ] **Step 2: Write tests for the conversion functions**

`scripts/migrate-blog-from-wp.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { wpPostToMarkdown, frontmatterFromPost } from './migrate-blog-from-wp.mjs';

describe('wpPostToMarkdown', () => {
  it('converts simple HTML to Markdown', () => {
    const result = wpPostToMarkdown('<p>Hello <strong>world</strong></p>');
    expect(result.trim()).toBe('Hello **world**');
  });

  it('preserves embedded image URLs as-is for remark plugin to handle', () => {
    const html = '<p><img src="https://feelmyself.pl/wp-content/uploads/2024/x.jpg" alt="x"/></p>';
    const result = wpPostToMarkdown(html);
    expect(result).toContain('https://feelmyself.pl/wp-content/uploads/2024/x.jpg');
  });

  it('converts headings', () => {
    expect(wpPostToMarkdown('<h2>Title</h2>').trim()).toBe('## Title');
  });
});

describe('frontmatterFromPost', () => {
  it('extracts core fields from a WP REST post', () => {
    const post = {
      id: 1,
      slug: 'test-post',
      date: '2024-01-15T10:00:00',
      modified: '2024-01-16T10:00:00',
      title: { rendered: 'Test Post' },
      excerpt: { rendered: '<p>Short.</p>' },
      _embedded: {
        'wp:featuredmedia': [{ source_url: 'https://feelmyself.pl/wp-content/uploads/x.jpg' }],
        'wp:term': [
          [{ taxonomy: 'category', name: 'Wellness' }],
          [{ taxonomy: 'post_tag', name: 'Self-care' }, { taxonomy: 'post_tag', name: 'Tips' }],
        ],
      },
    };
    const fm = frontmatterFromPost(post);
    expect(fm.title).toBe('Test Post');
    expect(fm.slug).toBe('test-post');
    expect(fm.date).toBe('2024-01-15T10:00:00');
    expect(fm.featuredImage).toBe('https://feelmyself.pl/wp-content/uploads/x.jpg');
    expect(fm.categories).toEqual(['Wellness']);
    expect(fm.tags).toEqual(['Self-care', 'Tips']);
    expect(fm.locale).toBe('pl');
  });
});
```

- [ ] **Step 3: Run the test, confirm it fails**

```bash
npm test
```

Expected: error "Cannot find module './migrate-blog-from-wp.mjs'".

- [ ] **Step 4: Implement the script**

`scripts/migrate-blog-from-wp.mjs`:

```javascript
// scripts/migrate-blog-from-wp.mjs
//
// One-time migration: WP REST API → Astro content collection.
// Idempotent — re-running overwrites existing files.
//
// Usage: node scripts/migrate-blog-from-wp.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.resolve(__dirname, '../src/content/blog');
const WP_API = 'https://feelmyself.pl/wp-json/wp/v2/posts';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// Preserve embedded HTML for shortcodes / blocks turndown can't represent
turndown.keep(['iframe', 'figure', 'figcaption']);

export function wpPostToMarkdown(html) {
  return turndown.turndown(html);
}

export function frontmatterFromPost(post) {
  const featured = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const terms = post._embedded?.['wp:term'] ?? [];
  const categories = (terms.flat() ?? [])
    .filter((t) => t.taxonomy === 'category')
    .map((t) => t.name);
  const tags = (terms.flat() ?? [])
    .filter((t) => t.taxonomy === 'post_tag')
    .map((t) => t.name);

  return {
    title: decodeEntities(post.title.rendered),
    slug: post.slug,
    date: post.date,
    updated: post.modified !== post.date ? post.modified : undefined,
    excerpt: stripHtml(post.excerpt.rendered).trim() || undefined,
    featuredImage: featured,
    categories,
    tags,
    locale: 'pl',
  };
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(s) {
  return decodeEntities(s.replace(/<[^>]+>/g, ''));
}

async function fetchAllPosts() {
  let page = 1;
  const all = [];
  while (true) {
    const url = `${WP_API}?per_page=100&page=${page}&_embed=1&status=publish&orderby=date&order=desc`;
    const res = await fetch(url);
    if (res.status === 400 || res.status === 404) break; // out of pages
    if (!res.ok) throw new Error(`WP API error ${res.status} for page ${page}`);
    const posts = await res.json();
    if (!Array.isArray(posts) || posts.length === 0) break;
    all.push(...posts);
    page++;
    if (page > 50) {
      console.warn('Hit page 50 cap, stopping. If you have >5000 posts, raise the cap.');
      break;
    }
  }
  return all;
}

async function writePost(post) {
  const fm = frontmatterFromPost(post);
  const body = wpPostToMarkdown(post.content.rendered);
  const file = matter.stringify(body, fm);
  const outPath = path.join(OUT_DIR, `${fm.slug}.md`);
  await fs.writeFile(outPath, file, 'utf-8');
  return outPath;
}

async function main() {
  // Skip running on import (vitest)
  if (process.argv[1] !== __filename) return;

  await fs.mkdir(OUT_DIR, { recursive: true });
  console.log('Fetching posts from', WP_API);
  const posts = await fetchAllPosts();
  console.log(`Got ${posts.length} posts. Writing to ${OUT_DIR}`);

  for (const post of posts) {
    const outPath = await writePost(post);
    console.log(`  wrote ${path.basename(outPath)}`);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 5: Run the test, confirm it passes**

```bash
npm test
```

Expected: tests under `migrate-blog-from-wp` pass.

- [ ] **Step 6: Commit**

```bash
git add scripts/migrate-blog-from-wp.mjs scripts/migrate-blog-from-wp.test.ts package.json package-lock.json
git commit -m "feat(scripts): WP→Markdown blog migration script with tests"
```

### Task 3.3: Run the migration on 2 sample posts for fidelity check

- [ ] **Step 1: Run the script with a limit**

For the sample, temporarily edit the script's `fetchAllPosts` or run with a query param. Easiest: hit the API directly:

```bash
mkdir -p src/content/blog
node -e "
import('./scripts/migrate-blog-from-wp.mjs').then(async ({ wpPostToMarkdown, frontmatterFromPost }) => {
  const fs = await import('node:fs/promises');
  const matter = (await import('gray-matter')).default;
  const url = 'https://feelmyself.pl/wp-json/wp/v2/posts?per_page=2&_embed=1';
  const posts = await fetch(url).then(r => r.json());
  for (const p of posts) {
    const fm = frontmatterFromPost(p);
    const body = wpPostToMarkdown(p.content.rendered);
    const file = matter.stringify(body, fm);
    await fs.writeFile('src/content/blog/' + fm.slug + '.md', file, 'utf-8');
    console.log('wrote', fm.slug);
  }
});
"
```

Expected: 2 `.md` files in `src/content/blog/`.

- [ ] **Step 2: Inspect the output**

```bash
ls src/content/blog/
cat src/content/blog/<one-of-the-files>.md | head -50
```

Verify:
- Frontmatter has `title`, `slug`, `date`, `featuredImage`, `categories`, `tags`, `locale: pl`
- Body is Markdown (not HTML)
- Image URLs are absolute `https://feelmyself.pl/wp-content/uploads/...`
- Headings use `## ` etc.

- [ ] **Step 3: Cross-check against live site**

For each sample, visit `https://feelmyself.pl/<slug>/` (or wherever the post lives) and compare the rendered text. Note any conversion oddities (broken shortcodes, lost embeds, weird tables).

### Task 3.4: [BLAZEJ] Approve sample fidelity, then run full migration

- [ ] **Step 1: Show samples to Blazej**

Open the 2 sample `.md` files and the corresponding live URLs. Walk through:
- Does the text content match?
- Are images preserved?
- Any blocks/widgets that didn't convert (galleries, embeds, custom shortcodes)?

- [ ] **Step 2: If fidelity OK, run full migration**

```bash
node scripts/migrate-blog-from-wp.mjs
```

Expected: prints `wrote <slug>.md` for each post. If errors (e.g., a post fails to convert), the script will throw — investigate that post, adjust the script if needed, re-run (idempotent).

- [ ] **Step 3: Verify count**

```bash
ls src/content/blog/ | wc -l
```

Compare with live site post count (visit `https://feelmyself.pl/wp-json/wp/v2/posts?per_page=1` — `X-WP-Total` header gives total).

- [ ] **Step 4: Verify they typecheck against the schema**

```bash
npm run typecheck
```

Expected: no errors. If schema validation errors appear (e.g., a post's `date` is malformed), fix the schema or the script.

- [ ] **Step 5: Commit**

```bash
git add src/content/blog/
git commit -m "feat(content): migrate all WP blog posts to Markdown"
```

(This commit will be large — that's expected.)

### Task 3.5: Create blog components — PostCard

**Files:**
- Create: `src/components/blog/PostCard.astro`

- [ ] **Step 1: Write the component**

```astro
---
// src/components/blog/PostCard.astro
import Image from '../primitives/Image.astro';
import type { CollectionEntry } from 'astro:content';

interface Props {
  post: CollectionEntry<'blog'>;
}

const { post } = Astro.props;
const { title, excerpt, date, featuredImage } = post.data;
---
<article class="group">
  <a href={`/blog/${post.slug}`} class="block">
    {featuredImage && (
      <Image
        src={featuredImage}
        alt={title}
        width={600}
        height={400}
        class="w-full aspect-[3/2] object-cover rounded mb-4 transition-opacity group-hover:opacity-90"
      />
    )}
    <h3 class="text-xl font-semibold group-hover:text-brand-primary transition-colors">{title}</h3>
    {excerpt && <p class="mt-2 text-text-muted line-clamp-3">{excerpt}</p>}
    <time class="mt-2 block text-sm text-text-muted" datetime={date.toISOString()}>
      {date.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}
    </time>
  </a>
</article>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/blog/PostCard.astro
git commit -m "feat(blog): PostCard component"
```

### Task 3.6: Create blog components — PostMeta and PostBody

**Files:**
- Create: `src/components/blog/PostMeta.astro`
- Create: `src/components/blog/PostBody.astro`

- [ ] **Step 1: PostMeta**

```astro
---
// src/components/blog/PostMeta.astro
interface Props {
  date: Date;
  updated?: Date;
  categories?: string[];
}

const { date, updated, categories = [] } = Astro.props;
---
<div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
  <time datetime={date.toISOString()}>
    {date.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}
  </time>
  {updated && (
    <span>
      Aktualizacja:{' '}
      <time datetime={updated.toISOString()}>
        {updated.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}
      </time>
    </span>
  )}
  {categories.length > 0 && (
    <span>
      {categories.map((c) => (
        <span class="inline-block px-2 py-0.5 mr-1 bg-brand-primary/10 text-brand-primary rounded text-xs">{c}</span>
      ))}
    </span>
  )}
</div>
```

- [ ] **Step 2: PostBody (typography wrapper)**

```astro
---
// src/components/blog/PostBody.astro
---
<div class="prose prose-lg max-w-none prose-headings:font-semibold prose-a:text-brand-primary hover:prose-a:text-brand-secondary">
  <slot />
</div>
```

This requires the Tailwind Typography plugin:

```bash
npm install -D @tailwindcss/typography
```

Update `tailwind.config.mjs` plugins:

```javascript
import typography from '@tailwindcss/typography';

export default {
  // ...
  plugins: [typography],
};
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/blog/PostMeta.astro src/components/blog/PostBody.astro tailwind.config.mjs package.json package-lock.json
git commit -m "feat(blog): PostMeta + PostBody components, add tailwind typography plugin"
```

### Task 3.7: Create BlogPostLayout

**Files:**
- Create: `src/layouts/BlogPostLayout.astro`

- [ ] **Step 1: Write the layout**

```astro
---
// src/layouts/BlogPostLayout.astro
import BaseLayout from './BaseLayout.astro';
import Container from '../components/primitives/Container.astro';
import Image from '../components/primitives/Image.astro';
import PostMeta from '../components/blog/PostMeta.astro';
import PostBody from '../components/blog/PostBody.astro';
import type { CollectionEntry } from 'astro:content';

interface Props {
  post: CollectionEntry<'blog'>;
}

const { post } = Astro.props;
const { title, excerpt, seoTitle, seoDescription, date, updated, featuredImage, categories } = post.data;
---
<BaseLayout
  title={seoTitle ?? title}
  description={seoDescription ?? excerpt}
  noindex
>
  <article class="py-8">
    <Container size="md">
      <header class="mb-8">
        <h1 class="text-4xl font-bold mb-4">{title}</h1>
        <PostMeta date={date} updated={updated} categories={categories} />
      </header>
      {featuredImage && (
        <Image
          src={featuredImage}
          alt={title}
          width={1200}
          height={630}
          class="w-full aspect-video object-cover rounded mb-8"
        />
      )}
      <PostBody>
        <slot />
      </PostBody>
    </Container>
  </article>
</BaseLayout>
```

(`noindex` stays on while on staging; removed in cutover.)

- [ ] **Step 2: Commit**

```bash
git add src/layouts/BlogPostLayout.astro
git commit -m "feat(blog): BlogPostLayout"
```

### Task 3.8: Create blog routes — index and [slug]

**Files:**
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[slug].astro`

- [ ] **Step 1: Blog index**

```astro
---
// src/pages/blog/index.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import Container from '../../components/primitives/Container.astro';
import PostCard from '../../components/blog/PostCard.astro';
import { getCollection } from 'astro:content';

const allPosts = await getCollection('blog', ({ data }) => !data.draft);
const sorted = allPosts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---
<BaseLayout title="Blog — FeelMySelf" description="Artykuły o samopoczuciu, wellness i self-care." noindex>
  <Container>
    <header class="py-8">
      <h1 class="text-4xl font-bold">Blog</h1>
    </header>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
      {sorted.map((post) => <PostCard post={post} />)}
    </div>
  </Container>
</BaseLayout>
```

- [ ] **Step 2: Blog [slug]**

```astro
---
// src/pages/blog/[slug].astro
import { getCollection } from 'astro:content';
import BlogPostLayout from '../../layouts/BlogPostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---
<BlogPostLayout post={post}>
  <Content />
</BlogPostLayout>
```

- [ ] **Step 3: Verify dev server**

```bash
npm run dev
```

Visit:
- `http://localhost:4321/blog` — should list all posts as cards
- `http://localhost:4321/blog/<some-slug>` — should render full post with Header/Footer/Hero image/body

Stop dev.

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: build creates one HTML file per post in `dist/blog/<slug>/index.html`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/blog/
git commit -m "feat(blog): index page (grid of cards) + dynamic [slug] route"
```

### Task 3.9: Workstream 3 wrap — visual parity check, CHANGELOG, checkpoint

- [ ] **Step 1: Push and wait for staging deploy**

```bash
git push
```

Wait for CF Pages to deploy. Visit `https://stage.feelmyself.pl/blog/`.

- [ ] **Step 2: Side-by-side review of 3-5 posts**

Open `https://feelmyself.pl/<some-post-slug>/` and `https://stage.feelmyself.pl/blog/<same-slug>/` side-by-side. For each:
- Title matches
- Date matches
- Body content matches (no missing paragraphs)
- Images load (proxied from WP)
- Visual layout close enough to live site

Record mismatches. Common issues: WP shortcodes (`[gallery]`, `[caption]`, embeds) don't convert cleanly. Decide per-issue: (a) extend the migration script, (b) hand-fix the affected `.md` file, (c) accept and move on.

- [ ] **Step 3: Update CHANGELOG**

Append:

```markdown
- Blog content collection schema (`src/content/config.ts`) — PL-only,
  EN-ready.
- WP→Markdown blog migration script (`scripts/migrate-blog-from-wp.mjs`)
  with unit tests on conversion + frontmatter extraction.
- All WP blog posts migrated to `src/content/blog/`.
- Blog UI: PostCard, PostMeta, PostBody components; BlogPostLayout;
  `/blog` index (grid of cards) and `/blog/[slug]` dynamic routes.
- Tailwind Typography plugin for prose rendering.
```

- [ ] **Step 4: Commit, push**

```bash
git add CHANGELOG.md
git commit -m "docs: CHANGELOG entry for Workstream 3 (blog migration + rendering)"
git push
```

- [ ] **Step 5: Checkpoint with Blazej**

Confirm:
- Blog index renders all posts
- 3-5 random posts spot-checked vs. live
- Any conversion issues are catalogued; decision made on whether to fix or accept

If green, proceed to Workstream 4.

---

## Workstream 4 — Product / Category Integration

**Outcome:** Read-only product and category pages render with live Woo Store API data, "Buy" buttons deep-link to live Woo, all current `/produkt/<slug>` and `/kategoria-produktu/<slug>` URLs preserved.

### Task 4.1: Write src/lib/woo.ts (test first)

**Files:**
- Create: `src/lib/woo.test.ts`
- Create: `src/lib/woo.ts`

- [ ] **Step 1: Write failing tests**

`src/lib/woo.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAllProducts, fetchAllCategories, normalizeProduct } from './woo';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('normalizeProduct', () => {
  it('extracts core fields from a Woo Store API product', () => {
    const raw = {
      id: 42,
      name: 'Aromatherapy Oil',
      slug: 'aromatherapy-oil',
      permalink: 'https://feelmyself.pl/produkt/aromatherapy-oil/',
      description: '<p>Lovely oil.</p>',
      short_description: '<p>Short.</p>',
      sku: 'AO-001',
      prices: {
        currency_code: 'PLN',
        currency_symbol: 'zł',
        regular_price: '4900',
        sale_price: '3900',
        price: '3900',
        currency_minor_unit: 2,
      },
      on_sale: true,
      is_in_stock: true,
      images: [
        { src: 'https://feelmyself.pl/wp-content/uploads/2024/oil1.jpg', alt: 'Oil 1' },
        { src: 'https://feelmyself.pl/wp-content/uploads/2024/oil2.jpg', alt: 'Oil 2' },
      ],
      categories: [{ id: 5, name: 'Olejki', slug: 'olejki' }],
    };
    const p = normalizeProduct(raw);
    expect(p.id).toBe(42);
    expect(p.slug).toBe('aromatherapy-oil');
    expect(p.permalink).toBe('https://feelmyself.pl/produkt/aromatherapy-oil/');
    expect(p.priceMinor).toBe(3900);
    expect(p.regularPriceMinor).toBe(4900);
    expect(p.currency).toBe('PLN');
    expect(p.onSale).toBe(true);
    expect(p.inStock).toBe(true);
    expect(p.images).toHaveLength(2);
    expect(p.images[0].src).toBe('https://feelmyself.pl/wp-content/uploads/2024/oil1.jpg');
    expect(p.categories[0].slug).toBe('olejki');
  });
});

describe('fetchAllProducts', () => {
  it('paginates through API and returns normalized products', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([
        { id: 1, name: 'A', slug: 'a', permalink: '...', description: '', short_description: '',
          sku: '', prices: { currency_code: 'PLN', currency_symbol: 'zł', regular_price: '100',
          sale_price: '100', price: '100', currency_minor_unit: 2 }, on_sale: false,
          is_in_stock: true, images: [], categories: [] },
      ]), { status: 200 }))
      .mockResolvedValueOnce(new Response('[]', { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    const products = await fetchAllProducts('https://feelmyself.pl/wp-json/wc/store/v1');
    expect(products).toHaveLength(1);
    expect(products[0].slug).toBe('a');
    expect(fetchMock).toHaveBeenCalledTimes(2); // page 1 + empty page 2 = stop
  });
});

describe('fetchAllCategories', () => {
  it('returns normalized categories', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify([
        { id: 5, name: 'Olejki', slug: 'olejki', description: '', count: 10,
          image: { src: 'https://feelmyself.pl/wp-content/uploads/cat-olejki.jpg', alt: '' } },
      ]), { status: 200 })
    ));

    const cats = await fetchAllCategories('https://feelmyself.pl/wp-json/wc/store/v1');
    expect(cats[0].slug).toBe('olejki');
    expect(cats[0].image?.src).toContain('cat-olejki.jpg');
  });
});
```

- [ ] **Step 2: Run tests, confirm failure**

```bash
npm test
```

Expected: errors "Cannot find module './woo'".

- [ ] **Step 3: Implement src/lib/woo.ts**

```typescript
// src/lib/woo.ts

const DEFAULT_API_BASE = process.env.WOO_API_BASE ?? 'https://feelmyself.pl/wp-json/wc/store/v1';

export interface Money {
  amountMinor: number;
  currency: string;
  symbol: string;
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductCategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;       // HTML
  shortDescription: string;  // HTML
  sku: string;
  priceMinor: number;
  regularPriceMinor: number;
  currency: string;
  currencySymbol: string;
  onSale: boolean;
  inStock: boolean;
  images: ProductImage[];
  categories: ProductCategoryRef[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  image?: ProductImage;
}

export function normalizeProduct(raw: any): Product {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    permalink: raw.permalink,
    description: raw.description ?? '',
    shortDescription: raw.short_description ?? '',
    sku: raw.sku ?? '',
    priceMinor: parseInt(raw.prices.price, 10),
    regularPriceMinor: parseInt(raw.prices.regular_price, 10),
    currency: raw.prices.currency_code,
    currencySymbol: raw.prices.currency_symbol,
    onSale: !!raw.on_sale,
    inStock: !!raw.is_in_stock,
    images: (raw.images ?? []).map((img: any) => ({ src: img.src, alt: img.alt ?? '' })),
    categories: (raw.categories ?? []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })),
  };
}

function normalizeCategory(raw: any): Category {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? '',
    count: raw.count ?? 0,
    image: raw.image?.src ? { src: raw.image.src, alt: raw.image.alt ?? '' } : undefined,
  };
}

export async function fetchAllProducts(apiBase = DEFAULT_API_BASE): Promise<Product[]> {
  const all: Product[] = [];
  let page = 1;
  while (page <= 100) {
    const url = `${apiBase}/products?per_page=100&page=${page}&orderby=date&order=desc`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Woo API ${res.status} on /products page ${page}`);
    }
    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) break;
    all.push(...items.map(normalizeProduct));
    page++;
  }
  return all;
}

export async function fetchAllCategories(apiBase = DEFAULT_API_BASE): Promise<Category[]> {
  const url = `${apiBase}/products/categories?per_page=100`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Woo API ${res.status} on /products/categories`);
  }
  const items = await res.json();
  return items.map(normalizeCategory);
}

export async function fetchProductBySlug(slug: string, apiBase = DEFAULT_API_BASE): Promise<Product | null> {
  const url = `${apiBase}/products?slug=${encodeURIComponent(slug)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Woo API ${res.status} on /products?slug=${slug}`);
  const items = await res.json();
  if (!Array.isArray(items) || items.length === 0) return null;
  return normalizeProduct(items[0]);
}

export function formatPrice(p: Pick<Product, 'priceMinor' | 'currencySymbol'>): string {
  const major = (p.priceMinor / 100).toFixed(2);
  return `${major.replace('.', ',')} ${p.currencySymbol}`;
}
```

- [ ] **Step 4: Run tests, confirm pass**

```bash
npm test
```

Expected: woo tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/woo.ts src/lib/woo.test.ts
git commit -m "feat(woo): typed Woo Store API client (products, categories, normalize)"
```

### Task 4.2: Add product/category collections to content config

**Files:**
- Modify: `src/content/config.ts`

- [ ] **Step 1: Update config to include products and categories as build-time loaders**

Astro Content Collections (v4) support custom loaders. We use the `loader` API:

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { fetchAllProducts, fetchAllCategories } from '../lib/woo';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    excerpt: z.string().optional(),
    featuredImage: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    locale: z.enum(['pl']).default('pl'),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

// Products and categories use Astro's data loader
const products = defineCollection({
  type: 'data',
  loader: async () => {
    const items = await fetchAllProducts();
    return items.map((p) => ({ id: String(p.id), ...p }));
  },
  schema: z.object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
    slug: z.string(),
    permalink: z.string(),
    description: z.string(),
    shortDescription: z.string(),
    sku: z.string(),
    priceMinor: z.number(),
    regularPriceMinor: z.number(),
    currency: z.string(),
    currencySymbol: z.string(),
    onSale: z.boolean(),
    inStock: z.boolean(),
    images: z.array(z.object({ src: z.string(), alt: z.string() })),
    categories: z.array(z.object({ id: z.number(), name: z.string(), slug: z.string() })),
  }),
});

const categories = defineCollection({
  type: 'data',
  loader: async () => {
    const items = await fetchAllCategories();
    return items.map((c) => ({ id: String(c.id), ...c }));
  },
  schema: z.object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    count: z.number(),
    image: z.object({ src: z.string(), alt: z.string() }).optional(),
  }),
});

export const collections = { blog, products, categories };
```

Note: Astro's `loader` API for Content Collections is in v4.14+. If the installed Astro version doesn't support it, fall back to fetching directly in `getStaticPaths()` (which is what we do in Tasks 4.5 and 4.6). The collection definition is still useful as a typed schema reference.

- [ ] **Step 2: Verify typecheck**

```bash
npm run typecheck
```

If `loader` is not supported by the installed Astro version, simplify the products/categories definitions to bare schemas without loaders, and rely on `getStaticPaths()` calling `fetchAllProducts()` directly.

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "feat(content): products + categories collections backed by Woo Store API"
```

### Task 4.3: Create product components — PriceTag, BuyButton

**Files:**
- Create: `src/components/product/PriceTag.astro`
- Create: `src/components/product/BuyButton.astro`

- [ ] **Step 1: PriceTag**

```astro
---
// src/components/product/PriceTag.astro
import { formatPrice } from '../../lib/woo';
import type { Product } from '../../lib/woo';

interface Props {
  product: Pick<Product, 'priceMinor' | 'regularPriceMinor' | 'currencySymbol' | 'onSale'>;
}

const { product } = Astro.props;
const isDiscounted = product.onSale && product.regularPriceMinor > product.priceMinor;
---
<div class="flex items-baseline gap-2">
  {isDiscounted ? (
    <>
      <span class="text-2xl font-semibold text-brand-primary">{formatPrice(product)}</span>
      <span class="text-base text-text-muted line-through">{formatPrice({ priceMinor: product.regularPriceMinor, currencySymbol: product.currencySymbol })}</span>
    </>
  ) : (
    <span class="text-2xl font-semibold text-brand-primary">{formatPrice(product)}</span>
  )}
</div>
```

- [ ] **Step 2: BuyButton (deep-link to live Woo)**

```astro
---
// src/components/product/BuyButton.astro
import Button from '../primitives/Button.astro';
import type { Product } from '../../lib/woo';

interface Props {
  product: Pick<Product, 'permalink' | 'inStock'>;
  size?: 'sm' | 'md' | 'lg';
}

const { product, size = 'md' } = Astro.props;
---
{product.inStock ? (
  <Button href={product.permalink} size={size} variant="primary" rel="noopener" target="_self">
    Kup teraz
  </Button>
) : (
  <Button size={size} variant="ghost" type="button" class="cursor-not-allowed opacity-60">
    Niedostępny
  </Button>
)}
```

(Note: `target="_self"` because we want the user to land on live Woo and complete checkout there. Phase 2 will swap this for an in-app cart action.)

- [ ] **Step 3: Commit**

```bash
git add src/components/product/PriceTag.astro src/components/product/BuyButton.astro
git commit -m "feat(product): PriceTag + BuyButton (deep-links to live Woo in Phase 1)"
```

### Task 4.4: Create product components — ProductCard, ProductGallery

**Files:**
- Create: `src/components/product/ProductCard.astro`
- Create: `src/components/product/ProductGallery.astro`

- [ ] **Step 1: ProductCard**

```astro
---
// src/components/product/ProductCard.astro
import Image from '../primitives/Image.astro';
import PriceTag from './PriceTag.astro';
import type { Product } from '../../lib/woo';

interface Props {
  product: Product;
}

const { product } = Astro.props;
const cover = product.images[0];
---
<article class="group">
  <a href={`/produkt/${product.slug}`} class="block">
    {cover && (
      <Image
        src={cover.src}
        alt={cover.alt || product.name}
        width={400}
        height={400}
        class="w-full aspect-square object-cover rounded mb-3 transition-opacity group-hover:opacity-90"
      />
    )}
    <h3 class="font-semibold group-hover:text-brand-primary transition-colors line-clamp-2">{product.name}</h3>
    <div class="mt-2">
      <PriceTag product={product} />
    </div>
  </a>
</article>
```

- [ ] **Step 2: ProductGallery (multi-image carousel — keep simple in Phase 1)**

```astro
---
// src/components/product/ProductGallery.astro
import Image from '../primitives/Image.astro';
import type { ProductImage } from '../../lib/woo';

interface Props {
  images: ProductImage[];
  alt: string;
}

const { images, alt } = Astro.props;
const main = images[0];
const thumbs = images.slice(1);
---
<div class="space-y-3">
  {main && (
    <Image
      src={main.src}
      alt={main.alt || alt}
      width={800}
      height={800}
      class="w-full aspect-square object-cover rounded"
    />
  )}
  {thumbs.length > 0 && (
    <div class="grid grid-cols-4 gap-2">
      {thumbs.map((img) => (
        <Image
          src={img.src}
          alt={img.alt || alt}
          width={150}
          height={150}
          class="w-full aspect-square object-cover rounded"
        />
      ))}
    </div>
  )}
</div>
```

(No JS-driven lightbox/zoom in Phase 1. Add as an island in Phase 2 if needed.)

- [ ] **Step 3: Commit**

```bash
git add src/components/product/ProductCard.astro src/components/product/ProductGallery.astro
git commit -m "feat(product): ProductCard + ProductGallery (no-JS gallery in Phase 1)"
```

### Task 4.5: Create ProductLayout

**Files:**
- Create: `src/layouts/ProductLayout.astro`

- [ ] **Step 1: Write the layout**

```astro
---
// src/layouts/ProductLayout.astro
import BaseLayout from './BaseLayout.astro';
import Container from '../components/primitives/Container.astro';
import ProductGallery from '../components/product/ProductGallery.astro';
import PriceTag from '../components/product/PriceTag.astro';
import BuyButton from '../components/product/BuyButton.astro';
import type { Product } from '../lib/woo';

interface Props {
  product: Product;
}

const { product } = Astro.props;
---
<BaseLayout
  title={`${product.name} — FeelMySelf`}
  description={product.shortDescription.replace(/<[^>]+>/g, '').slice(0, 160)}
  canonical={product.permalink}
  noindex
>
  <article class="py-8">
    <Container>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery images={product.images} alt={product.name} />
        <div>
          <h1 class="text-3xl font-bold mb-4">{product.name}</h1>
          <div class="mb-6"><PriceTag product={product} /></div>
          <div class="prose mb-8" set:html={product.shortDescription} />
          <BuyButton product={product} size="lg" />
          <div class="prose mt-12" set:html={product.description} />
        </div>
      </div>
    </Container>
  </article>
</BaseLayout>
```

(Canonical points at the live Woo URL — staging shouldn't compete with prod even if accidentally indexed.)

- [ ] **Step 2: Commit**

```bash
git add src/layouts/ProductLayout.astro
git commit -m "feat(product): ProductLayout (canonical to live Woo, noindex on stage)"
```

### Task 4.6: Create produkt/[slug] page

**Files:**
- Create: `src/pages/produkt/[slug].astro`

- [ ] **Step 1: Write the route**

```astro
---
// src/pages/produkt/[slug].astro
import ProductLayout from '../../layouts/ProductLayout.astro';
import { fetchAllProducts } from '../../lib/woo';

export async function getStaticPaths() {
  const products = await fetchAllProducts();
  return products.map((product) => ({
    params: { slug: product.slug },
    props: { product },
  }));
}

const { product } = Astro.props;
---
<ProductLayout product={product} />
```

- [ ] **Step 2: Verify dev server**

```bash
npm run dev
```

Visit `http://localhost:4321/produkt/<some-slug>` (use a slug from `https://feelmyself.pl/produkt/...`). Should render product page with image, price, "Kup teraz" button linking to live Woo.

Stop dev.

- [ ] **Step 3: Commit**

```bash
git add src/pages/produkt/
git commit -m "feat(product): /produkt/[slug] dynamic route"
```

### Task 4.7: Create kategoria-produktu/[slug] page

**Files:**
- Create: `src/pages/kategoria-produktu/[slug].astro`

- [ ] **Step 1: Write the route**

```astro
---
// src/pages/kategoria-produktu/[slug].astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import Container from '../../components/primitives/Container.astro';
import ProductCard from '../../components/product/ProductCard.astro';
import { fetchAllProducts, fetchAllCategories } from '../../lib/woo';

export async function getStaticPaths() {
  const [categories, products] = await Promise.all([
    fetchAllCategories(),
    fetchAllProducts(),
  ]);

  return categories.map((category) => ({
    params: { slug: category.slug },
    props: {
      category,
      products: products.filter((p) =>
        p.categories.some((c) => c.slug === category.slug)
      ),
    },
  }));
}

const { category, products } = Astro.props;
---
<BaseLayout
  title={`${category.name} — FeelMySelf`}
  description={category.description.replace(/<[^>]+>/g, '').slice(0, 160) || `Produkty z kategorii ${category.name}`}
  noindex
>
  <Container>
    <header class="py-8">
      <h1 class="text-4xl font-bold">{category.name}</h1>
      {category.description && (
        <div class="prose mt-4" set:html={category.description} />
      )}
    </header>
    {products.length === 0 ? (
      <p class="py-8 text-text-muted">Brak produktów w tej kategorii.</p>
    ) : (
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-16">
        {products.map((p) => <ProductCard product={p} />)}
      </div>
    )}
  </Container>
</BaseLayout>
```

- [ ] **Step 2: Verify dev server**

```bash
npm run dev
```

Visit `http://localhost:4321/kategoria-produktu/<some-slug>`. Should render category page with grid of products. Click a product card → goes to `/produkt/<slug>` (Astro page, not live site).

Stop dev.

- [ ] **Step 3: Commit**

```bash
git add src/pages/kategoria-produktu/
git commit -m "feat(product): /kategoria-produktu/[slug] dynamic route"
```

### Task 4.8: Workstream 4 wrap — verify, CHANGELOG, checkpoint

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: build succeeds. Look at the build log — should print "Generated X products, Y categories" or similar Astro page count info. Verify dist contains `dist/produkt/<slug>/index.html` files.

- [ ] **Step 2: Push and wait for staging deploy**

```bash
git push
```

- [ ] **Step 3: Side-by-side review of 3-5 product pages and 2 category pages**

Open `https://feelmyself.pl/produkt/<slug>/` and `https://stage.feelmyself.pl/produkt/<slug>/`. For each:
- Title matches
- Price matches (and shows discount strikethrough if on sale)
- Images load
- Description renders (HTML preserved correctly)
- "Kup teraz" button links to live Woo product page
- Stock state matches

Same for category pages.

- [ ] **Step 4: Update CHANGELOG**

Append:

```markdown
- Woo Store API client (`src/lib/woo.ts`) — typed product/category fetch
  with build-time normalization, unit-tested.
- Product UI: ProductCard, ProductGallery (no-JS), PriceTag, BuyButton
  (deep-link to live Woo).
- ProductLayout with canonical URL pointing at live Woo product page.
- Routes: `/produkt/[slug]` and `/kategoria-produktu/[slug]` —
  one static page per product/category, generated from live Woo data
  at build time.
```

- [ ] **Step 5: Commit, push, checkpoint**

```bash
git add CHANGELOG.md
git commit -m "docs: CHANGELOG entry for Workstream 4 (product/category integration)"
git push
```

Confirm with Blazej:
- 3-5 product pages render correctly
- 2 category pages render correctly
- "Kup teraz" reliably lands on live Woo
- Build time still under 2 minutes (`gh run view` to inspect CI duration)

If build time creeps over 2 min, consider caching `fetchAllProducts` result locally (Phase 3 work — but flag now if it's already a problem).

Proceed to Workstream 5 when green.

---

## Workstream 5 — Page Templates, SEO, Visual Parity

**Outcome:** Marketing pages (homepage, about, contact, etc.) render with visual parity to the live site; SEO essentials (canonical, meta, JSON-LD) in place; URL parity verified by automated check; final visual walkthrough complete.

### Task 5.1: Create PageLayout for static marketing pages

**Files:**
- Create: `src/layouts/PageLayout.astro`

- [ ] **Step 1: Write the layout**

```astro
---
// src/layouts/PageLayout.astro
import BaseLayout from './BaseLayout.astro';
import Container from '../components/primitives/Container.astro';

interface Props {
  title: string;
  description?: string;
  heading?: string;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const { title, description, heading, containerSize = 'md' } = Astro.props;
---
<BaseLayout title={title} description={description} noindex>
  <article class="py-8">
    <Container size={containerSize}>
      {heading && <h1 class="text-4xl font-bold mb-8">{heading}</h1>}
      <div class="prose prose-lg max-w-none">
        <slot />
      </div>
    </Container>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/PageLayout.astro
git commit -m "feat(layout): PageLayout for static marketing pages"
```

### Task 5.2: Migrate the homepage with full visual parity

**Files:**
- Modify: `src/pages/index.astro`
- Possibly: `src/components/home/HeroBlock.astro`, `src/components/home/FeaturedCategories.astro`, etc. (if homepage has distinct sections)

- [ ] **Step 1: Audit live homepage structure**

Open `https://feelmyself.pl/` and `reference/scraped-pages/feelmyself.pl/index.html`. Identify the sections (hero, featured categories, featured products, blog teaser, newsletter signup, etc.).

- [ ] **Step 2: Build per-section components**

Example for a hero block — adapt to the actual live site:

`src/components/home/HeroBlock.astro`:

```astro
---
// src/components/home/HeroBlock.astro
import Container from '../primitives/Container.astro';
import Button from '../primitives/Button.astro';
import Image from '../primitives/Image.astro';

interface Props {
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaHref: string;
  imageSrc: string;
  imageAlt: string;
}

const { title, subtitle, ctaText, ctaHref, imageSrc, imageAlt } = Astro.props;
---
<section class="bg-brand-primary/5 py-12 md:py-20">
  <Container>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div>
        <h1 class="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        {subtitle && <p class="text-lg text-text-muted mb-6">{subtitle}</p>}
        <Button variant="primary" size="lg" href={ctaHref}>{ctaText}</Button>
      </div>
      <Image src={imageSrc} alt={imageAlt} width={800} height={600} class="w-full rounded" />
    </div>
  </Container>
</section>
```

Repeat for each section the live homepage has (FeaturedCategories, FeaturedProducts, BlogTeaser, etc.).

- [ ] **Step 3: Compose homepage**

`src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import HeroBlock from '../components/home/HeroBlock.astro';
import Container from '../components/primitives/Container.astro';
import ProductCard from '../components/product/ProductCard.astro';
import PostCard from '../components/blog/PostCard.astro';
import { fetchAllProducts } from '../lib/woo';
import { getCollection } from 'astro:content';

const products = await fetchAllProducts();
const featured = products.filter((p) => p.onSale).slice(0, 4);

const allPosts = await getCollection('blog', ({ data }) => !data.draft);
const recentPosts = allPosts
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 3);
---
<BaseLayout title="FeelMySelf — Wellness, Self-care, Aromaterapia" description="Naturalne kosmetyki i akcesoria do samopoczucia." noindex>
  <HeroBlock
    title="Tytuł hero z live site"
    subtitle="Podtytuł"
    ctaText="Sklep"
    ctaHref="/sklep"
    imageSrc="https://feelmyself.pl/wp-content/uploads/.../hero.jpg"
    imageAlt="Hero"
  />

  {featured.length > 0 && (
    <section class="py-12">
      <Container>
        <h2 class="text-3xl font-bold mb-6">Promocje</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((p) => <ProductCard product={p} />)}
        </div>
      </Container>
    </section>
  )}

  {recentPosts.length > 0 && (
    <section class="py-12 bg-brand-primary/5">
      <Container>
        <h2 class="text-3xl font-bold mb-6">Z bloga</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recentPosts.map((post) => <PostCard post={post} />)}
        </div>
      </Container>
    </section>
  )}
</BaseLayout>
```

(Replace placeholder text/URLs with actual values from the live homepage.)

- [ ] **Step 4: Verify dev server**

```bash
npm run dev
```

Compare side-by-side with live homepage. Iterate on the components until visual match is acceptable.

Stop dev.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/ src/pages/index.astro
git commit -m "feat(home): homepage with hero + featured products + recent blog teaser"
```

### Task 5.3: Migrate static pages (about, contact, etc.) via [...slug].astro

**Files:**
- Create: `src/pages/[...slug].astro`
- Create one Markdown file per static page in `src/content/pages/` (or as `.astro` files directly under `src/pages/`)

**Decision point:** are static pages (`/o-nas`, `/kontakt`, `/regulamin`, etc.) authored as Markdown content (one file per page) or as individual `.astro` files? Markdown wins if there are >5 such pages and they're mostly text. `.astro` wins if each is custom-laid-out.

- [ ] **Step 1: Inventory static pages on live site**

Browse `https://feelmyself.pl/` and list every URL that's not blog/product/category/cart/checkout/account. Common: `/o-nas` (about), `/kontakt` (contact), `/regulamin` (terms), `/polityka-prywatnosci` (privacy), `/dostawa-i-zwroty` (shipping/returns), `/faq`.

- [ ] **Step 2: Add a `pages` collection (Markdown route)**

Edit `src/content/config.ts`, add:

```typescript
const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    heading: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    locale: z.enum(['pl']).default('pl'),
  }),
});

export const collections = { blog, products, categories, pages };
```

- [ ] **Step 3: Migrate static page content**

For each inventoried page, create `src/content/pages/<slug>.md`. Example for `/o-nas`:

```markdown
---
title: O nas
slug: o-nas
heading: O FeelMySelf
description: Poznaj historię i misję FeelMySelf.
locale: pl
---

(Body text from live site, in Markdown. Hand-port — these are typically <500 words each.)
```

Same approach for `/kontakt`, `/regulamin`, etc.

- [ ] **Step 4: Create catch-all route**

`src/pages/[...slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import PageLayout from '../layouts/PageLayout.astro';

export async function getStaticPaths() {
  const pages = await getCollection('pages');
  return pages.map((page) => ({
    params: { slug: page.slug },
    props: { page },
  }));
}

const { page } = Astro.props;
const { Content } = await page.render();
---
<PageLayout
  title={page.data.seoTitle ?? page.data.title}
  description={page.data.seoDescription ?? page.data.description}
  heading={page.data.heading ?? page.data.title}
>
  <Content />
</PageLayout>
```

- [ ] **Step 5: Verify dev server**

```bash
npm run dev
```

Visit each migrated page (e.g., `http://localhost:4321/o-nas`). Compare with live site.

Stop dev.

- [ ] **Step 6: Commit**

```bash
git add src/content/config.ts src/content/pages/ src/pages/[...slug].astro
git commit -m "feat(pages): migrate static marketing pages via content collection + catch-all route"
```

### Task 5.4: Create src/lib/seo.ts (helpers for canonical, OG, JSON-LD)

**Files:**
- Create: `src/lib/seo.test.ts`
- Create: `src/lib/seo.ts`

- [ ] **Step 1: Write failing tests**

`src/lib/seo.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { canonicalUrl, productSchema, articleSchema, breadcrumbSchema } from './seo';

const SITE = 'https://feelmyself.pl';

describe('canonicalUrl', () => {
  it('strips trailing slash and prefixes site origin', () => {
    expect(canonicalUrl('/produkt/foo/', SITE)).toBe('https://feelmyself.pl/produkt/foo');
    expect(canonicalUrl('/blog/abc', SITE)).toBe('https://feelmyself.pl/blog/abc');
  });
});

describe('productSchema', () => {
  it('builds JSON-LD Product schema', () => {
    const json = productSchema({
      name: 'Oil',
      description: 'Lovely',
      image: 'https://feelmyself.pl/x.jpg',
      sku: 'AO-001',
      url: 'https://feelmyself.pl/produkt/oil',
      priceMinor: 3900,
      currency: 'PLN',
      inStock: true,
    });
    expect(json['@type']).toBe('Product');
    expect(json.offers.price).toBe('39.00');
    expect(json.offers.availability).toBe('https://schema.org/InStock');
  });
});

describe('articleSchema', () => {
  it('builds JSON-LD Article schema', () => {
    const json = articleSchema({
      headline: 'Title',
      datePublished: new Date('2024-01-15'),
      dateModified: new Date('2024-01-16'),
      url: 'https://feelmyself.pl/blog/x',
      image: 'https://feelmyself.pl/img.jpg',
    });
    expect(json['@type']).toBe('Article');
    expect(json.headline).toBe('Title');
  });
});

describe('breadcrumbSchema', () => {
  it('builds BreadcrumbList', () => {
    const json = breadcrumbSchema([
      { name: 'Home', url: 'https://feelmyself.pl/' },
      { name: 'Sklep', url: 'https://feelmyself.pl/sklep' },
    ]);
    expect(json['@type']).toBe('BreadcrumbList');
    expect(json.itemListElement).toHaveLength(2);
    expect(json.itemListElement[0].position).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests, confirm failure**

```bash
npm test
```

Expected: error "Cannot find module './seo'".

- [ ] **Step 3: Implement src/lib/seo.ts**

```typescript
// src/lib/seo.ts

export function canonicalUrl(pathname: string, siteOrigin: string): string {
  const stripped = pathname.replace(/\/$/, '') || '/';
  return new URL(stripped, siteOrigin).toString().replace(/\/$/, '');
}

interface ProductSchemaInput {
  name: string;
  description: string;
  image: string;
  sku: string;
  url: string;
  priceMinor: number;
  currency: string;
  inStock: boolean;
}

export function productSchema(p: ProductSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description.replace(/<[^>]+>/g, '').slice(0, 5000),
    image: p.image,
    sku: p.sku,
    offers: {
      '@type': 'Offer',
      url: p.url,
      priceCurrency: p.currency,
      price: (p.priceMinor / 100).toFixed(2),
      availability: p.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
}

interface ArticleSchemaInput {
  headline: string;
  datePublished: Date;
  dateModified?: Date;
  url: string;
  image?: string;
  authorName?: string;
}

export function articleSchema(a: ArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.headline,
    datePublished: a.datePublished.toISOString(),
    dateModified: (a.dateModified ?? a.datePublished).toISOString(),
    url: a.url,
    image: a.image,
    author: a.authorName ? { '@type': 'Person', name: a.authorName } : undefined,
  };
}

export function breadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}
```

- [ ] **Step 4: Run tests, confirm pass**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo.ts src/lib/seo.test.ts
git commit -m "feat(seo): canonical URL helper + Product/Article/Breadcrumb JSON-LD"
```

### Task 5.5: Wire SEO helpers into product / blog / page layouts

**Files:**
- Modify: `src/layouts/ProductLayout.astro`
- Modify: `src/layouts/BlogPostLayout.astro`

- [ ] **Step 1: Add JSON-LD to ProductLayout**

Update the frontmatter of `src/layouts/ProductLayout.astro`:

```astro
---
import BaseLayout from './BaseLayout.astro';
import Container from '../components/primitives/Container.astro';
import ProductGallery from '../components/product/ProductGallery.astro';
import PriceTag from '../components/product/PriceTag.astro';
import BuyButton from '../components/product/BuyButton.astro';
import { productSchema, breadcrumbSchema } from '../lib/seo';
import type { Product } from '../lib/woo';

interface Props {
  product: Product;
}

const { product } = Astro.props;
const cover = product.images[0];
const jsonLd = productSchema({
  name: product.name,
  description: product.description,
  image: cover?.src ?? '',
  sku: product.sku,
  url: product.permalink, // canonical to live Woo
  priceMinor: product.priceMinor,
  currency: product.currency,
  inStock: product.inStock,
});

const crumbs = breadcrumbSchema([
  { name: 'Strona główna', url: new URL('/', Astro.site).toString() },
  { name: 'Sklep', url: new URL('/sklep', Astro.site).toString() },
  ...(product.categories[0]
    ? [{ name: product.categories[0].name, url: new URL(`/kategoria-produktu/${product.categories[0].slug}`, Astro.site).toString() }]
    : []),
  { name: product.name, url: product.permalink },
]);
---
<BaseLayout
  title={`${product.name} — FeelMySelf`}
  description={product.shortDescription.replace(/<[^>]+>/g, '').slice(0, 160)}
  canonical={product.permalink}
  noindex
>
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
  <script type="application/ld+json" set:html={JSON.stringify(crumbs)} />
  <article class="py-8">
    <Container>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery images={product.images} alt={product.name} />
        <div>
          <h1 class="text-3xl font-bold mb-4">{product.name}</h1>
          <div class="mb-6"><PriceTag product={product} /></div>
          <div class="prose mb-8" set:html={product.shortDescription} />
          <BuyButton product={product} size="lg" />
          <div class="prose mt-12" set:html={product.description} />
        </div>
      </div>
    </Container>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Add JSON-LD to BlogPostLayout**

Replace `src/layouts/BlogPostLayout.astro`:

```astro
---
// src/layouts/BlogPostLayout.astro
import BaseLayout from './BaseLayout.astro';
import Container from '../components/primitives/Container.astro';
import Image from '../components/primitives/Image.astro';
import PostMeta from '../components/blog/PostMeta.astro';
import PostBody from '../components/blog/PostBody.astro';
import { articleSchema, breadcrumbSchema, canonicalUrl } from '../lib/seo';
import { resolveImageUrl } from '../lib/images';
import type { CollectionEntry } from 'astro:content';

interface Props {
  post: CollectionEntry<'blog'>;
}

const { post } = Astro.props;
const { title, excerpt, seoTitle, seoDescription, date, updated, featuredImage, categories, canonicalUrl: explicitCanonical } = post.data;

const siteOrigin = Astro.site!.toString();
const computedCanonical = explicitCanonical ?? canonicalUrl(`/blog/${post.slug}`, siteOrigin);

const jsonLd = articleSchema({
  headline: title,
  datePublished: date,
  dateModified: updated,
  url: computedCanonical,
  image: featuredImage ? resolveImageUrl(featuredImage) : undefined,
});

const crumbs = breadcrumbSchema([
  { name: 'Strona główna', url: new URL('/', Astro.site).toString() },
  { name: 'Blog', url: new URL('/blog', Astro.site).toString() },
  { name: title, url: computedCanonical },
]);
---
<BaseLayout
  title={seoTitle ?? title}
  description={seoDescription ?? excerpt}
  canonical={computedCanonical}
  noindex
>
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
  <script type="application/ld+json" set:html={JSON.stringify(crumbs)} />
  <article class="py-8">
    <Container size="md">
      <header class="mb-8">
        <h1 class="text-4xl font-bold mb-4">{title}</h1>
        <PostMeta date={date} updated={updated} categories={categories} />
      </header>
      {featuredImage && (
        <Image
          src={featuredImage}
          alt={title}
          width={1200}
          height={630}
          class="w-full aspect-video object-cover rounded mb-8"
        />
      )}
      <PostBody>
        <slot />
      </PostBody>
    </Container>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Smoke check JSON-LD output**

```bash
grep -A 2 'application/ld+json' dist/produkt/<some-slug>/index.html | head -10
```

Expected: valid JSON-LD with Product type.

Validate one URL via Google's Rich Results test (manual): https://search.google.com/test/rich-results — paste the staging URL.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/ProductLayout.astro src/layouts/BlogPostLayout.astro
git commit -m "feat(seo): JSON-LD Product + BreadcrumbList + Article on layouts"
```

### Task 5.6: Write URL parity verification script

**Files:**
- Create: `scripts/verify-url-parity.mjs`
- Modify: `package.json` (add `verify-urls` script)

- [ ] **Step 1: Write the script**

```javascript
// scripts/verify-url-parity.mjs
//
// Crawls the live site's sitemap and asserts each URL is buildable on
// the local Astro dist/. Run after `npm run build`.
//
// Usage: node scripts/verify-url-parity.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST = path.resolve(__dirname, '../dist');
const SITEMAP_URL = 'https://feelmyself.pl/sitemap.xml';

async function fetchSitemapUrls(url) {
  const xml = await fetch(url).then((r) => r.text());
  // Sub-sitemaps?
  const subs = [...xml.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (subs.length > 0) {
    const all = [];
    for (const sub of subs) {
      const subUrls = await fetchSitemapUrls(sub);
      all.push(...subUrls);
    }
    return all;
  }
  return [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function urlToFsPath(url) {
  const u = new URL(url);
  let p = u.pathname.replace(/\/$/, '') || '/';
  if (p === '/') return path.join(DIST, 'index.html');
  return path.join(DIST, p, 'index.html');
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function main() {
  console.log('Fetching sitemap from', SITEMAP_URL);
  const urls = await fetchSitemapUrls(SITEMAP_URL);
  console.log(`Got ${urls.length} URLs`);

  const missing = [];
  const onlyLiveDomain = urls.filter((u) => /feelmyself\.pl/i.test(u));

  for (const url of onlyLiveDomain) {
    const fsPath = urlToFsPath(url);
    if (!(await exists(fsPath))) {
      missing.push({ url, fsPath });
    }
  }

  if (missing.length === 0) {
    console.log(`✅ All ${onlyLiveDomain.length} URLs from live sitemap exist in dist/`);
    process.exit(0);
  }

  console.error(`❌ ${missing.length} URLs from live sitemap are missing in dist/:`);
  for (const m of missing.slice(0, 50)) {
    console.error(`  - ${m.url} (expected ${path.relative(DIST, m.fsPath)})`);
  }
  if (missing.length > 50) {
    console.error(`  ... and ${missing.length - 50} more`);
  }
  process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Add npm script**

In `package.json` `"scripts"`:

```json
"verify-urls": "node scripts/verify-url-parity.mjs"
```

- [ ] **Step 3: Build and run**

```bash
npm run build && npm run verify-urls
```

Expected: either ✅ all green, or ❌ list of missing URLs.

- [ ] **Step 4: Investigate and fix gaps**

Common issues and fixes:
- **Missing pages** (e.g. `/sklep`, `/checkout`): explicitly excluded for Phase 1 — add them to the script's exclusion list, OR create a placeholder page that redirects to live Woo.
- **Trailing-slash mismatch**: adjust `urlToFsPath()` or Astro's `trailingSlash` config.
- **Pagination URLs** (`/blog/page/2`): add pagination to `/blog/index.astro` using `paginate()`.
- **Tag/category archives** the live site exposes that we don't: decide per-URL — port or accept-as-out-of-scope and exclude.

If exclusions are needed, add to the script:

```javascript
const EXCLUDE_PATTERNS = [
  /\/koszyk/,           // cart
  /\/zamowienie/,       // checkout
  /\/moje-konto/,       // account
  /\/sklep$/,           // shop archive (deferred to a deliberate page)
];
```

- [ ] **Step 5: Add `verify-urls` to CI**

Edit `.github/workflows/ci.yml`, add a step after Build:

```yaml
- name: Verify URL parity
  run: npm run verify-urls
```

- [ ] **Step 6: Commit**

```bash
git add scripts/verify-url-parity.mjs package.json package-lock.json .github/workflows/ci.yml
git commit -m "feat(scripts): URL parity check + add to CI"
git push
```

### Task 5.7: Final visual parity walkthrough

This task is manual. The "test" is human review.

- [ ] **Step 1: Build a checklist of page archetypes**

For each archetype, find a representative URL on stage and on prod:
- Homepage
- Blog index
- Blog post (3 random)
- Product category (2 random)
- Product (5 random — varied: in stock, on sale, out of stock, multi-image, single-image)
- About / static page
- Contact / static page
- 404

- [ ] **Step 2: Side-by-side review (mobile + desktop)**

For each pair, open both in browser windows side-by-side. On mobile, use Chrome devtools device emulation for both. Note discrepancies in a `Phase1-visual-review.md` (gitignored or /tmp): layout differences, font issues, color mismatches, missing sections, broken images.

- [ ] **Step 3: Triage discrepancies**

For each discrepancy:
- **Fix in Phase 1**: visible to a normal visitor (e.g. wrong color, missing nav item)
- **Defer to Phase 3**: cosmetic micro-differences (e.g. exact padding pixels, hover transition timing)
- **Accept as designed**: where Phase 1 deliberately differs (e.g. simpler product gallery without zoom)

- [ ] **Step 4: Implement fixes**

For each "fix in Phase 1" item, modify the relevant component, push, verify on staging.

- [ ] **Step 5: Run Lighthouse on staging vs prod**

```bash
npx lighthouse https://stage.feelmyself.pl --output=json --output-path=/tmp/stage-lh.json --quiet --chrome-flags="--headless"
npx lighthouse https://feelmyself.pl --output=json --output-path=/tmp/prod-lh.json --quiet --chrome-flags="--headless"
```

Compare the four pillars (Performance, Accessibility, Best Practices, SEO). Stage should be ≥ prod on all four. If significantly worse, investigate before declaring Phase 1 done.

### Task 5.8: Update README with developer instructions

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace README placeholder content with actual dev guide**

```markdown
# FeelMySelf

Astro port of [feelmyself.pl](https://feelmyself.pl) — a WooCommerce shop
currently running on WordPress (Botiga Pro theme on Hetzner). Deployed
to `stage.feelmyself.pl` via Cloudflare Pages.

## Status

**Phase 1 — Visual port complete.**

Roadmap:
1. ~~Phase 1 — Visual port to Astro at `stage.feelmyself.pl`.~~ ✅
2. Phase 2 — Real ecommerce (Astro-native vs headless Woo TBD). Cart,
   checkout, accounts.
3. Phase 3 — SEO / GEO / AEO optimization, Cloudflare R2 + Images, Core
   Web Vitals.

## Local development

Requires Node 20+.

```bash
npm install
npm run dev          # dev server on localhost:4321
npm run build        # static build to dist/
npm run preview      # preview build on localhost:4321
npm run typecheck    # astro check
npm test             # vitest
npm run verify-urls  # confirm dist/ matches live sitemap (run after build)
```

## Project layout

- `src/pages/` — Astro routes (one file per URL pattern)
- `src/layouts/` — page-level layouts (Base, Page, BlogPost, Product)
- `src/components/` — UI components (primitives, layout, blog, product, home)
- `src/content/` — content collections schema + Markdown sources
- `src/lib/` — typed helpers (`woo.ts`, `images.ts`, `seo.ts`, `i18n.ts`)
- `scripts/` — one-shot utilities (blog migration, URL parity check)
- `reference/` — gitignored audit artifacts (scraped pages, theme source)
- `docs/superpowers/specs/` — design specs
- `docs/superpowers/plans/` — implementation plans
- `.github/workflows/` — CI + content refresh

## Key architectural commitments

1. All image references go through `<Image>` + `resolveImageUrl()` —
   never raw `<img src>` to wp-content URLs. (Phase-3 R2 migration is
   then a one-line resolver swap.)
2. All Woo API calls live in `src/lib/woo.ts` — single integration
   surface, easy to swap or extend in Phase 2.
3. All recurring UI patterns are Astro components, not `@apply` classes.

## Deploy pipeline

- Push to `main` → Cloudflare Pages deploys to `stage.feelmyself.pl`
- PRs → auto-generated preview URLs (`pr-N.feelmyself-stage.pages.dev`)
- Nightly cron + manual `gh workflow run refresh-content.yml` →
  triggers a Pages rebuild via deploy hook (refreshes Woo product data
  without code changes)

## Phase 1 design spec

[`docs/superpowers/specs/2026-05-02-phase-1-astro-port-design.md`](docs/superpowers/specs/2026-05-02-phase-1-astro-port-design.md)

## Phase 1 implementation plan

[`docs/superpowers/plans/2026-05-02-feelmyself-phase-1-astro-port.md`](docs/superpowers/plans/2026-05-02-feelmyself-phase-1-astro-port.md)

## License / Authoring

Private repo. Personal project of Blazej Mrozinski.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: real developer README (replace placeholder, document architecture + commands)"
```

### Task 5.9: Workstream 5 wrap — CHANGELOG, final checkpoint

- [ ] **Step 1: Update CHANGELOG**

Replace the `[Unreleased]` section with a release-style version (`[0.1.0] — 2026-XX-XX`) and add the final batch:

```markdown
## [0.1.0] — 2026-XX-XX (Phase 1 — Visual Port)

### Added

- Marketing pages: homepage with hero / featured products / blog teaser;
  static pages (`/o-nas`, `/kontakt`, etc.) via content collection +
  catch-all route.
- SEO essentials: canonical URLs (point at prod for staging), JSON-LD
  Product / Article / BreadcrumbList schemas, `noindex` on staging,
  `robots.txt` blocking crawlers.
- URL parity verification script (`npm run verify-urls`) wired into CI.
- README with developer instructions and architectural commitments.
- Lighthouse-verified parity with live site.
```

- [ ] **Step 2: Tag the release**

```bash
git add CHANGELOG.md
git commit -m "release: Phase 1 v0.1.0 — visual port complete"
git tag -a v0.1.0 -m "Phase 1 — visual port complete"
git push --follow-tags
```

- [ ] **Step 3: Final checkpoint with Blazej**

Walk through the Phase 1 done-criteria from the spec:
- [ ] All page archetypes rendered + visually approved
- [ ] All URLs from live sitemap exist on staging (`verify-urls` green)
- [ ] `astro check` passes
- [ ] `npm run build` succeeds in <2 min
- [ ] Lighthouse score on staging ≥ live site
- [ ] `robots.txt` on staging blocks all crawlers

If all checked, Phase 1 is done. Discuss next steps:
1. Brainstorm Phase 2 (commerce direction)
2. DNS cutover plan (separate brainstorm)
3. ClaudioBrain status update

---

## Phase 1 Done Criteria — Final Verification

Before declaring Phase 1 complete, verify all criteria from the spec:

- [ ] All page archetypes (home, blog index, blog post, category, product, static, 404) render and have been visually approved
- [ ] `npm run verify-urls` passes (all live sitemap URLs exist in `dist/`)
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run build` succeeds in under 2 minutes
- [ ] Lighthouse Performance / Accessibility / Best Practices / SEO ≥ live site on the homepage
- [ ] `https://stage.feelmyself.pl/robots.txt` returns `User-agent: *\nDisallow: /`
- [ ] CHANGELOG bumped to `[0.1.0]`, tagged `v0.1.0`, pushed
- [ ] Cloudflare Pages auto-deploys on push to `main`
- [ ] PR previews work
- [ ] Refresh workflow (`workflow_dispatch` and nightly cron) triggers a successful rebuild
- [ ] ClaudioBrain `projects/feelmyself.md` updated to "Phase 1 complete, Phase 2 brainstorm pending"

When all green, the next session brainstorms Phase 2 (commerce direction).
