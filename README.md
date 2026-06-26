# The Portal

A multi-purpose web portal that hosts a growing collection of small, focused
**mini-apps** under one roof — tools for school folks, data work, recipes, AI
examples, and whatever comes next.

It is a single-page, **client-side-rendered** app: no backend, no server-side
secrets. Any API keys a mini-app needs are entered by the user at runtime and
never stored or committed.

## Stack

- **Vite 8** — build tool / dev server
- **React 19** + **TypeScript** — UI
- **React Router 7** (`HashRouter`) — client-side routing that works on any
  static host with zero server config
- **Oxlint** — fast linter

See `DEFENSE_BRIEF.md` for why this stack over the alternatives, and
`TECH_MEMORY.md` for architecture notes and gotchas.

## Getting started

```bash
npm install        # install dependencies
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
npm run lint       # run oxlint
npm run typecheck  # type-check only
```

## Adding a mini-app

The registry (`src/apps/registry.ts`) is the single source of truth — the home
grid, the nav, and the router are all generated from it. To add a mini-app:

1. Create a folder under `src/apps/<your-app>/`.
2. Export a default React component from it.
3. Append one entry to the `apps` array in `src/apps/registry.ts`.

No routing or layout edits required. Mini-apps are lazily loaded, so each one
only adds to the bundle when a user actually opens it.

## Project structure

```
src/
  App.tsx              Route tree (generated from the registry)
  main.tsx             App entry — mounts the HashRouter
  index.css            Design tokens + Portal shell styles
  components/Layout.tsx  Header, nav, footer shell
  pages/               Home (mini-app grid), About, NotFound
  apps/registry.ts     The mini-app registry (single source of truth)
  apps/welcome/        Example mini-app — copy it to start a new one
```

## Documentation

This project keeps living docs (updated as it evolves):

- `PROJECT_HISTORY.md` — business-readable narrative of what was built and why
- `TECH_MEMORY.md` — technical decisions, architecture, gotchas
- `CHANGELOG.md` — dated, meaningful changes
- `ROADMAP.md` — where it's heading and what triggers the next phase
- `DEFENSE_BRIEF.md` — talking points for defending technical choices
