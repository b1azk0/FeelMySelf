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
