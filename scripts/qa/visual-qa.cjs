/*
 * Visual and behavioural QA for the CrewHealth.AI site, in the spirit of playwright-cli:
 * one Chromium, several viewports and device emulations, assertions where they can be
 * automated and screenshots where a person has to look.
 *
 *   npm run build && npx vite preview --port 4173 &
 *   CHROMIUM_PATH=/opt/pw-browsers/chromium node scripts/qa/visual-qa.cjs [outDir]
 */
const { chromium, devices } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const BASE = process.env.QA_BASE || "http://localhost:4173";
const OUT = process.argv[2] || path.resolve(process.cwd(), ".qa");
fs.mkdirSync(OUT, { recursive: true });

const matrix = [
  { tag: "desk", ctx: { viewport: { width: 1440, height: 900 } } },
  { tag: "laptop", ctx: { viewport: { width: 1280, height: 720 } } },
  { tag: "z150", ctx: { viewport: { width: 1066, height: 600 } } },
  { tag: "tablet", ctx: { viewport: { width: 768, height: 1024 } } },
  { tag: "iphone", ctx: { ...devices["iPhone 14"] } },
  { tag: "reduced", ctx: { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" } },
];

const settle = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForScrollSettle(page, max = 4000) {
  let last = -1;
  const start = Date.now();
  while (Date.now() - start < max) {
    await settle(150);
    const y = await page.evaluate(() => window.scrollY);
    if (y === last) break;
    last = y;
  }
  await settle(600);
}

async function scrollTo(page, y, wait = 1400) {
  await page.evaluate((v) => window.scrollTo({ top: v, behavior: "auto" }), y);
  await settle(wait);
}

async function run(browser, pagePath, m) {
  const ctx = await browser.newContext(m.ctx);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (c) => c.type() === "error" && errors.push(c.text()));
  const tag = m.tag;
  const r = { page: pagePath, tag, reduced: !!m.ctx.reducedMotion, checks: {}, errors };

  await page.goto(BASE + pagePath, { waitUntil: "networkidle" });
  // The site uses CSS smooth scrolling; the QA run jumps so measurements are deterministic.
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  await settle(1500);
  await page.screenshot({ path: `${OUT}/${tag}-01-hero.png` });

  const facts = await page.evaluate(() => {
    const vw = window.innerWidth;
    const h1 = document.querySelector("h1");
    const nav = document.querySelector("header");
    return {
      title: document.title,
      theme: document.documentElement.dataset.theme || "clinical",
      noOverflow: document.documentElement.scrollWidth <= vw,
      h1Count: document.querySelectorAll("h1").length,
      h2Count: document.querySelectorAll("h2").length,
      h1Clipped: h1 ? h1.scrollWidth > h1.clientWidth + 1 : null,
      navSolid: nav ? getComputedStyle(nav).backdropFilter === "none" && getComputedStyle(nav).backgroundColor !== "rgba(0, 0, 0, 0)" : null,
      railLinks: document.querySelectorAll('nav[aria-label="Page progress"] a').length,
      skipLinkFirst: !!document.querySelector('a[href="#main"]'),
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "",
      screens: +(document.body.scrollHeight / window.innerHeight).toFixed(1),
      fontsHeading: document.fonts ? [...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.family} ${f.weight}`).slice(0, 8) : [],
      eyebrowCaps: [...document.querySelectorAll("main *")].filter((el) => el.children.length === 0 && getComputedStyle(el).textTransform === "uppercase" && (el.textContent || "").trim().length > 2).length,
    };
  });
  Object.assign(r.checks, facts);

  // Anchors from the navbar / mobile menu: each target lands within the header height.
  const isMobile = (m.ctx.viewport?.width || 0) < 1024;
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await settle(400);
    r.checks.mobileMenuLinks = await page.locator('nav[aria-label="Mobile"] a').count();
    await page.locator('nav[aria-label="Mobile"] a', { hasText: "Agents" }).click();
  } else {
    await page.locator('nav[aria-label="Primary"] a', { hasText: "Agents" }).click();
  }
  await waitForScrollSettle(page);
  r.checks.agentsAnchorTop = await page.evaluate(() => Math.round(document.getElementById("agents").getBoundingClientRect().top));
  await page.screenshot({ path: `${OUT}/${tag}-02-agents.png` });

  // Demo gate: steps run, the approval button appears, approving continues to "Loop closed".
  await page.evaluate(() => document.getElementById("demo").scrollIntoView({ block: "start", behavior: "instant" }));
  await waitForScrollSettle(page);
  await scrollTo(page, (await page.evaluate(() => window.scrollY)) + 1, 6000);
  const approve = page.getByRole("button", { name: "Approve and continue" });
  r.checks.approveVisible = await approve.isVisible().catch(() => false);
  if (r.checks.approveVisible) {
    await approve.click();
    await page.getByText("Loop closed").waitFor({ timeout: 10000 }).catch(() => {});
  }
  r.checks.loopClosed = await page.getByText("Loop closed").isVisible().catch(() => false);
  await page.screenshot({ path: `${OUT}/${tag}-03-demo.png` });

  // Autonomy dial is a radiogroup with a working selection.
  await page.evaluate(() => document.getElementById("trust").scrollIntoView({ block: "start", behavior: "instant" }));
  await settle(1800);
  await page.getByRole("radio", { name: "Act", exact: true }).click();
  r.checks.dialAct = await page.getByRole("radio", { name: "Act", exact: true }).getAttribute("aria-checked");
  await page.screenshot({ path: `${OUT}/${tag}-04-trust.png` });

  // Form: labels exist, required validation holds, a status line appears after a valid submit.
  await page.evaluate(() => document.getElementById("contact").scrollIntoView({ block: "start", behavior: "instant" }));
  await settle(1800);
  r.checks.formLabels = await page.locator('form label[for="cta-email"], form label[for="cta-org"]').count();
  r.checks.emailInvalidWhenEmpty = await page.evaluate(() => !document.getElementById("cta-email").validity.valid);
  await page.getByLabel("Work email").fill("qa@example.org");
  await page.getByLabel("Organization").fill("Riverbend Health ACO");
  await page.getByRole("button", { name: "Book a demo" }).last().click().catch(() => {});
  await settle(600);
  r.checks.formStatus = (await page.locator('form [role="status"]').textContent().catch(() => "")).trim().slice(0, 80);
  await page.screenshot({ path: `${OUT}/${tag}-05-close.png` });

  // Keyboard: Tab from the top lands on the skip link; focus ring is visible on the first field.
  await scrollTo(page, 0, 600);
  await page.keyboard.press("Tab");
  r.checks.firstTabTarget = await page.evaluate(() => (document.activeElement && document.activeElement.textContent) || "");
  await page.focus("#cta-email");
  r.checks.fieldFocusOutline = await page.evaluate(() => getComputedStyle(document.getElementById("cta-email")).outlineStyle);

  await ctx.close();
  return r;
}

(async () => {
  const launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] } : {};
  const browser = await chromium.launch(launch);
  const results = [];
  for (const pagePath of ["/"]) {
    for (const m of matrix) {
      try {
        results.push(await run(browser, pagePath, m));
      } catch (e) {
        results.push({ page: pagePath, tag: m.tag, fatal: String(e.message || e) });
      }
    }
  }
  await browser.close();
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(results, null, 2));
  for (const r of results) {
    const c = r.checks || {};
    const flags = [];
    if (r.fatal) flags.push(`FATAL ${r.fatal}`);
    if (r.errors && r.errors.length) flags.push(`${r.errors.length} console errors`);
    if (c.noOverflow === false) flags.push("overflow");
    if (c.h1Count !== 1) flags.push(`h1=${c.h1Count}`);
    if (c.h1Clipped) flags.push("h1 clipped");
    if (c.navSolid === false) flags.push("nav not solid");
    if (c.approveVisible === false && !r.reduced) flags.push("no approve gate");
    if (c.loopClosed === false) flags.push("loop not closed");
    if (c.dialAct !== "true") flags.push("dial");
    if (c.formLabels !== 2) flags.push("labels");
    if (!c.formStatus) flags.push("no form status");
    if (c.fieldFocusOutline === "none") flags.push("no focus ring");
    if (c.eyebrowCaps > 0) flags.push(`${c.eyebrowCaps} uppercase labels`);
    console.log(`${r.tag.padEnd(10)} screens=${c.screens ?? "-"} anchor=${c.agentsAnchorTop ?? "-"} ${flags.length ? "FLAGS: " + flags.join(", ") : "ok"}`);
  }
  console.log(`report: ${OUT}/report.json`);
})();
