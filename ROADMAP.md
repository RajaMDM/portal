# Roadmap

Where the Portal is heading, what's blocked, and what triggers the next phase.

## Phase 0 — Foundation ✅ (2026-06-26, TRY-2)

- Stack chosen, repo scaffolded, build green, docs seeded, git initialized.
- Mini-app registry pattern in place with one example mini-app.

## Immediate next

- **Resolve source-of-truth with the CEO.** A separate portal is already live at
  trykarkedekho.com (github.com/RajaMDM). Decide whether this scaffold is the
  canonical repo or we adopt/continue the live codebase. *Blocking further
  product direction.* (TRY-2)
- **Set up deployment.** Wire a deploy to the chosen free static host (GitHub
  Pages / Netlify / Cloudflare Pages). Confirm `PORTAL_BASE` is set correctly for
  the target (project path vs. custom domain). **Deployment-safety guardrail:**
  the Portal deploys *additively* to its own Pages project or a
  `portal.trykarkedekho.com` subdomain — **never** over the live
  `trykarkedekho.com` apex (separate codebase, live production). No `CNAME` to
  the apex, no Cloudflare DNS change, no apex cutover without explicit board
  approval (apex cutover = sev-1, staged plan + rollback required). Full detail
  in `TECH_MEMORY.md` → Deployment Safety and `DEFENSE_BRIEF.md`. (TRY-2, TRY-7)
- **First real mini-app.** Replace the Welcome Tour with an actual tool once the
  CEO names the first priority (school tool, data tool, recipe space, or AI
  example).

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
