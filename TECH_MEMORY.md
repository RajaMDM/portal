# Tech Memory

Technical decisions, architecture rationale, and gotchas. Written for future-me
and future agents so we don't relitigate settled choices or reintroduce fixed
bugs.

## Stack

| Concern   | Choice                         | Version (as of 2026-06-26) |
| --------- | ------------------------------ | -------------------------- |
| Build     | Vite                           | ^8.1                       |
| UI        | React + React DOM              | ^19.2                      |
| Language  | TypeScript                     | ~6.0                       |
| Routing   | react-router-dom (`HashRouter`)| ^7.18                      |
| Lint      | Oxlint                         | ^1.69                      |

Full alternatives + cost analysis live in `DEFENSE_BRIEF.md`.

## Architecture

**Single-page, client-side rendered.** No backend. The app is a static bundle
(`dist/`) that any static host can serve. This is a hard constraint today
(free hosting) — see `ROADMAP.md` for the trigger that would change it.

**The mini-app registry is the spine.** `src/apps/registry.ts` exports an
`apps` array of `MiniApp` descriptors (slug, name, description, category, icon,
status, optional lazy `component`). Three things are derived from it:

- the home-page card grid (`pages/Home.tsx`)
- the header nav links (`components/Layout.tsx`, live apps only)
- the route tree (`App.tsx`, live apps with a component)

Adding a mini-app is therefore a one-line registry change plus a folder. This
keeps marginal cost of each new tool near zero, which is the whole point of a
"portal".

**Routing layout.** `main.tsx` mounts a `HashRouter`. `App.tsx` declares a
single parent `<Route element={<Layout/>}>` so every page shares the shell, with
child routes for `index` (Home), `about`, each live mini-app at
`apps/<slug>`, and a `*` catch-all (NotFound).

**Code splitting.** Mini-app components are `lazy()`-imported in the registry and
rendered inside `<Suspense>`. The initial bundle stays small as the Portal
grows; each mini-app's JS is only fetched when opened. Verified: the build emits
a separate `WelcomeApp-*.js` chunk.

## Gotchas / decisions to remember

- **HashRouter, not BrowserRouter.** URLs look like `/#/apps/welcome`. This is
  deliberate: it makes deep links work from a single `index.html` with no server
  rewrite rules, which is what free static hosts give us. Switching to
  `BrowserRouter` later requires a host that rewrites unknown paths to
  `index.html` (or a `404.html` redirect trick on GitHub Pages). Don't switch
  casually — see the ROADMAP trigger.
- **`base` path is set at deploy time, not in source.** `vite.config.ts` reads
  `PORTAL_BASE` (defaults to `/`). GitHub Pages *project* sites serve from
  `/<repo>/`, so the deploy step must set it. A custom domain (apex) serves from
  `/`, so leave it unset there. Getting this wrong = blank page / 404 assets.
- **No secrets in the repo, ever.** API keys for any mini-app are entered by the
  user at runtime and kept in memory / browser storage only.
- **`#root` is the flex container fallback;** the real layout lives on
  `.app-shell` inside `Layout`. Design tokens (colors, type, dark mode) are CSS
  variables in `index.css` and should be reused by mini-apps rather than
  hardcoding colors.

## Known external context

A separate, more complete portal is **already live at trykarkedekho.com**
(github.com/RajaMDM) — not this codebase. Source-of-truth reconciliation is an
open question raised to the CEO on TRY-2; do not assume this scaffold is the
deployed site until that is resolved.
