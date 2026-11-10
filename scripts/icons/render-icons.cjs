/*
 * Renders the PNG and ICO icons from public/favicon.svg so every icon is the same mark.
 *   npm run icons        (CHROMIUM_PATH can point at a preinstalled browser)
 * Writes public/favicon.ico (16, 32, 48), public/apple-touch-icon.png (180, full-bleed for iOS masks),
 * public/icon-192.png and public/icon-512.png (rounded tile, transparent corners).
 */
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const pub = path.resolve(__dirname, "../../public");
const svg = fs.readFileSync(path.join(pub, "favicon.svg"), "utf8");
// iOS rounds the corners itself and shows black behind transparency, so the touch icon fills the square
// and draws the crew slightly smaller to keep the same visual margin.
const fullBleed = svg
  .replace('rx="16"', 'rx="0"')
  .replace(/<circle/, '<g transform="translate(32 32) scale(0.86) translate(-32 -32)"><circle')
  .replace("</svg>", "</g></svg>");

async function render(page, source, size) {
  const sized = source.replace("<svg ", `<svg width="${size}" height="${size}" `);
  await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${sized}</body></html>`);
  return page.screenshot({ clip: { x: 0, y: 0, width: size, height: size }, omitBackground: true, type: "png" });
}

/** An ICO container holding PNG images, which every current browser reads. */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const dir = images.map(({ size, png }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    return e;
  });
  return Buffer.concat([header, ...dir, ...images.map((i) => i.png)]);
}

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage({ viewport: { width: 600, height: 600 }, deviceScaleFactor: 1 });
  const icoImages = [];
  for (const size of [16, 32, 48]) icoImages.push({ size, png: await render(page, svg, size) });
  fs.writeFileSync(path.join(pub, "favicon.ico"), ico(icoImages));
  fs.writeFileSync(path.join(pub, "apple-touch-icon.png"), await render(page, fullBleed, 180));
  fs.writeFileSync(path.join(pub, "icon-192.png"), await render(page, svg, 192));
  fs.writeFileSync(path.join(pub, "icon-512.png"), await render(page, svg, 512));
  await browser.close();
  console.log("wrote favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png");
})();
