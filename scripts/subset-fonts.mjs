// Regenerates the self-hosted, subsetted webfonts in public/fonts/ from the
// Fontsource master packages. Run with: npm run fonts:subset
//
// Requires Python fonttools on PATH (`pip install fonttools brotli`) — this
// is a developer-machine-only tool. It must NEVER run as part of
// `npm run build`: the Cloudflare Pages build machine has Node and npm
// only, no Python. Its output (public/fonts/*.woff2 and the unicode-range
// values below) is committed to the repo instead.
//
// Why subset at all: IBM Plex Sans Arabic ships static 400/500/700 only
// (no 600 — see --font-weight-wordmark in tokens.css), and importing the
// Fontsource-generated CSS pulls in that face's Latin/Cyrillic subsets too.
// Because 'IBM Plex Sans Arabic' is listed first in --font-arabic, the
// browser matches ITS Latin subset for any Latin text on an Arabic page
// (e.g. "OwlMD", "English") instead of falling back to the real Latin
// font — a duplicate, wasted download. Restricting each face's
// unicode-range to only the codepoints actually embedded (not the whole
// Unicode block) fixes that: unmatched characters fall through to the next
// font in the stack instead of rendering a missing-glyph box.
//
// Character set: scanned from src/lib/nav.ts and src/lib/home.ts (all
// locale strings), every src/content/apps/*.json entry, and every .astro
// file's own markup under src/pages and src/components — both its quoted
// attribute values (title, description, alt, aria-label, ...) and its
// rendered text nodes (frontmatter, <script>, and <style> blocks are
// stripped first, since none of that is ever painted with the webfont).
// Unioned with a small fixed safety set (ASCII digits, Arabic-Indic digits
// ٠-٩, and common punctuation). Re-run this script whenever copy
// changes — a new character that isn't in the subset will silently fall
// back to the next font in the stack rather than showing a missing-glyph
// box, so this degrades safely, but re-running keeps new copy on-brand.
import { mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public/fonts');
mkdirSync(OUT_DIR, { recursive: true });

const LATIN_SAFETY = `0123456789.,:;!?'"()&/-–— ©`;
const ARABIC_SAFETY = `٠١٢٣٤٥٦٧٨٩،؛؟`;

const isArabicBlock = (cp) =>
  (cp >= 0x0600 && cp <= 0x06ff) ||
  (cp >= 0x0750 && cp <= 0x077f) ||
  (cp >= 0x0870 && cp <= 0x08ff) ||
  (cp >= 0xfb50 && cp <= 0xfdff) ||
  (cp >= 0xfe70 && cp <= 0xfeff);

function walkFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(p, out);
    else if (entry.name.endsWith('.astro')) out.push(p);
  }
  return out;
}

// Attributes whose values are real rendered/announced text — not class,
// id, href, rel, type, width, etc., which are structural, not copy.
const TEXT_ATTRS = ['title', 'description', 'alt', 'aria-label', 'placeholder'];

// Strips frontmatter/<script>/<style> (never painted with the webfont),
// then returns the text-bearing attribute values plus tag-stripped text
// content. JSX/template expressions are stripped brace-pair by brace-pair,
// repeatedly, so arbitrarily nested `{...}` (e.g. a .map() with a nested
// template literal) fully disappears rather than leaving fragments.
function extractAstroText(content) {
  let markup = content.replace(/^---[\s\S]*?---/, '');
  markup = markup.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  markup = markup.replace(/<style[\s\S]*?<\/style>/gi, ' ');

  const attrPattern = new RegExp(`(?:${TEXT_ATTRS.join('|')})=(?:"([^"]*)"|'([^']*)')`, 'g');
  const attrValues = [...markup.matchAll(attrPattern)].map((m) => m[1] ?? m[2] ?? '').join(' ');

  let text = markup;
  let prev;
  do {
    prev = text;
    text = text.replace(/\{[^{}]*\}/g, ' ');
  } while (text !== prev);
  text = text.replace(/<[^>]+>/g, ' ');

  return attrValues + ' ' + text;
}

async function collectCharacters() {
  const { navCopy } = await import('../src/lib/nav.ts');
  const navText = Object.values(navCopy)
    .flatMap((o) => Object.values(o))
    .join('');

  const { homeCopy } = await import('../src/lib/home.ts');
  const homeText = Object.values(homeCopy)
    .flatMap((o) => Object.values(o))
    .join('');

  const appEntries = readdirSync(join(ROOT, 'src/content/apps'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(ROOT, 'src/content/apps', f), 'utf8')));
  const appText = appEntries
    .flatMap((entry) => Object.values(entry))
    .filter((v) => typeof v === 'string')
    .join('');

  const astroFiles = [
    ...walkFiles(join(ROOT, 'src/pages')),
    ...walkFiles(join(ROOT, 'src/components')),
  ];
  const astroText = astroFiles
    .map((f) => extractAstroText(readFileSync(f, 'utf8')))
    .join(' ');

  const all = navText + homeText + appText + astroText + LATIN_SAFETY + ARABIC_SAFETY;
  const unique = [...new Set([...all])].filter((c) => c === ' ' || !/\s/.test(c));

  const arabic = [];
  const latin = [];
  for (const ch of unique) {
    (isArabicBlock(ch.codePointAt(0)) ? arabic : latin).push(ch);
  }
  arabic.sort();
  latin.sort();
  return { latin, arabic };
}

function toUnicodesArg(chars) {
  return chars.map((c) => 'U+' + c.codePointAt(0).toString(16).toUpperCase()).join(',');
}

function subset({ input, output, unicodes, extraArgs = [] }) {
  execFileSync('pyftsubset', [
    input,
    `--output-file=${output}`,
    `--unicodes=${unicodes}`,
    '--flavor=woff2',
    '--layout-features=*',
    '--no-hinting',
    ...extraArgs,
  ]);
  const bytes = statSync(output).size;
  console.log(`wrote ${output.replace(ROOT + '/', '')} (${bytes} bytes)`);
  return bytes;
}

async function main() {
  const { latin, arabic } = await collectCharacters();
  console.log(`Latin charset (${latin.length}): ${latin.join('')}`);
  console.log(`Arabic charset (${arabic.length}): ${arabic.join('')}`);

  const latinUnicodes = toUnicodesArg(latin);
  const arabicUnicodes = toUnicodesArg(arabic);

  const latinSource = join(
    ROOT,
    'node_modules/@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2',
  );
  const arabic400Source = join(
    ROOT,
    'node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-400-normal.woff2',
  );
  const arabic700Source = join(
    ROOT,
    'node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-700-normal.woff2',
  );

  // Weight 500 is audited as unused across the codebase — not subsetted.
  subset({
    input: latinSource,
    output: join(OUT_DIR, 'ibm-plex-sans-latin-subset.woff2'),
    unicodes: latinUnicodes,
  });
  subset({
    input: arabic400Source,
    output: join(OUT_DIR, 'ibm-plex-sans-arabic-400-subset.woff2'),
    unicodes: arabicUnicodes,
  });
  subset({
    input: arabic700Source,
    output: join(OUT_DIR, 'ibm-plex-sans-arabic-700-subset.woff2'),
    unicodes: arabicUnicodes,
  });

  console.log('\nUpdate the unicode-range values in src/styles/fonts.css to:');
  console.log(`  Latin:  ${latinUnicodes}`);
  console.log(`  Arabic: ${arabicUnicodes}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
