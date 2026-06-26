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

## Open governance item

A separate portal is **already live at trykarkedekho.com** (github.com/RajaMDM).
Whether this scaffold is the canonical repo or we adopt the existing one is a
source-of-truth decision for the CEO — raised on TRY-2. This brief assumes the
scaffold-as-foundation case until told otherwise.
