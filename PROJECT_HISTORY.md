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
