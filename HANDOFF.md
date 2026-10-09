# Handoff — 2026-10-09 · claude

## State
- `main` includes M0 (#1, #2) and M1 (#3–#7); this file ships with #7, the last PR merged this session. CI green on every merge.
- Production: https://shader-garden-weld.vercel.app (Vercel's alias; `shader-garden.vercel.app` belongs to an unrelated project). It shows the title, the engine test pattern, and the frame meter on `F`.
- Open PRs: none.

## Done this session
- Repository and one-time setup (ENGINEERING.md section 16): squash only (PR title and body), head branches deleted on merge, read-only Actions token, `main` ruleset (PR, linear history, squash, required `lint typecheck test build e2e`), Dependabot alerts, CodeQL default setup (now `javascript-typescript` and `actions`), Vercel project `shader-garden` (team `wuxinggraph`, Vite preset, Git integration, Vercel Authentication off).
- M0 scaffold: #1 (Vite, React, TS, Biome, Vitest, Playwright, `ci.yml`, pr-meme caller), #2 (`smoke.yml`, security headers, Dependabot).
- M1 engine: #3 clock and coverage gate, #4 uniforms and `ShaderView`, #5 `shaders:check`, #6 `PingPong`, #7 frame meter plus the M1 review fixes (WebGL2 fallback, uniform kind checks, frame-time filtering).

## Verified
- Production deploys from `main` (branch tracking is correct); smoke passed on production ([run](https://github.com/adam-riffi/shader-garden/actions/runs/37948593980)); `curl` shows the CSP, Referrer-Policy and nosniff headers.
- In CI, SwiftShader WebGL2 works on `ubuntu-latest`: `shaders:check` and the canvas e2e test pass.
- Independent reviews (code-review skill) were posted on #1, #2, #3 and #7; their findings are fixed or deferred with reasons.

## Next
1. M2 params (DESIGN.md section 9): param schema (zod), codec `?v=1&s=&p=` with versioning, seeded random, zustand store, URL sync within 250 ms; property tests P1–P3; `nightly.yml` (10,000-case property runs, `pnpm audit`). Start in plan mode.
2. M3 needs from M1: seeding and readback for `PingPong`, `#include` of `common/*.glsl` (vite-plugin-glsl handles it), golden screenshots at seed 1 and t = 2 s (`clock.setTime(2)` with `pause()`).

## Needs from Georges
- Nothing blocking. Optional: rename the Vercel production alias if you want something nicer than `shader-garden-weld.vercel.app` (Vercel, Settings, Domains); then update DESIGN.md sections 12 and 14 through an ADR.

## Notes
- Deferred review items: Playwright browser cache in CI (M4), a production-alias check in `smoke.yml` (M7), uniform-type messages in `shaders:check` (M3 if they mislead), StrictMode double compile in dev (harmless).
- The frame-meter e2e waits for the heading before pressing `F`: the key listener attaches in a passive effect, after `load`.
- pnpm 12 enforces a one-day minimum release age; pin the previous version rather than adding `minimumReleaseAgeExclude`.
- `actionlint` is in `~/go/bin`. On Windows, stop a stray `vite preview` by port (`netstat -ano`, `taskkill //PID … //F`).
