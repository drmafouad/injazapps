# InjazApps

Version: 1.2.1
Last updated: 2026-09-07 22:15 +03

Marketing site for InjazApps, a mobile app studio, built with Astro and
hand-written CSS (no Tailwind, no UI framework). The home page (`/` and
`/ar/`) and the about page (`/about` and `/ar/about`) are written; every
other route is still scaffolding — an `OffsetPanel` with a "Coming soon."
placeholder.

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
- Brand names are never transliterated into Arabic script. "InjazApps"
  and "OwlMD" are set in the Latin face on every locale, full stop. Mizan
  and Sadā are the exception, not a precedent — "ميزان" and "صدى" are
  their real Arabic names, not transliterations, so they use it on `/ar/`.
  Where the Header or the home page's hero shows the wordmark on `/ar/`,
  "إنجاز" appears beside it as a paired lockup element (a thin vertical
  rule, its own `font-family: var(--font-arabic)`, weight 700 set
  directly rather than through `--font-weight-wordmark`) — that's a
  lockup, not a translation, and it's the only sanctioned place "إنجاز"
  appears without "InjazApps" alongside it in Latin. Anywhere else a
  Latin brand name sits inside Arabic running text (the footer's
  copyright line, an app card's name, the home page's intro paragraph),
  it's wrapped in `<bdi>` so adjacent Arabic punctuation doesn't render on
  the wrong side.
