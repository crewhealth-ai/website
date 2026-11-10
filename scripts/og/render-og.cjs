/* Renders the Open Graph image (1200x630) into public/og.png. */
const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const template = path.resolve(__dirname, "og.html");
const out = path.resolve(__dirname, "../../public");
const variants = [{ file: "og.png", theme: "" }];

(async () => {
  // CHROMIUM_PATH lets CI or a sandbox point at a preinstalled browser; locally the default download is used.
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  let html = fs.readFileSync(template, "utf8");
  for (const v of variants) {
    const doc = v.theme
      ? html.replace('<html lang="en">', `<html lang="en" data-theme="${v.theme}">`).replace("family=Figtree:wght@500;600", "family=Outfit:wght@500;600&family=Instrument+Serif:ital@1")
      : html;
    await page.setContent(doc, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, v.file), type: "png" });
    console.log("wrote", path.join(out, v.file));
  }
  await browser.close();
})();
