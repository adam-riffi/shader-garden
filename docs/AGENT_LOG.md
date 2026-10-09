# Agent log

Shared memory for every agent and session in this repository. Newest entry first; at most 40 entries (older ones move to `docs/agent-log/YYYY-MM.md`). Rules: `docs/ENGINEERING.md` section 5.

Entry format:

    ## YYYY-MM-DD · <agent> · <branch> · #<PR>
    - Done: what changed, in one or two lines.
    - Tests: what proves it.
    - Scope/decisions: deviations from DESIGN.md, with ADR links.
    - Next: the next concrete step, open questions, known issues.

---

## 2026-10-09 · claude · stack/m1/04-ping-pong · #6
- Done: `PingPong` (`src/engine/PingPong.ts`): two half-float (RGBA16F) targets, at most 512 px (DESIGN.md section 13). Each step binds the previous state to `uState`, draws the simulation material into the other target and swaps; the previous render target is restored afterwards. `dispose` frees the targets and the quad, while the material stays the caller's.
- Tests: `test/engine/PingPong.test.ts` (allocation, swap, pass order with a recording renderer, target restore, size budget, missing uniform, dispose), committed red first; a later compile-time check confirms `WebGLRenderer` satisfies `PassRenderer`.
- Scope/decisions: seeding and reading back the state come with Bloom and Ink in M3. Nothing renders a `PingPong` on a real GPU yet; the first simulation shader in M3 will cover that.
- Next: frame meter (#7).

## 2026-10-09 · claude · stack/m1/03-shaders-check · #5
- Done: `pnpm shaders:check` (`scripts/shaders-check.ts`): Vite's SSR loader resolves every `.glsl` through vite-plugin-glsl, and headless Chromium (SwiftShader WebGL2) compiles, links and draws each program, failing on errors, info-log warnings or GL errors. `src/shaders/programs.ts` pairs `<name>.frag.glsl` with `<name>.vert.glsl` or the shared full-screen vertex shader. The script runs in the CI `e2e` job and in `pnpm check`.
- Tests: `test/shaders/programs.test.ts` (pairing, missing vertex shader, real glob), committed red first. Checked by hand that a broken shader makes the script exit 1.
- Scope/decisions: none. This meets the M1 acceptance criterion "a test shader renders in `shaders:check`".
- Next: `PingPong` (#6).

## 2026-10-09 · claude · stack/m1/02-shader-view · #4
- Done: `createUniforms`/`bindUniforms` (`src/engine/uniforms.ts`, in-place updates, typed `UniformBindingError`); `ShaderView` (R3F canvas, full-screen `RawShaderMaterial` in GLSL3, `uTime` from the clock, `uResolution` from the drawing buffer); `common/fullscreen.vert.glsl` and a `test` fragment shader; lazy engine demo on `/`; favicon.
- Tests: `test/engine/uniforms.test.ts` (5 cases) and `e2e/shader-view.spec.ts` (canvas animates, no console errors), both committed red first.
- Scope/decisions: the home-page demo is a placeholder until the M4 gallery. Playwright runs Chromium with SwiftShader (`--use-angle=swiftshader --enable-unsafe-swiftshader`), as the golden tests in DESIGN.md section 10 will need. The lazy three chunk is 242 KB gzipped; initial JS stays at 70 KB.
- Next: `shaders:check` (#5).

## 2026-10-09 · claude · stack/m1/01-clock · #3
- Done: deterministic `Clock` (`src/engine/clock.ts`): tick clamped to `maxDelta`, pause/play, exact `step` and `setTime` for captures and goldens. Coverage gate (v8): repository at least 80% of lines, `src/engine` and `src/params` at least 90%; `.tsx` UI glue excluded.
- Tests: `test/engine/clock.test.ts` (7 cases), committed red first; clock at 100% coverage.
- Scope/decisions: none.
- Next: uniform binding and `ShaderView` (#4).

## 2026-10-09 · claude · stack/m0/02-deploy · #2
- Done: `smoke.yml` (runs `@smoke` against every successful Vercel deployment), `vercel.json` security headers from DESIGN.md section 13, Dependabot (npm and Actions, weekly, grouped), first `HANDOFF.md`. Vercel Authentication turned off for this project.
- Tests: the existing `@smoke` e2e test, now also run against the preview URL by `smoke.yml`.
- Scope/decisions: the security headers have no milestone in DESIGN.md section 9; they ship in M0 because production goes live now. Previews are public (Georges' choice), which keeps "Secrets: none" from DESIGN.md section 12.
- Next: Georges confirms the Vercel production branch is `main`; then M1.

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
