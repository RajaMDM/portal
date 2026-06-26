# Changelog

Meaningful, dated changes — not every commit. Newest first.

## 2026-06-26 (shell + navigation)

**Portal shell with four top-level sections (TRY-3).**

- Added a **sections registry** (`src/sections.ts`) as the single source of
  truth for the four areas: **School, Data, Recipes, AI Examples**. It carries
  each section's name, tagline, icon, and the mini-app `category` it surfaces.
- New generic **section page** (`src/pages/Section.tsx`) mounted at `/:section`.
  It lists the live mini-apps in its category, or shows an **empty-state
  placeholder** ("Nothing here yet") until any ship. One component serves all
  four sections, so adding a section is a one-line registry change.
- Nav (`Layout`) and the home page now generate their links from the sections
  registry. Home leads with the four section cards, then a "Jump back in" strip
  of any live mini-apps.
- Styling: section hero icon, empty-state card, and the home mini-app strip.

_Business impact:_ the Portal now has a real navigable shell. A visitor can
reach all four product areas from the nav and see what each will hold, even
before the first tool ships. Verified in a headless browser: all four sections
resolve, render their names + empty states, nav highlights the active section,
the layout reflows on mobile (375px), unknown routes fall back to NotFound, and
the example mini-app still lazy-loads. `npm run build` and `npm run lint` pass.

## 2026-06-26 (later)

**Codified the live-site no-touch deployment guardrail (TRY-7).**

- Added an explicit **Deployment Safety** section to `TECH_MEMORY.md` and
  `DEFENSE_BRIEF.md`, plus a guardrail note on the deployment item in
  `ROADMAP.md`. States that `trykarkedekho.com` is a live production site on a
  separate codebase, that Portal deploys are additive (own Pages project or
  `portal.trykarkedekho.com` subdomain), and that any apex `CNAME`/DNS/cutover
  needs explicit board approval (apex cutover = sev-1, staged plan + rollback).

_Business impact:_ the guardrail now lives in the repo, not just in CEO/engineer
memory — a future agent reading the docs before a deploy will see the constraint
without tribal knowledge, reducing the risk of accidentally taking the live site
down.

## 2026-06-26

**Foundation: stack decision + repo scaffold (TRY-2).**

- Chose the stack: Vite 8 + React 19 + TypeScript + React Router 7 (`HashRouter`)
  + Oxlint. Single-page, client-side rendered, static-host friendly. Rationale
  and alternatives recorded in `DEFENSE_BRIEF.md`.
- Established the **mini-app registry** pattern: one list drives the home grid,
  nav, and routes. Adding a mini-app is a one-line change.
- Wired the Portal shell: shared `Layout` (header/nav/footer), `Home` (mini-app
  card grid), `About`, `NotFound`, and an example `Welcome Tour` mini-app
  proving the registry → route → lazy-load wiring.
- Replaced the leftover Vite starter screen with the real Portal app; removed
  demo assets; added Portal styles (design tokens + dark mode retained).
- Seeded living docs: README, PROJECT_HISTORY, TECH_MEMORY, CHANGELOG, ROADMAP,
  DEFENSE_BRIEF.
- Initialized the git repository with a clean first commit.

_Business impact:_ the company now has a real, buildable code foundation that
new tools can be dropped into cheaply. Verified: `npm run build` and
`npm run lint` pass; the example mini-app loads on its own route.

_Open item:_ a separate portal is already live at trykarkedekho.com — source-of-
truth reconciliation raised to the CEO on TRY-2.
