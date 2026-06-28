# Changelog

Meaningful, dated changes — not every commit. Newest first.

## 2026-06-28 (first AI example)

**AI Examples mini-app shipped: a client-side Text Summarizer (TRY-16).**

- New mini-app at `#/apps/ai-summarizer`: paste any text, pick a model and an
  output style (concise paragraph / bullets / key takeaways), and Claude streams
  back a summary — entirely in the browser.
- **User-supplied key, never persisted.** The Anthropic API key is entered at
  runtime, held in component state (memory) only, and sent only to
  `api.anthropic.com`. It is never written to disk, never committed, and a page
  reload clears it. Show/hide and Clear controls plus a plain-English privacy
  note sit next to the field.
- Built on the official `@anthropic-ai/sdk` (browser mode) with streaming,
  typed error mapping (bad key, rate limit, network, etc.), and a cancel/Stop
  control. Default model **Claude Opus 4.8**; Sonnet 4.6 and Haiku 4.5 offered
  as cheaper/faster options the user can pick.
- Lazily code-split: the SDK + app load only when this mini-app is opened
  (~42 kB gzip), so the rest of the Portal is unaffected.
- The AI Examples section now surfaces a live tool instead of an empty state.

_Business impact:_ the Portal's fourth section is no longer a placeholder — it
demonstrates a real, useful AI feature with a defensible privacy story (no
backend, no stored secrets), reinforcing the "bring your own key" pattern that
keeps hosting free.

_Verified:_ `npm run lint` and `npm run build` pass; headless browser confirms
the card renders, the mini-app loads, an invalid key produces the mapped error
"That API key was rejected" via a real 401 round-trip (CORS works), and the
layout is responsive (desktop + mobile screenshots captured).

## 2026-06-27 (Portal is LIVE)

**The Portal is deployed and publicly serving (TRY-4).**

- Live URL: **https://rajamdm.github.io/portal/** — HTTP 200, shell + Recipes
  mini-app render, JS bundle loads under the `/portal/` base path.
- Deployed via the existing GitHub Actions workflow (`.github/workflows/deploy.yml`)
  to a **new, isolated public repo** `RajaMDM/portal`. Pages source = GitHub
  Actions. Every push to `main` now redeploys automatically.
- **Zero-downtime constraint honored.** The live personal site
  `https://trykarkedekho.com/` (separate Astro/Cloudflare repo `RajaMDM/trykarkedekho`)
  was verified UP and untouched before and after deploy. No `CNAME`, no DNS
  change, no apex contact — the Portal lives entirely on its own GitHub Pages
  project URL, exactly the CEO-approved Option A (TRY-6).
- **Unblock note:** the prior blocker ("owner must create the GitHub repo and
  push") was a capability gap, not a true blocker — the local `gh` CLI is
  authenticated as `RajaMDM`, so the founding engineer created the repo, pushed,
  enabled Pages, and verified the live URL directly.

_Business impact:_ the Portal now has a real public address. The company's first
deliverable is shipped and self-redeploying; the only remaining lever for a
custom subdomain (`portal.trykarkedekho.com`) is additive and gated on CEO
sign-off.

## 2026-06-26 (first mini-app)

**Recipes module MVP — the Portal's first real vertical slice (TRY-5).**

- New self-contained mini-app under `src/apps/recipes/`: a browser-only recipe
  book. Add a recipe, browse the list, expand any card for ingredients and
  method, search across name/category/ingredients, and delete.
- **Persistence** is plain `localStorage` under a versioned key
  (`try-portal:recipes:v1`) — no backend, no account, nothing leaves the
  device. The data layer (`data.ts`) seeds three fictitious sample recipes on
  first run and degrades gracefully if storage is unavailable or corrupt.
- Wired in with a **single registry entry** (`src/apps/registry.ts`), which is
  all it takes to mount the route, the nav, and the home-grid card — proving
  the module pattern the shell was built for.
- Styling (`recipes.css`) is scoped but built on the Portal's design tokens, so
  it inherits light/dark mode and matches the shell.

_Business impact:_ the first product area now has a working tool, not a
placeholder, and the "drop a folder, add one line" pattern is proven for every
mini-app that follows. Verified in a headless browser: seed recipes render, a
new recipe is added and survives a true page reload (localStorage), and search
filters by name, category, and ingredient. `npm run build` passes with the app
code-split into its own lazy chunk.

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
