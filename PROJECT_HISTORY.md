# Project History

A business-readable, chronological narrative of how the Portal evolved.

## 2026-06-26 — Foundation laid (TRY-2)

The Portal began as an empty workspace. The goal: a single home that can host
many small, independent tools ("mini-apps") over time — school tools, data
tools, a recipe space, AI examples — without rebuilding the plumbing each time.

What was decided and built:

- **Stack chosen:** Vite + React + TypeScript, single-page and fully
  client-side. This keeps hosting free (any static host) and means no servers
  to run or secure. Alternatives (Next.js, plain HTML/Astro) were considered and
  documented in `DEFENSE_BRIEF.md`.
- **The "mini-app registry" pattern:** instead of wiring each new tool by hand,
  there is one list (`src/apps/registry.ts`). Add an entry and the home page
  card, the navigation link, and the route all appear automatically. This is the
  core idea that lets the Portal grow cheaply.
- **A working shell:** a shared header/nav/footer, a home page that shows a grid
  of mini-app cards, an About page, a "not found" page, and one example mini-app
  ("Welcome Tour") that proves the pattern end-to-end.
- **Living docs seeded:** this file plus TECH_MEMORY, CHANGELOG, ROADMAP, and
  DEFENSE_BRIEF, so every future decision has a home.

Verified: the app builds cleanly and the example mini-app loads on its own route.

### Open question raised to the CEO

While verifying, we confirmed a **separate site is already live in production at
trykarkedekho.com** (a full portal with Learn/CBSE, World Cup 2026, and Blog
sections, under github.com/RajaMDM). That live site is **not** the code in this
workspace — they are different codebases. Before building further, we need the
CEO to confirm the source of truth: should this fresh scaffold become the
canonical Portal repo, or should we adopt/continue the existing live codebase?
Tracked on TRY-2.

## 2026-06-28 — First real mini-app becomes the showcase (TRY-14)

The Portal shipped with a deliberate placeholder: a "Welcome Tour" example
mini-app whose only job was to prove the pattern (each tool gets its own card,
route, and lazily-loaded screen). With a genuine tool now in hand — the Recipe
Book — that scaffold had done its job.

What changed:

- **The Welcome Tour was retired.** Its component, its registry entry, and its
  route were removed, so the Home page's "Jump back in" strip now shows only the
  real tool instead of a demo sitting next to it.
- **The Recipe Book is the front door.** It is a small, browser-only recipe
  collection: add a recipe, browse the list newest-first, expand a card for
  ingredients and method, search, and delete. Everything is saved on the visitor's
  own device (browser localStorage) — no account, no server, nothing leaves the
  machine. (The Recipe Book itself was built earlier in TRY-5; this change promotes
  it from "one of two" to "the example everything else copies.")
- **The docs were repointed** so the Recipe Book — not the deleted demo — is the
  reference a future engineer copies to start the next mini-app.

Why it matters in business terms: the public face of the company's work is now a
tool a visitor can actually use on their first click, not a developer's hello-world.
The reusable "add a mini-app" pattern is no longer demonstrated by a toy; it's
proven by a real feature, which lowers the cost and risk of every tool that follows.

The next decision — which section gets the *second* real tool (school, data, or an
AI example) — is a product-direction call for the CEO.
