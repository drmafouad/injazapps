// Astro only builds the site-root 404.astro to a bare /404.html (it
// special-cases the literal path "/404" — see astro/dist/core/output-
// filename.js, STATUS_CODE_PAGES). A locale-prefixed 404.astro (e.g.
// src/pages/ar/404.astro) instead builds to /ar/404/index.html like any
// other route. Cloudflare's static-assets `not_found_handling:
// "404-page"` walks UP the directory tree looking for a literal
// `404.html`, so without this copy, a broken link under /ar/* would
// silently fall through to the English 404 page. This copies each
// locale's built 404 page to a sibling `404.html` so Cloudflare finds it.
//
// Runs automatically after `npm run build` (npm's postbuild convention) —
// plain Node, no external tools.
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { locales, defaultLocale } from '../src/lib/i18n.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');

for (const locale of locales) {
  if (locale === defaultLocale) continue; // already /404.html
  const src = join(DIST, locale, '404', 'index.html');
  const dest = join(DIST, locale, '404.html');
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`copied ${locale}/404/index.html -> ${locale}/404.html`);
  } else {
    console.warn(`skipped ${locale}: no ${src}`);
  }
}
