// Regenerates the self-hosted webfonts in public/fonts/ from the
// Fontsource master packages. Run with: npm run fonts:subset
//
// Requires Python fonttools on PATH (`pip install fonttools brotli`) — this
// is a developer-machine-only tool. It must NEVER run as part of
// `npm run build`: the Cloudflare build machine has Node and npm only,
// no Python. Its output (public/fonts/*.woff2 and the unicode-range
// values below) is committed to the repo instead.
//
// Why subset at all: IBM Plex Sans Arabic ships static 400/500/700 only
// (no 600 — see --font-weight-wordmark in tokens.css), and importing the
// Fontsource-generated CSS pulls in that face's Latin/Cyrillic subsets too.
// Because 'IBM Plex Sans Arabic' is listed first in --font-arabic, the
// browser matches ITS Latin subset for any Latin text on an Arabic page
// (e.g. "OwlMD", "English") instead of falling back to the real Latin
// font — a duplicate, wasted download. Restricting unicode-range fixes
// that: unmatched characters fall through to the next font in the stack.
//
// SUBSET BY FIXED UNICODE BLOCK, NOT BY SCANNED TEXT. An earlier version
// of this script scanned the actual site copy and subsetted to the exact
// codepoints found. That failed three times over: every time new copy
// used a character the scanner didn't know to look for (a new page, a
// new content file, a new component), that one character silently fell
// back to a system font — and for Arabic, a single substituted glyph in
// a word breaks shaping for the whole word, since init/medi/fina/rlig
// only fire between glyphs that are all present in the same face. The
// fix isn't a smarter scanner; it's to stop keying the subset to content
// at all. These ranges cover the Arabic and Latin-1 blocks (plus a few
// common symbol ranges) wholesale, so any character in ordinary Arabic
// or Latin prose is present — immune to content drift by construction,
// at the cost of being a larger download than a hand-fitted subset.
const LATIN_UNICODES =
  'U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215';
const ARABIC_UNICODES = 'U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+0660-0669';

import { mkdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public/fonts');
mkdirSync(OUT_DIR, { recursive: true });

function subset({ input, output, unicodes }) {
  execFileSync('pyftsubset', [
    input,
    `--output-file=${output}`,
    `--unicodes=${unicodes}`,
    '--flavor=woff2',
    '--layout-features=*',
    '--no-hinting',
  ]);
  const bytes = statSync(output).size;
  console.log(`wrote ${output.replace(ROOT + '/', '')} (${bytes} bytes)`);
  return bytes;
}

function main() {
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
  const latinBytes = subset({
    input: latinSource,
    output: join(OUT_DIR, 'ibm-plex-sans-latin-subset.woff2'),
    unicodes: LATIN_UNICODES,
  });
  const arabic400Bytes = subset({
    input: arabic400Source,
    output: join(OUT_DIR, 'ibm-plex-sans-arabic-400-subset.woff2'),
    unicodes: ARABIC_UNICODES,
  });
  const arabic700Bytes = subset({
    input: arabic700Source,
    output: join(OUT_DIR, 'ibm-plex-sans-arabic-700-subset.woff2'),
    unicodes: ARABIC_UNICODES,
  });

  console.log('\nunicode-range values (should already match src/styles/fonts.css):');
  console.log(`  Latin:  ${LATIN_UNICODES}`);
  console.log(`  Arabic: ${ARABIC_UNICODES}`);

  console.log('\nFont bytes downloaded:');
  console.log(`  / (Latin only):        ${latinBytes} B`);
  console.log(`  /ar/ (Latin + Arabic): ${latinBytes + arabic400Bytes + arabic700Bytes} B`);
}

main();
