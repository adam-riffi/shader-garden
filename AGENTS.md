# AGENTS.md - Shader Garden

Operating manual for coding agents in this repository. Codex and Copilot read this file directly; Claude Code reads it through `CLAUDE.md`. The specification is `docs/DESIGN.md`; the workflow rules are `docs/ENGINEERING.md`.

## Start of every session

1. Read the five newest entries of `docs/AGENT_LOG.md`.
2. Read `docs/DESIGN.md`: at least section 4 (scope), section 6 (design decisions and allowed libraries) and the current milestone in section 9.
3. List open pull requests: `gh pr list --state open`.
4. Fetch `main` and restack your branches (`docs/ENGINEERING.md` section 3).

## Project at a glance

- **What:** A web gallery of hand-written GLSL shaders (noise landscapes, a Mandelbulb raymarcher, reaction-diffusion, curl-noise fluid) with live parameter controls and shareable URLs.
- **Stack:** TypeScript, React, Vite, React Three Fiber, GLSL
- **Hosting:** Vercel mode A (Git integration), static site, no database
- **Hand-written core:** every shader (GLSL), the ping-pong render-target loop for simulations, and the URL parameter codec. Full list and allowed libraries: `docs/DESIGN.md` section 6.
- **Repository layout:** `docs/DESIGN.md` section 5.
- **Shared automation:** the PR meme pipeline, Supabase bootstrap and uptime job live in `adam-riffi/portfolio-infra`; this repository only holds the caller (`docs/ENGINEERING.md` section 14).

## Commands

| Task | Command |
| --- | --- |
| Install | `pnpm install` |
| Dev server | `pnpm dev` |
| Unit and property tests | `pnpm test` (with the coverage gate; one file: `pnpm exec vitest run <file>`) |
| Lint and format | `pnpm lint` / `pnpm format` |
| Typecheck | `pnpm typecheck` |
| Shader compile check | `pnpm shaders:check` (compiles, links and draws every program in headless WebGL2) |
| Build | `pnpm build` |
| End-to-end tests | `pnpm e2e` (first run: `pnpm exec playwright install chromium`; `BASE_URL=<url>` targets a deployment) |
| Record demo video | `pnpm capture -- --url <url>` (added in M6) |
| Check all | `pnpm check` (lint, typecheck, test, shaders:check, build, e2e) |

Keep this table accurate: when you add or change a script, update the table in the same PR.

## Rules

1. **Test first.** Write the failing test, run it, confirm it fails for the expected reason, commit it (`test(<area>): ...`), then implement (`feat|fix(<area>): ...`), then refactor. Never weaken, skip or delete a test to get a green build; if a test is wrong, explain why in the PR.
2. **Small stacked PRs.** One concern per PR, about 400 changed lines at most (excluding lockfiles, snapshots, fixtures and generated files). Larger work becomes a stack of `stack/<topic>/<nn>-<slug>` branches, each PR based on the previous one (`docs/ENGINEERING.md` section 3).
3. **Branches.** Never push to `main`. Force-push only your own branches, only with `--force-with-lease`.
4. **Conventional Commits** for commit messages and PR titles; PR bodies follow `.github/pull_request_template.md`.
5. **Scope.** Build what `docs/DESIGN.md` specifies for the current milestone. If the design is ambiguous, wrong or incomplete, do not invent scope: propose the change in the PR and add a draft ADR in `docs/adr/` (copy `0000-template.md`).
6. **Dependencies.** Only the libraries allowed in `docs/DESIGN.md` section 6, plus development tooling. Anything else needs a one-line justification in the PR, and an ADR if it touches the hand-written core.
7. **Secrets.** Never commit secrets or `.env` files other than `.env.example`; never print secret values in logs, tests or PR text.
8. **Verify before review.** Run "Check all" locally. Open PRs as drafts; mark them ready only when CI is green.
9. **Log.** End every PR or session with a new entry at the top of `docs/AGENT_LOG.md`, in the format shown in that file.
10. **Reviewing another agent's PR.** Check correctness, that tests came first and test behavior, scope against DESIGN.md, security, and the performance budgets in DESIGN.md section 13; post findings as a PR review.

## Definition of done for a pull request

- Tests written first and passing; coverage at or above the thresholds in `docs/DESIGN.md` section 10 and not below `main`.
- Lint, format and type checks clean; CI green.
- README, this file and (through an ADR) DESIGN.md updated when behavior, scope or commands changed.
- UI changes include a screenshot or a short GIF in the PR.
- `docs/AGENT_LOG.md` entry added.
