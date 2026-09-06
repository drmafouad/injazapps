# InjazApps

Version: 1.1.3
Last updated: 2026-09-07 02:50 +03

Marketing site for InjazApps, a mobile app studio, built with Astro and
hand-written CSS (no Tailwind, no UI framework). This is the scaffolding and
design-system layer only — page content is deliberately not written yet.

## Stack

TypeScript-strict Astro, npm, no React/Vue/Svelte. Styling is hand-written
CSS using custom properties, with logical properties throughout so the
Arabic layout mirrors correctly.

## i18n

English lives at the site root; Arabic lives under `/ar/`. Every page emits
hreflang alternates for both locales plus x-default. Locale-specific
strings live in `src/lib/nav.ts`.

## Design system

Design tokens (`src/styles/tokens.css`) are dark-first and named by role,
never by raw colour — `[data-theme="light"]` overrides the dark defaults.
The theme toggle persists to `localStorage` and applies before paint via an
inline script in `BaseLayout`.

Brand rules enforced across every component:

- Logical CSS properties only (no `margin-left`/`right`, no `left`/`right`
  positioning, no `text-align: left/right`) — required for the Arabic
  layout to mirror correctly.
- No box-shadow, blur, or gradients. Depth is a hard-edged duplicate block
  offset by a few pixels, drawn in the border colour.
- No border-radius above 4px anywhere.
- The brass accent colour appears at most once per screen. `AblaqRule`
  defaults `accent` to `false`; the Header's instance is the site's single
  owner of the accent and is the only place it's explicitly turned on.

## Components

`BaseLayout`, `Header`, `Footer`, `AblaqRule` (the signature alternating
divider), and `OffsetPanel` (the hard-offset depth treatment) live in
`src/layouts` and `src/components`.

## Hosting

Deployment target is Cloudflare Pages. Build command `npm run build`,
output directory `dist`. `public/_redirects` sends `www` to the apex
domain; `public/_headers` sets baseline security headers site-wide and a
one-year immutable cache on `/fonts/*`. Node version is pinned to 22 via
`.nvmrc` and `engines.node` in `package.json` so local, CI, and the
Cloudflare build agree; `package-lock.json` should be regenerated with npm
as shipped by that Node version if it ever drifts (a lockfile written by a
different npm major version can omit optional transitive dependencies that
`npm ci` then rejects as out of sync).

## Commands

Run from the project root: `npm run dev` starts the local dev server,
`npm run build` builds to `./dist/`, `npm run preview` serves that build
locally, and `npm run astro check` type-checks the project.

`npm run icons:generate` and `npm run fonts:subset` are developer-machine-only
maintenance scripts — see Icons and Fonts below. Neither one runs as part of
`npm run build` or any install hook; the build only ever runs `astro build`,
and its full dependency tree is plain Node/npm packages (no Python, no
system binaries). `fonts:subset` requires Python fonttools
(`pip install fonttools brotli`) and is never invoked on the Cloudflare
Pages build machine, which has Node and npm only.

## Fonts

Self-hosted, subsetted copies of two Fontsource families live in
`public/fonts/` (committed to the repo, not gitignored) and are declared in
`src/styles/fonts.css`: `@fontsource-variable/ibm-plex-sans` (Latin,
variable weight) and `@fontsource/ibm-plex-sans-arabic` (Arabic; no
variable build is published for this family, so it ships static weights).
The Fontsource packages, plus `sharp` and `png-to-ico` (used only by
`scripts/subset-fonts.mjs` and `scripts/generate-icons.mjs`), are
devDependencies only — source material for those two scripts, never a
runtime import and never installed for production.

IBM Plex Sans Arabic ships static 400/700 weights only in this build (500
is unused across the codebase and is dropped). There is no 600 — a rule
requesting weight 600 on the Arabic face would faux-bold and damage letter
joins, so anything wanting that emphasis goes through the
`--font-weight-wordmark` token (`src/styles/tokens.css`): 600 under the
Latin face, 700 under `html[lang="ar"]`.

Each `@font-face` in `fonts.css` declares `unicode-range` as the exact set
of codepoints actually embedded (not the full Unicode block) — a character
outside that set falls through to the next font in the stack instead of
rendering a missing-glyph box. This also keeps the Arabic face from ever
matching Latin text (e.g. "OwlMD", "English") the way importing
Fontsource's combined per-weight CSS used to, which was downloading a
second, redundant Latin subset from the Arabic package. One weight per
locale is preloaded above the fold in `BaseLayout`.

