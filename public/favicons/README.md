---
Status: placeholder structure only, generation deferred
Last updated: 2026-09-06
---

# Favicon set

This folder is reserved for the generated favicon set. Nothing here yet
produces real icons — `favicon.ico` and `favicon.svg` in `public/` are the
temporary stand-ins used by `BaseLayout.astro` until this set is generated.

Expected outputs, once generation happens, sourced from the InjazApps mark
(`injazapps-icon-web-48r.png` / the 512px master in `/assets`):

- favicon-16x16.png
- favicon-32x32.png
- favicon-48x48.png
- apple-touch-icon.png (180x180)
- icon-192.png and icon-512.png (for a web app manifest)
- site.webmanifest referencing the icons above

`BaseLayout.astro` should be updated to reference these once they exist.
