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

## Data Profiler mini-app (TRY-15)

`src/apps/data-profiler/` — three files: `parse.ts` (file → `Table`),
`profile.ts` (`Table` → per-column stats, pure functions), `DataProfilerApp.tsx`
(UI state machine: idle → parsing → done|error).

- **Why fflate, not SheetJS (`xlsx`).** The de-facto XLSX library's *npm*
  package is frozen at 0.18.5 (Apr 2022) with prototype-pollution CVE-2023-30533;
  the fix (0.19.3+) ships only from the vendor's private CDN, not npm. We don't
  pull half-maintained CVE'd code for a demo tool. Instead: **fflate** (`^0.8.3`,
  MIT, ~8 KB, actively maintained) unzips the OOXML container and the browser's
  own `DOMParser` reads the worksheet XML. Full control, no `any`, smaller
  bundle. Details + alternatives in `DEFENSE_BRIEF.md`.
- **XLSX is a ZIP of XML.** We read `xl/workbook.xml` + `xl/_rels/workbook.xml.rels`
  to resolve the *first sheet by tab order* (not blindly `sheet1.xml`),
  `xl/sharedStrings.xml` for string cells, and `xl/styles.xml` to learn which
  cell styles are date formats.
- **Excel date gotcha.** Dates are stored as serial numbers; whether a number is
  a date is a *style* property (`numFmtId` 14–22/45–47 built-in, or a custom
  `formatCode` containing d/m/y/h/s tokens), not a cell type. We map style index
  → is-date, then convert serial → `Date` using epoch **1899-12-30** (absorbs
  Excel's 1900-leap-year bug). Miss this and date columns render as `45306`.
- **CSV parser is hand-rolled** (no dep) — a single-pass state machine for
  quotes/escapes/embedded delimiters/CRLF, plus delimiter auto-detect from the
  first line. CSV cells stay strings; `profile.ts` sniffs them with conservative
  regexes (so a zip code isn't mistaken for a number-that's-a-date).
- **Lazy-loaded.** Registered with `status: 'live'` + a `lazy()` component, so
  fflate + the parser ship only when someone opens the tool (6.9 KB gzip chunk).
- **Testing gotcha:** deep links are **hash** routes. The headless URL is
  `http://localhost:<port>/#/apps/data-profiler`. Navigating to the *path*
  `/apps/data-profiler` renders Home (empty hash → index route), which can look
  like a routing bug but isn't.

## Deployment Safety (read before ANY deploy)

**`trykarkedekho.com` is a LIVE production site and a SEPARATE codebase**
(github.com/RajaMDM, Astro/Cloudflare) — it is NOT this Portal repo. Board
directive on TRY-2: *"We do not touch the live site by any means."* This is a
hard guardrail, not a preference. Any agent or engineer must honor it without
needing tribal knowledge.

Rules:

- **Never deploy the Portal over the live site.** Do not point a Portal build,
  branch, or CI job at the `trykarkedekho.com` apex/origin under any
  circumstances.
- **Portal deploys are additive only.** Ship to the Portal's *own* GitHub Pages
  project site, or to a dedicated `portal.trykarkedekho.com` subdomain — never
  the apex.
- **No DNS / domain changes without explicit board approval.** No `CNAME` file
  pointing at the apex, no Cloudflare DNS edits, no apex cutover. An apex
  cutover is a **sev-1** change and requires a staged plan + tested rollback
  signed off by the board *before* execution.
- **No secrets, ever.** API keys for any mini-app are entered by the user at
  runtime and kept in memory / browser storage only — nothing committed to the
  repo or a deploy config.

Source-of-truth reconciliation (is this scaffold canonical, or do we adopt the
live codebase?) is an open question raised to the CEO on TRY-2. Until resolved,
do not assume this scaffold is the deployed site — but regardless of that
outcome, the no-touch guardrail above stands.
