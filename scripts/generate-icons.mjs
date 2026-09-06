// Regenerates the favicon/manifest/OG icon set from the existing InjazApps
// mark. Run with: node scripts/generate-icons.mjs
//
// Source note: the generation source is assets/injazapps-icon-512.png, the
// full-bleed 512x512 square mark — hard joint at x=256, no corner radius,
// no transparency. It is NOT public/injazapps-icon-web-48r.png: that 48px
// variant has real transparent corners, and compositing it into masked
// shapes (Apple touch icon, Android maskable icon) would double-round the
// corners under the platform's own mask. The 48r variant stays the source
// for the in-page Header logo only.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCE_ICON = join(ROOT, 'assets/injazapps-icon-512.png');
const OUT_DIR = join(ROOT, 'public');

const BASALT = '#1B1A17';
const LIMESTONE = '#EDE4D3';
const BORDER_DEFAULT = '#3A3833';
const CAIRO_BRASS = '#C08A2E';

async function buildFavicon() {
  const sizes = [16, 32];
  const buffers = await Promise.all(
    sizes.map((size) => sharp(SOURCE_ICON).resize(size, size).png().toBuffer()),
  );
  const ico = await pngToIco(buffers);
  writeFileSync(join(OUT_DIR, 'favicon.ico'), ico);
  console.log('wrote favicon.ico (16, 32)');
}

async function buildAppleTouchIcon() {
  const outPath = join(OUT_DIR, 'apple-touch-icon.png');
  await sharp(SOURCE_ICON)
    .resize(180, 180)
    .flatten({ background: BASALT })
    .removeAlpha()
    .png()
    .toFile(outPath);

  const meta = await sharp(outPath).metadata();
  if (meta.hasAlpha) {
    throw new Error('apple-touch-icon.png unexpectedly retained an alpha channel');
  }
  console.log(`wrote apple-touch-icon.png (180x180, alpha: ${meta.hasAlpha})`);
}

async function buildPlainIcon(size, filename) {
  const outPath = join(OUT_DIR, filename);
  await sharp(SOURCE_ICON).resize(size, size).png().toFile(outPath);
  console.log(`wrote ${filename} (${size}x${size})`);
}

async function buildMaskableIcon() {
  const size = 512;
  const innerSize = Math.round(size * 0.66);
  const inner = await sharp(SOURCE_ICON).resize(innerSize, innerSize).toBuffer();

  const outPath = join(OUT_DIR, 'icon-maskable-512.png');
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: BASALT,
    },
  })
    .composite([{ input: inner, gravity: 'center' }])
    .flatten({ background: BASALT })
    .removeAlpha()
    .png()
    .toFile(outPath);
  console.log(`wrote icon-maskable-512.png (${size}x${size}, mark at 66%)`);
}

function ablaqSegmentsSvg({ x, y, height, segments = 9, width = 8 }) {
  const segmentHeight = height / segments;
  const accentIndex = Math.floor(segments / 2);
  let rects = '';
  for (let i = 0; i < segments; i++) {
    const fill = i === accentIndex ? CAIRO_BRASS : i % 2 === 0 ? LIMESTONE : BORDER_DEFAULT;
    rects += `<rect x="${x}" y="${y + i * segmentHeight}" width="${width}" height="${segmentHeight}" fill="${fill}" />`;
  }
  return rects;
}

async function buildOgDefault() {
  const width = 1200;
  const height = 630;
  const markSize = 380;
  const markMarginEnd = 90;
  const markX = width - markMarginEnd - markSize;
  const markY = Math.round((height - markSize) / 2);

  const dividerX = 660;
  const dividerTop = 120;
  const dividerHeight = height - dividerTop * 2;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${BASALT}" />
      <text x="90" y="290" font-family="'IBM Plex Sans', Arial, sans-serif" font-weight="700" font-size="72" fill="${LIMESTONE}">InjazApps</text>
      <text x="90" y="340" font-family="'IBM Plex Sans', Arial, sans-serif" font-weight="400" font-size="30" fill="${LIMESTONE}" opacity="0.72">Software cut to fit.</text>
      ${ablaqSegmentsSvg({ x: dividerX, y: dividerTop, height: dividerHeight })}
    </svg>
  `;

  const background = await sharp(Buffer.from(svg)).png().toBuffer();
  const mark = await sharp(SOURCE_ICON).resize(markSize, markSize).toBuffer();

  const outPath = join(OUT_DIR, 'og-default.png');
  await sharp(background)
    .composite([{ input: mark, left: markX, top: markY }])
    .flatten({ background: BASALT })
    .png()
    .toFile(outPath);
  console.log(`wrote og-default.png (${width}x${height})`);
}

async function main() {
  readFileSync(SOURCE_ICON); // fail fast with a clear error if the source is missing
  await buildFavicon();
  await buildAppleTouchIcon();
  await buildPlainIcon(192, 'icon-192.png');
  await buildPlainIcon(512, 'icon-512.png');
  await buildMaskableIcon();
  await buildOgDefault();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
