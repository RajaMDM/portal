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

## AI Examples: client-side Claude calls (TRY-16)

The first AI mini-app (`src/apps/ai-summarizer/`) calls the Anthropic Messages
API **directly from the browser**. Key technical decisions and gotchas:

- **Official SDK, browser mode.** Uses `@anthropic-ai/sdk` with
  `dangerouslyAllowBrowser: true`. That flag is required for any browser call —
  it makes the SDK send the `anthropic-dangerous-direct-browser-access: true`
  header so Anthropic's CORS layer accepts the request. It is *safe here*
  precisely because the only credential in play is the user's own key, supplied
  at runtime. There is no shared/company secret that could leak. Verified: a real
  request reaches `api.anthropic.com` and a bad key returns 401 (no CORS block).
- **Key handling.** The key lives in React state only — never `localStorage`,
  never `sessionStorage`, never the repo. A reload clears it. This is the cleanest
  privacy story and satisfies the "no secrets committed" guardrail. Trade-off:
  the user re-enters the key after a reload; acceptable for a demo tool.
- **Streaming.** Uses `client.messages.stream(...).finalMessage()` with an
  `on('text')` handler so output appears token-by-token. An `AbortController`
  backs a Stop button; an intentional abort is treated as a clean cancel, not an
  error.
- **No `thinking` block.** Summarisation is a direct task — we omit extended
  thinking for speed and lower cost. `max_tokens` is capped at 1024 to bound the
  user's per-run spend. Default model is `claude-opus-4-8` (bare alias, no date
  suffix); Sonnet 4.6 / Haiku 4.5 are selectable. All three share the same call
  shape, so the model is just a string swap.
- **Error mapping.** `describeError()` maps the SDK's typed error classes
  (`AuthenticationError`, `RateLimitError`, `APIConnectionError`, …) to short,
  user-facing English. Never surface a raw stack trace.
- **Bundle / build gotcha.** The SDK pulls in a Node-only OAuth credentials
  module; Vite externalises `node:fs` / `node:path` for it and prints a benign
  warning during build. That module is never reached in the browser (we pass
  `apiKey` directly), so the warning is expected — not an error. The whole
  mini-app is `lazy()`-loaded, so the SDK (~42 kB gzip) only ships when a user
  opens this route.

### Gotcha: shared working tree across concurrent agents

During TRY-16 the working tree was shared with another agent's in-flight branch
(TRY-15). Branch checkouts and `package.json` edits collided. Lesson: **work in
an isolated `git worktree`** (other agents were already doing this — e.g.
`/tmp/try14-wt`). Build/verify/commit inside the worktree; never reset shared
files like `package.json` in the common tree, or you clobber a sibling's deps.
