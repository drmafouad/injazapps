# InjazApps

Version: 1.0.0
Last updated: 2026-09-06

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
- The brass accent colour appears at most once per screen — `AblaqRule`
  takes an `accent` prop so only one instance per page sets it.

## Components

`BaseLayout`, `Header`, `Footer`, `AblaqRule` (the signature alternating
divider), and `OffsetPanel` (the hard-offset depth treatment) live in
`src/layouts` and `src/components`.

## Commands

Run from the project root: `npm run dev` starts the local dev server,
`npm run build` builds to `./dist/`, `npm run preview` serves that build
locally, and `npm run astro check` type-checks the project.

## Fonts

Self-hosted via Fontsource: `@fontsource-variable/ibm-plex-sans` (Latin,
variable weight) and `@fontsource/ibm-plex-sans-arabic` (Arabic; no
variable build is published for this family, so weights 400/500/700 are
loaded as static faces). Both are preloaded per the active locale.

## Known follow-ups

- `astro.config.mjs` sets a placeholder `site` value (`injazapps.com`) for
  absolute-URL generation — update it once the real domain is confirmed.
- The favicon set is a placeholder structure only; see
  `public/favicons/README.md`.
