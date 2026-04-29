/**
 * Rasterizes `public/logo/logo-single.svg` to PNG + ICO favicons.
 * Run when the logo changes: npm run favicons
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import sharp from 'sharp';
import toIco from 'to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'public/logo/logo-single.svg');
const OUT = path.join(ROOT, 'public');

async function pngFromSvg(buffer, size) {
  return sharp(buffer)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function main() {
  const svg = await fs.readFile(SRC);

  const [png16, png32, apple] = await Promise.all([
    pngFromSvg(svg, 16),
    pngFromSvg(svg, 32),
    pngFromSvg(svg, 180),
  ]);

  await Promise.all([
    fs.writeFile(path.join(OUT, 'favicon-16x16.png'), png16),
    fs.writeFile(path.join(OUT, 'favicon-32x32.png'), png32),
    fs.writeFile(path.join(OUT, 'apple-touch-icon.png'), apple),
    fs.writeFile(path.join(OUT, 'favicon.ico'), await toIco([png16, png32])),
  ]);

  console.log('favicons: wrote favicon.ico, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
