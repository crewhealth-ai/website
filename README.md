# CrewHealth.AI website

Marketing website for CrewHealth.AI, a platform that turns clinical, claims and
operational data into analytics and AI agents that act on it, with a clinician
approving patient outreach. Accountable care organizations are the first market;
the copy is written so the same site serves health systems, payers and provider groups.

Live at https://crewhealth.ai (GitHub Pages, deployed from `main`).

## Brand

- **Name:** "CrewHealth.AI" is the formal name and the wordmark (logo, title, footer); running copy says "CrewHealth".
- **Mark:** a crew of three on a rounded tile, the lead in the accent. `src/components/Logo.tsx`, `public/favicon.svg`
  and every generated icon use the same geometry and colours.
- **Colour and type:** tokens in `src/index.css`. Periwinkle page ground with a white 48px grid, white cards,
  one action colour (`#2f5bea`). Outfit for headings (500/600), Instrument Serif italic for the one accent word,
  Noto Sans for body text (400/500). Use only the loaded weights.
- **Voice:** sentence case for headings and buttons, no eyebrow labels, no invented proof.

## Product views use a demo workspace

Every product view on the page (the hero console, the How it works panels, the agent cards and the demo runs)
shows a demo workspace with fictional patients and organizations. The page says so under the demo and in the footer.

- Show workflow states and workload counts (drafted, awaiting approval, booked, queue sizes), never outcome or
  impact figures such as readmissions avoided, savings or rate lifts.
- Use coined organization names, and search each new one before it ships so it is not a real hospital, health system or ACO.
- Keep the story consistent everywhere: M. López, 72, CHF, discharged Wednesday from Quillmont General, risk score 0.81,
  RN Ortiz's call on day 1, PCP visit with Dr. Chen on Tuesday 10:40 (day 6).

## Sections

1. **Hero:** headline, the two actions, three commitments, and the console (demo workspace) that rises as you scroll.
2. **How it works:** Connect, Understand, Act, Learn. Pinned on desktop with a panel per step; stacked on tablets, phones and with reduced motion.
3. **Agents:** two feature cards with product fragments, six more agents, and the shared analytics layer.
4. **Demo:** three sample runs with fictional patients. Steps appear one at a time; the run stops at the
   clinician step until someone clicks Approve, then the remaining steps follow.
5. **Trust:** the autonomy dial (Suggest, Draft, Act with approval, Act) and four commitments.
6. **Book a demo:** the form, three commitments, and the footer.

## How the scroll scenes work

`src/components/Scene.tsx` is the scene engine. A pinned scene is a tall section whose content sticks for one
viewport and cross-fades with its neighbours (opacity, slide, scale and a blur that is only applied mid-transition).

- Scenes pin only at 1024px wide and 640px tall or more, never with `prefers-reduced-motion`, and only while their
  content fits at 85% or more of its natural size; otherwise the section is laid out in normal flow.
- A fading layer stops taking clicks below 60% opacity, so an invisible scene never covers visible content.
- Keyboard focus inside a scene that is still fading scrolls the page to where the scene is fully shown.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
npm run lint     # type-check the app and the Vite config
npm run qa       # Playwright checks in six viewports (needs `npm run preview` running)
npm run og       # re-render public/og.png from scripts/og/og.html
npm run icons    # re-render favicon.ico, apple-touch-icon.png and icon-*.png from public/favicon.svg
```

In a sandbox without Playwright's own browser, set `CHROMIUM_PATH` to a local Chromium for `qa`, `og` and `icons`.

## Customize

- Agents and demo scenarios: `src/lib/data.ts`.
- Colours, fonts and shadows: theme tokens in `src/index.css`.
- Each page section is a self-contained component in `src/sections/`.
- The demo form posts JSON to `VITE_DEMO_ENDPOINT` when it is set at build time; otherwise it opens the visitor's
  email app with a message to hello@crewhealth.ai.

## Design references

`.claude/skills/` holds the design skills used to build and review the site: impeccable, taste-skill,
playwright-cli, ui-ux-pro-max (nextlevelbuilder, MIT) and web-design-guidelines (Vercel's Web Interface
Guidelines, MIT). They are documentation only and are not part of the build.

## Confirm before launch

These statements are commitments the company must be able to stand behind:

- "HIPAA BAA before any PHI is shared", encryption in transit and at rest, prompts limited to the data a task needs,
  and "your data is never used to train models for other customers" (Hero, Trust, Book a demo).
- "A clinician approves patient outreach": the product must stop the Act level from contacting patients.
- "Every action logged" and the audit trail description.
- "We aim to reply within one business day": hello@crewhealth.ai needs a monitored mailbox, and a form endpoint
  (`VITE_DEMO_ENDPOINT`) is needed to capture requests without relying on the visitor's email app.
- A privacy notice, since the form asks for work emails.
- An NCQA licence before the product calculates HEDIS® results; claim no certification before NCQA Measure Certification.

## Deploy

The site is published to GitHub Pages at https://crewhealth.ai by `.github/workflows/deploy.yml`
on every push to `main`.

One-time setup:
1. Organization settings → Pages → add and verify `crewhealth.ai` (TXT record in Hostinger DNS).
2. Repository settings → Pages → Source: **GitHub Actions**; Custom domain: `crewhealth.ai`.
3. Hostinger DNS: four `A` records for `@` (185.199.108.153, .109.153, .110.153, .111.153)
   and `CNAME www → crewhealth-ai.github.io`.
4. Enforce HTTPS once the DNS check passes.
