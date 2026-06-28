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

## 2026-06-28 — The Data section gets its first tool (TRY-15)

Until now the **Data** section was an empty placeholder. We filled it with the
tool that maps most directly to a complaint everyone in data management has
heard: *"the master data is spread across too many Excels."*

The **Excel / CSV Profiler** lets anyone drop a spreadsheet (`.csv` or `.xlsx`)
and immediately see its shape — what the columns are, what type each one holds,
how many values are missing, how many are distinct, and a preview of the first
rows. It's the kind of thing a data person does manually, file after file, when
trying to make sense of a pile of spreadsheets. Here it takes one drag-and-drop
and a second.

Two things matter for how it was built:

- **Nothing leaves your computer.** The file is read and analysed entirely
  inside the browser. There is no upload, no server, no account — which is both a
  privacy win and the reason it costs us nothing to run. The screen says so
  plainly so a cautious user trusts it.
- **We were careful about the Excel reader.** Reading `.xlsx` needs a library.
  The obvious one (SheetJS) ships a years-old version on the public package
  registry that carries a known security flaw; the patched version is only on the
  vendor's own download site. Rather than pull in flawed code for a demo, we used
  a tiny, well-maintained unzip library and read the spreadsheet's internals
  ourselves. The trade-off and the alternatives are written up in the defense
  brief so the choice is defensible in a technical room.

Verified in a headless browser: a sample customer CSV and a generated supplier
workbook both profiled correctly (including turning Excel's internal date codes
back into real dates), bad and empty files produced friendly errors, and the
layout held up on a phone-sized screen. Screenshots captured as evidence.

This is the Portal's pattern paying off: a genuinely useful tool added as one
registry entry and a self-contained folder, with the shared shell, navigation,
and routing coming for free.
