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

## Phase 3 — First real mini-apps (in progress)

- **Recipes:** Recipe Book mini-app shipped (TRY-5) — the first real vertical
  slice (add/search/persist in localStorage).
- **AI Examples:** Text Summarizer shipped (TRY-16) — the first client-side AI
  example. User-supplied Anthropic key entered at runtime (never stored),
  streaming summary, model + style pickers. Proves the "bring your own key"
  pattern end to end. The AI Examples section is no longer an empty placeholder.
- *Still open:* School and Data sections remain empty-state until the CEO names
  their first tools.

## Immediate next

- **More mini-apps per CEO priority.** School and Data sections still need their
  first tools — a CEO product-direction call.
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
