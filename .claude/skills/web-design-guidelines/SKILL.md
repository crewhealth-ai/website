---
name: web-design-guidelines
description: Review UI code against Vercel's Web Interface Guidelines (accessibility, focus, forms, animation, typography, content handling, performance, navigation, touch, layout, theming, copy). Use when asked to review, audit or check the site's UI, UX or accessibility against best practices.
---

# Web Interface Guidelines review

The rules live in `guidelines.md` next to this file. It is a verbatim copy of
`vercel-labs/web-interface-guidelines` `command.md` (MIT, Vercel Labs, see `LICENSE`).
Refresh it from
`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`
when you want the latest rules.

## How to review

1. Read `guidelines.md` in full.
2. Read the files under review (default for this repo: `index.html`, `src/**/*.tsx`, `src/index.css`).
3. Check every rule. Where the code passes, say so per file.
4. Report findings in the `file:line - issue` format the guidelines specify.

## House rules that win over the guidelines

- Headings and buttons use sentence case ("Book a demo"), not Title Case.
- The site speaks as the company ("We reply within one business day") where it makes a commitment, and to the reader elsewhere.
- Scroll-linked motion is the site's signature: check it honours `prefers-reduced-motion` and stays compositor-friendly rather than removing it.
