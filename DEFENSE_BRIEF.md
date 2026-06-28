# Defense Brief

Talking points for defending the Portal's technical choices in a room of
developers. "Why X over Y?" — the answer lives here.

## Decision: Vite + React + TypeScript (SPA), not a framework or plain HTML

**The constraint that drove it:** free/low-cost *static* hosting, no backend, API
keys entered at runtime. The stack had to produce a static bundle and stay cheap
to grow as we add many small tools.

### Alternatives considered

| Option                                   | Cost                                              | Pros                                                                                 | Cons                                                                                          | Migration effort from here |
| ---------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | -------------------------- |
| **Vite + React + TS (chosen)**           | Free. Hosting free (GitHub Pages / Netlify free). | Fast builds/HMR; huge ecosystem; static output; trivial code-splitting per mini-app; team familiarity. | Client-side rendering = weaker SEO; ships a JS runtime (~75 KB gzip baseline).                 | —                          |
| **Next.js (React, SSR/SSG)**             | Free to start; SSR needs a Node host (Vercel free tier, then ~\$20/mo+). | Best-in-class React DX; SSR/SSG for SEO; API routes if we ever need a backend.        | Overkill for a static SPA; SSR features tempt us off free static hosting; heavier mental model. | Moderate (re-home routing/pages). |
| **Plain HTML/CSS/JS or Astro (MPA)**     | Free.                                             | Zero/*minimal* JS; great SEO; simplest hosting.                                       | No shared app state/runtime; every mini-app reinvents UI plumbing; the "one registry → everything" pattern is hard. | High (rebuild app shell). |

### Why the chosen option wins

The Portal's value is hosting **many** small interactive tools cheaply. React +
Vite gives us a shared shell, a single registry that auto-wires new tools, and
per-mini-app code splitting — so the 10th tool costs almost nothing to add.
Next.js solves problems we don't have (SSR, a backend) and nudges us off free
hosting. Plain HTML/Astro is great for content but fights us on shared
interactive app plumbing.

### If a developer pushes back

- *"Why not Next.js for SEO?"* — We're a tools portal, not a content site;
  discoverability isn't via Google for interactive utilities. SSR would also pull
  us toward a paid Node host, breaking the free-hosting constraint. We can adopt
  SSG later if a content-heavy mini-app needs it, without rewriting the others.
- *"Why HashRouter and not clean URLs?"* — `HashRouter` deep-links work from a
  single `index.html` with zero server config — exactly what free static hosts
  provide. Clean URLs (`BrowserRouter`) need host-level rewrites; we'll switch
  when SEO or polish justifies the hosting requirement (see ROADMAP trigger).
- *"Why a custom registry instead of a router config?"* — It's a thin layer that
  keeps the home grid, nav, and routes in sync from one source, so contributors
  add a tool in one place and can't forget to register it three times.

## Growth path

- **Now:** static SPA on free hosting; HashRouter; everything client-side.
- **Next trigger — clean URLs / SEO:** move to `BrowserRouter` + a host that
  rewrites to `index.html` (GitHub Pages `404.html` trick, or Netlify/Cloudflare
  Pages redirects — still free).
- **Next trigger — a real backend (shared data, auth, server-held secrets):**
  add serverless functions (Netlify/Cloudflare Functions free tier) or a small
  API; only the mini-app that needs it pays the complexity. Estimate at that
  point and bring to the CEO.
- **Next trigger — scale / shared state across tools:** introduce a state
  library or a backend datastore (Supabase free tier, etc.) when localStorage
  stops being enough.

## Deployment Safety (non-negotiable guardrail)

**Decision: the Portal deploys are additive and will never touch the live site.**

`trykarkedekho.com` is a LIVE production site under RajaMDM and a **separate
codebase** (Astro/Cloudflare) — not this Portal repo. Board directive on TRY-2:
*"We do not touch the live site by any means."*

What this means in practice:

- The Portal ships to its **own** GitHub Pages project site, or to a dedicated
  `portal.trykarkedekho.com` subdomain. It never overwrites the apex.
- No `CNAME` to the apex, no Cloudflare DNS change, no apex cutover without
  **explicit board approval**. An apex cutover is treated as a **sev-1** change:
  staged plan + tested rollback required before it runs.
- API keys are runtime-entered only; no secrets are committed or baked into a
  deploy config.

### If a developer pushes back

- *"Why not just point the Portal at the main domain?"* — Because a live
  production site already serves real users there from a different codebase.
  Repointing DNS or dropping a `CNAME` at the apex would take it down. The board
  has explicitly ruled that out; the upgrade path (if we ever want the apex) is a
  staged, rollback-tested sev-1 change with board sign-off, not a deploy
  side-effect.
- *"It's just a docs/static deploy, low risk."* — DNS and apex changes are
  one-way doors for a live site. We keep Portal deploys on a separate
  origin/subdomain precisely so a routine deploy can never have a blast radius on
  production.

## Open governance item

Whether this scaffold is the canonical repo or we adopt the existing live
codebase is a source-of-truth decision for the CEO — raised on TRY-2. This brief
assumes the scaffold-as-foundation case until told otherwise. Either way, the
Deployment Safety guardrail above is unconditional.

## AI Examples: the Text Summarizer (TRY-16)

**Why call Claude from the browser at all, with no backend?**
A backend would mean a server to run, pay for, and secure — and a place to store
an API key. Our hard constraint is free static hosting and no committed secrets.
The "bring your own key" pattern removes both problems: the user supplies their
own key at runtime, pays for their own usage, and the key never touches our
infrastructure. This is the only way to ship a real AI feature under the current
cost guardrail.

**Why the official `@anthropic-ai/sdk` over hand-rolled `fetch`?**
The SDK handles the things that are easy to get subtly wrong: the browser CORS
header, streaming event assembly, and a set of typed error classes we map to
plain-English messages. It is the documented, supported path. The alternative —
raw `fetch` to `/v1/messages` — would be dependency-free (matching the rest of
the Portal's ethos) and a few KB smaller, but we'd reimplement streaming and
error handling by hand and own that maintenance. We chose correctness and
support over shaving a dependency; the cost is one well-maintained package,
lazy-loaded so it ships only when this one mini-app is opened (~42 kB gzip).
*Growth path:* if the Portal later adds many AI tools, factor the client setup
into a shared helper; if we ever need to hide a company key, that's the trigger
for a thin proxy backend (a cost/infra decision for the CEO).

**Why is `dangerouslyAllowBrowser: true` acceptable?**
The flag's name warns against exposing a *secret* key in client code. Here there
is no secret to expose — the key is the user's own, typed in at runtime and held
only in memory. The warning is about shipping *your* key to users; we ship none.

**Why not persist the key (localStorage / sessionStorage)?**
Persisting would spare the user re-entering it after a reload, but it widens the
privacy surface: a stored key lingers on the device and can be read by any script
on the origin. For a public demo the cleaner promise — "your key never leaves this
tab's memory and is gone on reload" — is worth the minor inconvenience. *Trigger
to revisit:* if usage data shows people running many summaries per session and
the re-entry is a real friction, offer an explicit, clearly-labelled
"remember for this session" opt-in using `sessionStorage`.

**Why default to Opus 4.8 but offer cheaper models?**
Opus is the most capable default and showcases the best result. But the *user*
pays per token, so the choice of cost/speed should be theirs — hence Sonnet 4.6
and Haiku 4.5 in the picker. Defaulting to the best model while exposing cheaper
options is the honest middle ground.
