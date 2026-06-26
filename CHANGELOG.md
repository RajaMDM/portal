# Changelog

Meaningful, dated changes — not every commit. Newest first.

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
