# CrewHealth.AI website

Marketing website for CrewHealth.AI, a platform that turns clinical, claims and
operational data into analytics and AI agents that act on it. Accountable care
organizations are the first market; the copy is written so the same site serves
health systems, payers and provider groups.

> Brand: CrewHealth.AI (wordmark "CrewHealth.AI", "CrewHealth" in running copy). Metrics in the product mockup are illustrative.

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript, built with Vite 7 |
| Styling | Tailwind CSS v4 (design tokens in `src/index.css`) |
| Animation | [Motion](https://motion.dev) (`motion/react`) — scroll reveals, layout animations, spring dial, animated pipeline |
| Icons | lucide-react |
| Fonts | Figtree (headings) + Noto Sans (body), the "Medical Clean" pairing from UI/UX Pro Max |

### Design guidance

The visual system follows the UI/UX Pro Max recommendations for healthcare / enterprise
products: a "Trust & Authority + Conversion" page structure (hero → proof → solution →
clear CTA), clinical blue and health green, 16px+ readable type, WCAG-minded contrast,
restrained motion, and no neon or purple "AI" gradients. Components such as the
spotlight cards, marquees, bento grid, and animated activity feed are built in the
style of 21st.dev components.

## Sections

1. **Hero** — headline, CTAs, trust signals, and a live-updating agent activity feed.
2. **Proof strip** — programs and standards supported (MSSP, ACO REACH, HEDIS, FHIR, CCLF…).
3. **Problem** — why follow-through is the bottleneck in value-based care.
4. **Agents** — bento grid of eight purpose-built agents with inputs, actions, and measures.
5. **How it works** — Connect → Understand → Act → Learn, with an animated pipeline.
6. **Agent demo** — interactive, step-by-step replay of three real workflows with a human approval gate.
7. **Outcomes** — KPI stat tiles with count-up values, deltas, and sparklines.
8. **Governance** — an interactive autonomy dial plus six safety pillars.
9. **Roles** — what each ACO role gets (Medical Director, Care Management, Quality, CFO, IT).
10. **Integrations** — EHR, data platform, and outreach vendor marquee.
11. **FAQ** — accordion.
12. **Contact** — demo request form (front-end only).

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

## Customize

- Copy, agents, FAQs, and demo scenarios live in `src/lib/data.ts`.
- Colors, fonts, and shadows are Tailwind theme tokens in `src/index.css`.
- Each page section is a self-contained component in `src/sections/`.

## Deploy

The site is published to GitHub Pages at https://crewhealth.ai by `.github/workflows/deploy.yml`
on every push to `main`.

One-time setup:
1. Organization settings → Pages → add and verify `crewhealth.ai` (TXT record in Hostinger DNS).
2. Repository settings → Pages → Source: **GitHub Actions**; Custom domain: `crewhealth.ai`.
3. Hostinger DNS: four `A` records for `@` (185.199.108.153, .109.153, .110.153, .111.153)
   and `CNAME www → crewhealth-ai.github.io`.
4. Enforce HTTPS once the DNS check passes.
