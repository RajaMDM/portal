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

## 2026-06-28 — First AI example: the Text Summarizer (TRY-16)

The AI Examples section had been an empty placeholder. This change made it real
with the Portal's first AI-powered tool: a **Text Summarizer**.

What it does, in plain terms: you paste in some text — an article, an email
thread, meeting notes — choose how you want it summarised (a short paragraph,
bullet points, or key takeaways), and the summary streams back in seconds. It
runs entirely in your browser; there is no server of ours in the loop.

The one thing a user must bring is their own Anthropic API key. We made a
deliberate choice about how that key is handled: it lives only in the page's
memory while you use it, is sent only to Anthropic, and is gone the moment you
reload. It is never saved to disk and never stored in our code. A short privacy
note next to the key field says exactly this, so there is no mystery about where
the key goes.

Why this matters for the business: it proves the "bring your own key" pattern
that lets us ship genuinely useful AI features with **zero ongoing cost and zero
secrets to protect** — the same constraint that keeps the whole Portal on free
hosting. It also turns the fourth and last empty section into a working
demonstration, which is the point of the Portal: a public, credible shop window
for the company's data-and-AI work.

We defaulted the tool to the strongest model (Claude Opus 4.8) but let the user
switch to cheaper, faster models (Sonnet, Haiku) — because the user pays for
their own usage, the choice should be theirs.

Verified end to end in a real browser: the tool loads, a wrong key produces a
clear "that key was rejected" message (proving the live call path works), and
the layout holds up on a phone.
