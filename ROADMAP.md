# Roadmap

Where the Portal is heading, what's blocked, and what triggers the next phase.

## Phase 0 — Foundation ✅ (2026-06-26, TRY-2)

- Stack chosen, repo scaffolded, build green, docs seeded, git initialized.
- Mini-app registry pattern in place with one example mini-app.

## Phase 1 — Portal shell + navigation ✅ (2026-06-26, TRY-3)

- Four top-level sections (School, Data, Recipes, AI Examples) reachable via
  nav, driven by a sections registry. Each section renders an empty-state
  placeholder until a mini-app in its category ships. Responsive; verified in
  a headless browser.

## Phase 2 — Deployment ✅ (2026-06-27, TRY-4)

- Portal is **LIVE** at **https://rajamdm.github.io/portal/** via GitHub Actions
  (repo `RajaMDM/portal`, Pages source = Actions). Every push to `main` redeploys.
- Deployed **additively** to its own Pages project URL; the live
  `trykarkedekho.com` apex (Astro/Cloudflare, repo `RajaMDM/trykarkedekho`) was
  verified UP and untouched. No `CNAME`, no DNS change — CEO-approved Option A
  (TRY-6) honored.

## Phase 3 — Section tools landing ▶ (in progress)

- **Data: Excel / CSV Profiler ✅ (2026-06-28, TRY-15).** First Data-section
  mini-app. Drop a `.csv`/`.xlsx`, get a column profile (type, null %, distinct)
  + sample rows, parsed entirely in the browser. fflate for the XLSX unzip;
  hand-rolled CSV parser. Lazy-loaded 6.9 KB-gzip chunk. Verified headless.
- Each section (School, Data, Recipes, AI Examples) earns real tools over time;
  scope/priority of each remains a CEO call.

## Immediate next

- **More section tools**, as the CEO names priorities. The Profiler is a proven
  template for the next Data tool (drop-a-file → analyse in-browser).
- **First real mini-app.** Replace the Welcome Tour with an actual tool once the
  CEO names the first priority (school tool, data tool, recipe space, or AI
  example). *This is the current product-direction decision pending the CEO.*
- **Optional: custom subdomain.** `portal.trykarkedekho.com` as an **additive**
  CNAME on the Portal's Pages project — gated on **CEO sign-off**. Never repoint
  the apex (= sev-1). Full guardrail detail in `TECH_MEMORY.md` → Deployment
  Safety and `DEFENSE_BRIEF.md`.
- **Maintenance:** the deploy workflow's actions emit a Node 20 deprecation
  warning (non-blocking). Bump `actions/*` major versions when convenient.

## Later phases (trigger-driven)

| Phase                          | Trigger that starts it                                                        |
| ------------------------------ | ----------------------------------------------------------------------------- |
| Clean URLs / SEO               | A content-facing mini-app needs Google discoverability or shareable URLs.      |
| Shared backend / auth          | Two+ mini-apps need shared data, accounts, or server-held secrets.             |
| Persisted data beyond browser  | localStorage limits hit, or data must survive across devices.                  |
| CI/CD + preview deploys        | More than one contributor, or releases need gating/tests before going live.    |

Each trigger comes with a cost/alternatives writeup to the CEO before we build
(see the pattern in `DEFENSE_BRIEF.md`).

## Known blockers

- Source-of-truth decision (above) — owner: **CEO**. Until resolved, treat
  product/feature work as paused; foundation and deployment prep can proceed.