**⚠️ Subset fragility:** because `unicode-range` is pinned to the exact
codepoints present in today's copy, any *new* character added to site copy
(a new word, a new page, a diacritic that wasn't there before) is not in
the subset and will silently fall back to the next font in the stack —
usually a system font, not a missing-glyph box, so it degrades quietly
rather than breaking, but it will look off-brand. **Whoever edits copy
must run `npm run fonts:subset` afterward and commit the regenerated files
in `public/fonts/` and the updated `unicode-range` values in
`src/styles/fonts.css`.**

`npm run fonts:subset` (`scripts/subset-fonts.mjs`) regenerates those
subsets. It requires Python fonttools on PATH
(`pip install fonttools brotli`) to run `pyftsubset` — this is a
developer-machine tool only; it is never run during `npm run build` and
the Cloudflare Pages build machine does not have Python installed. The
script scans `src/lib/nav.ts` and every page's title/description/body copy
for the character set, subsets via `pyftsubset` with `--layout-features=*`
(keep every OpenType layout feature the source font defines), and prints
the `unicode-range` values to paste into `fonts.css`.

The Arabic subset was verified to retain `GSUB`/`GPOS` and the shaping
features IBM Plex Sans Arabic actually ships — `init`, `medi`, `fina`,
`calt`, `rlig` (GSUB) and `kern`, `mark`, `mkmk` (GPOS). The source font has
no separate `isol` or `liga` feature (isolated forms are the default cmap
glyphs, and lam-alef is a *required* ligature under `rlig`, not `liga`) —
that's true of the unsubsetted font too, not something subsetting removed.
The lam-alef ligature rule itself (medial/initial lam + final alef, for
every alef variant in the current subset — ا, إ, آ) was confirmed present
in the subsetted glyph tables.

**Font payload, `/` vs `/ar/`** (sum of woff2 files actually fetched, per
the font-matching rules above; measured from file sizes, not a live
network trace — no browser instrumentation was available for this pass):

| Page  | Before   | After   | Change |
| ----- | -------- | ------- | ------ |
| `/`   | 45,712 B | 16,904 B | −63% |
| `/ar/` | 152,004 B | 31,932 B | −79% |

Before: `/` downloaded the unsubsetted Latin variable font (45,712 B).
`/ar/` downloaded that same file too (it was preloaded unconditionally on
every page), plus the Arabic package's Arabic-400 subset (42,848 B), plus
its own Latin-400 subset (19,164 B, matched ahead of the real Latin font
for Latin text under the old unrestricted unicode-range), plus its
Arabic-700 subset (44,280 B, matched as the nearest available weight to
the header wordmark's requested 600). After: `/` downloads only the
subsetted Latin file (16,904 B); `/ar/` downloads that plus the subsetted
Arabic 400 and 700 faces (7,480 B + 7,548 B), with the redundant Arabic
Latin-subset download eliminated by the unicode-range fix.

## SEO

Canonical is the apex domain (`https://injazapps.com`, no `www`); Cloudflare
Pages redirects `www` to it via `public/_redirects`. `@astrojs/sitemap` is
configured with the `en`/`ar` locale map so `sitemap-index.xml` carries
hreflang alternates for every route. Every page sets a description and
emits Open Graph / Twitter card tags via `BaseLayout`, falling back to
`/og-default.png` when a page doesn't pass its own `ogImage`.

## Icons

The favicon, manifest icons, and default OG image are generated from the
existing mark (not redrawn) by `scripts/generate-icons.mjs`, which reads
`assets/injazapps-icon-512.png` — the full-bleed 512x512 square mark (hard
joint at x=256, no corner radius, no transparency). It does not use the
48px `public/injazapps-icon-web-48r.png` copy: that variant has real
transparent corners and would double-round under Apple/Android icon masks.
The 48r variant remains the source for the in-page Header logo only.

Like the font subset, this is a developer-machine-only script: run
`npm run icons:generate` any time the source art changes and commit the
regenerated PNGs/ICO in `public/` (they are checked in, not gitignored). It
uses `sharp`/`png-to-ico` and is never invoked by `npm run build`.