- Positioning is quality, craft, and engineering only — no reference to
  place, nationality, or ethnicity (no Kuwait, Egypt, "the Gulf," "the
  Arab world," or heritage framing of any kind — "Cairo Brass" is the
  accent colour's name, not an exception to this). Language *support* is
  a fine thing to state as a product capability ("fully usable offline");
  language *identity* claims like "Arabic first" are not.
  - **The one allowlisted exception is `/about` and `/ar/about`.** Those
    two pages, and only those two, may name a place or heritage (Cairo,
    Mamluk-era architecture, ...) — and only to describe the *origin of
    the mark itself* (the joggled joint, ablaq coursing, the colour
    palette), never to describe the studio or the people who work there.
    No other page may reference place, nationality, or ethnicity.
- The full palette (`src/styles/tokens.css`'s raw colours) is deliberately
  used sparingly — Ablaq Red and Lamp Glass Teal sat unused for several
  passes before getting a real assignment:
  - **Ablaq Red** (`--wide-rule-dark`) appears only via `AblaqRule`'s
    `variant="wide"` — a taller band alternating Limestone/Ablaq Red,
    permitted on large surfaces only. Its one use site-wide is below the
    `<h1>` on `/about` and `/ar/about`. Not on the home page, not in the
    Header.
  - **Lamp Glass Teal** (`--accent-teal`) is Mizan's accent, and only
    Mizan's: the home page's Mizan card border on hover/focus, and a
    solid band at the top of the Mizan app page. OwlMD and Sadā keep the
    default (`--signal-default`) treatment until their icons exist.
  - **Cairo Brass** (`--accent-brass`) is unchanged: exactly once per
    screen, owned by the Header (see above).

## Components

`BaseLayout`, `Header`, `Footer`, `AblaqRule` (the signature alternating
divider), and `OffsetPanel` (the hard-offset depth treatment) live in
`src/layouts` and `src/components`. `HomeContent` renders the home page
body (hero, intro, apps grid, closing strip) for both locales; `Header`
and `HomeContent` are the only two places `AblaqRule` is rendered with
`accent` on and off respectively — every other instance stays off, so the
Header is the single owner of the Cairo Brass accent site-wide.

## Content

`src/content/apps/` is a content collection (`src/content.config.ts`) with
one JSON entry per app — `slug`, `name`/`nameAr`, `tagline`/`taglineAr`,
`iconPath`, and `status` (`"live"` or `"soon"`). The home page's app cards
read from it; app icons aren't produced yet, so cards render a plain
outlined placeholder box instead of `iconPath` (which exists in the schema
for when real icon art lands). Copy for the home page itself lives in
`src/lib/home.ts`, alongside `src/lib/nav.ts` for nav/footer strings.

`src/content/pages/` is a second content collection, for long-form prose
pages (currently just `about.md` / `about.ar.md`, one file per locale —
each file's `slug` frontmatter field controls its collection entry ID
explicitly, since the default slugger mangles a dotted filename like
`about.ar.md` into `aboutar`). `src/lib/prose.ts` parses a page's raw
markdown body into a title and a list of sections (an "# H1" title, then
"## H2"-delimited sections of plain paragraphs — no bold/italic/links/
lists, so it's a deliberately minimal parser, not a markdown pipeline).
`ProseContent.astro` renders that structure generically: 68ch measure,
generous line-height, an `AblaqRule` (accent off) between every pair of
sections, and any `InjazApps` substring in a title or paragraph wrapped in
`<bdi>` (a no-op in Latin text, correct when the block is Arabic).

## Hosting

Deployment target is a Cloudflare Worker serving static assets (not
Cloudflare Pages), configured by `wrangler.jsonc`. The site is pure static
output — no adapter, no server code — so `wrangler.jsonc` is deliberately
minimal: `name`, `compatibility_date`, and an `assets` block pointing at
`./dist` with `not_found_handling: "404-page"`. No `main` entry point, no
bindings.

**Deploy with `npm run deploy` (`wrangler deploy`), never `npx wrangler
deploy`.** `npx` can fetch a fresh, un-pinned wrangler and — in a
non-interactive build context — auto-run its framework setup wizard, which
will detect Astro, offer to install `@astrojs/cloudflare`, and rewrite
`astro.config.mjs` to add a server adapter this static site doesn't need
(that's what happened once already; see the git history around
`wrangler.jsonc` if it recurs). Wrangler is pinned as an exact-version
devDependency for the same reason — `npm run deploy`/`npm run preview`
always run the pinned local copy. If the Cloudflare dashboard's "Workers
Build" deploy command is ever editable, it must be set to `npm run deploy`,
not the default `npx wrangler deploy`.

`public/_headers` sets baseline security headers site-wide and a one-year
immutable cache on `/fonts/*` — Workers static assets honors the same
`_headers`/`_redirects` file conventions as Pages. `public/_redirects`
intentionally carries no rules (see SEO below for why). Node version is
pinned to 22 via `.nvmrc` and `engines.node` in `package.json` so local,
CI, and the Cloudflare build agree; `package-lock.json` should be
regenerated with npm as shipped by that Node version if it ever drifts (a
lockfile written by a different npm major version can omit optional
transitive dependencies that `npm ci` then rejects as out of sync).

Dashboard check (not something a repo file can enforce): only one
Cloudflare project should be connected to this repo. If a legacy Pages
project and the current Workers project are both watching the same GitHub
repo, every push triggers two builds — remove or disconnect whichever one
isn't this Worker.

## Commands

Run from the project root: `npm run dev` starts the local dev server,
`npm run build` builds to `./dist/`, `npm run preview` serves that build
locally, and `npm run astro check` type-checks the project.

`npm run icons:generate` and `npm run fonts:subset` are developer-machine-only
maintenance scripts — see Icons and Fonts below. Neither one runs as part of
`npm run build` or any install hook; the build only runs `astro build` plus
one automatic `postbuild` step (`scripts/copy-locale-404s.mjs`, plain
Node — see 404 pages below), and the full dependency tree for both is
plain Node/npm packages (no Python, no system binaries). `fonts:subset`
requires Python fonttools (`pip install fonttools brotli`) and is never
invoked on the Cloudflare build machine, which has Node and npm only.

## 404 pages

`src/pages/404.astro` and `src/pages/ar/404.astro` are real pages (not
generated), so they get the same Header/Footer chrome, brass-accent rule,
and font handling as everything else. Astro only special-cases the
site-root `404.astro` to build to a bare `/404.html`; a locale-prefixed one
builds like any other route (`/ar/404/index.html`). Since Cloudflare's
static-assets `not_found_handling: "404-page"` walks up the directory tree
looking for a literal `404.html`, an Arabic 404 that only exists at
`/ar/404/` would never actually be served — a broken link under `/ar/*`
would silently fall back to the English page. The `postbuild` script
copies each non-default locale's built 404 page to a sibling `404.html`
to fix that.

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

Each `@font-face` in `fonts.css` declares `unicode-range` as a **fixed
Unicode block** — the Arabic blocks (+ Arabic-Indic digits) for Arabic,
Latin-1 plus a handful of symbol ranges for Latin — not the exact set of
characters used in today's copy. This also keeps the Arabic face from
ever matching Latin text (e.g. "OwlMD", "English") the way importing
Fontsource's combined per-weight CSS used to, which was downloading a
second, redundant Latin subset from the Arabic package. One weight per
locale is preloaded above the fold in `BaseLayout`.

**This deliberately replaced an earlier, content-scanned subsetting
strategy that failed three times over.** That version scanned the actual
site copy and subsetted to the exact codepoints found — and every time
new copy used a character the scanner didn't know to look for (a new
page, a new content file, a new component with inline text), that
character silently fell back to a system font. For Arabic specifically,
that failure mode is worse than it sounds: one substituted glyph mid-word
breaks shaping (`init`/`medi`/`fina`/`rlig`) for the *entire word*, not
just that character, since those features only fire between glyphs that
are all present in the same face. The fix isn't a smarter scanner — it's
subsetting by fixed block instead of by content, so it's immune to
content drift by construction. The tradeoff is a larger download; that's
accepted deliberately. **Re-running `npm run fonts:subset` is only
needed if the font version changes, never because copy changed.**

`npm run fonts:subset` (`scripts/subset-fonts.mjs`) regenerates the
woff2 files from the two `LATIN_UNICODES`/`ARABIC_UNICODES` constants at
the top of that script (kept in sync with `fonts.css`'s `unicode-range`
values by hand — there's no scanning step to do it for you). It requires
Python fonttools on PATH (`pip install fonttools brotli`) to run
`pyftsubset` with `--layout-features=*` (keep every OpenType layout
feature the source font defines) — this is a developer-machine tool
only; it is never run during `npm run build`, and the Cloudflare build
machine does not have Python installed.

The Arabic subset was verified to retain `GSUB`/`GPOS` and the shaping
features IBM Plex Sans Arabic ships — `init`, `medi`, `fina`, `calt`,
`rlig`, `ccmp`, `locl` (GSUB) and `kern`, `mark`, `mkmk` (GPOS) — and,
because the subset now covers the whole Arabic block rather than a
hand-picked codepoint list, every Arabic word joins correctly regardless
of which letters it uses. Verified visually (not just by character
coverage) on `/ar/about`, the page with the densest Arabic prose on the
site.

**Font payload, `/` vs `/ar/`** (sum of woff2 files actually fetched — a
Latin-locale page downloads only the Latin file; an Arabic-locale page
downloads that plus both Arabic weights, since the header's language
switch and Latin brand names still need the Latin face):

| Page   | Bytes      |
| ------ | ---------- |
| `/`    | 37,548 B   |
| `/ar/` | 95,976 B   |

These totals are now constant regardless of copy — they only change if
the font version or the `LATIN_UNICODES`/`ARABIC_UNICODES` ranges change.

## SEO

Canonical is the apex domain (`https://injazapps.com`, no `www`).
`public/_redirects` can't express that redirect: Cloudflare rejects
absolute URLs (`https://www.injazapps.com/*`) in the source column, only
same-hostname relative paths are valid there, and `www` is a different
hostname. `www` → apex, and any OwlMD legacy-URL redirects (a different
hostname again), are configured as Cloudflare Redirect Rules in the
dashboard instead — `_redirects` stays reserved for same-hostname
relative-path rules only, of which this site currently has none.
`@astrojs/sitemap` is configured with the `en`/`ar` locale map so
`sitemap-index.xml` carries hreflang alternates for every route. Every
page sets a description and emits Open Graph / Twitter card tags via
`BaseLayout`, falling back to `/og-default.png` when a page doesn't pass
its own `ogImage`.

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
