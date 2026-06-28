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

## Immediate next

- **First real mini-app — DONE (TRY-14).** The Recipe Book replaced the Welcome
  Tour scaffold: a browser-only recipe collection (add/browse/search, localStorage
  persistence) is now the showcased mini-app in the Recipes section. The toy
  example app and its route were removed; the Recipe Book is the copy-from
  reference for the next mini-app.
  - *Persistence trigger to watch:* recipes live in `localStorage`
    (`try-portal:recipes:v1`), capped at ~5 MB per origin. When users hit that
    limit, or recipes must sync across devices, escalate the "Persisted data
    beyond browser" phase below (cost/alternatives writeup to the CEO first).
- **Next mini-app priority is a CEO call.** Which section gets the second real
  tool (school, data, or AI example) is a product-direction decision pending the
  CEO.
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
