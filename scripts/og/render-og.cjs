/* Renders the Open Graph image (1200x630) from og.html into public/og.png.   npm run og */
const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const template = path.resolve(__dirname, "og.html");
const out = path.resolve(__dirname, "../../public/og.png");

(async () => {
  // CHROMIUM_PATH lets CI or a sandbox point at a preinstalled browser; locally the default download is used.
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(fs.readFileSync(template, "utf8"), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: out, type: "png" });
  await browser.close();
  console.log("wrote", out);
})();
