# Agent log

Shared memory for every agent and session in this repository. Newest entry first; at most 40 entries (older ones move to `docs/agent-log/YYYY-MM.md`). Rules: `docs/ENGINEERING.md` section 5.

Entry format:

    ## YYYY-MM-DD · <agent> · <branch> · #<PR>
    - Done: what changed, in one or two lines.
    - Tests: what proves it.
    - Scope/decisions: deviations from DESIGN.md, with ADR links.
    - Next: the next concrete step, open questions, known issues.

---

## 2026-10-09 · claude · stack/m0/01-scaffold · #1
- Done: Vite 8 + React 19 + TypeScript 7 + Biome + Vitest + Playwright scaffold; app shell with the title; `ci.yml` (lint, typecheck, test, build, e2e) and the `pr-meme.yml` caller. Repository and Vercel project set up per ENGINEERING.md section 16.
- Tests: `test/app.test.tsx` (server render shows the title); `e2e/smoke.spec.ts` `@smoke` (`/` returns 200 with the heading). Both committed red first.
- Scope/decisions: none. Coverage gate deferred to M1 (first `src/engine` code); uptime target deferred to M7 per DESIGN.md section 9.
- Next: PR 2 (`smoke.yml`, `vercel.json` headers, Dependabot), then M1.

## 2026-10-09 · claude · (none) · (none)
- Done: Repository pack created: DESIGN.md, ENGINEERING.md, AGENTS.md, CLAUDE.md, Copilot instructions, PR template, ADR template.
- Tests: none yet.
- Scope/decisions: stack and hosting as stated in the header of `docs/DESIGN.md`.
- Next: milestone M0 (scaffold) from `docs/DESIGN.md` section 9, after the one-time setup in `docs/ENGINEERING.md` section 16.
