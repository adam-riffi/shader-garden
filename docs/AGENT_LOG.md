# Agent log

Shared memory for every agent and session in this repository. Newest entry first; at most 40 entries (older ones move to `docs/agent-log/YYYY-MM.md`). Rules: `docs/ENGINEERING.md` section 5.

Entry format:

    ## YYYY-MM-DD · <agent> · <branch> · #<PR>
    - Done: what changed, in one or two lines.
    - Tests: what proves it.
    - Scope/decisions: deviations from DESIGN.md, with ADR links.
    - Next: the next concrete step, open questions, known issues.

---

## 2026-10-09 · claude · stack/m3/01-shader-pages · #13
- Done: `src/shaders/registry.ts` (gallery order, hidden `test`); react-router routes (`/` list, `/s/:name` `ShaderPage` with generated controls and URL sync, an unknown-shader message, a catch-all); capture mode `?t=<s>` (`src/engine/capture.ts`: frozen clock, full-viewport canvas, dpr 1, `frameloop="demand"`); `e2e/golden.spec.ts` (every shader folder at seed 1, t = 2, 512×512, 1% tolerance, Linux only) with baselines uploaded as a CI artifact; SPA rewrite in `vercel.json`. `EngineDemo` is gone and the e2e tests moved to `/s/test`.
- Tests: registry consistency, `captureTime`, the routed App render, an unknown-shader e2e test, a deep-link `@smoke` test, and the goldens; committed red first.
- Scope/decisions: routing lands in M3 because goldens and captures need per-shader URLs; M4 keeps the gallery grid, panel, source viewer and theme. The test pattern has a golden too, as an engine regression check. Initial JS is 83 KB gzipped (react-router).
- Next: Terrain with `common/noise.glsl` (#14).

## 2026-10-09 · claude · stack/m2/05-nightly · #12
- Done: `.github/workflows/nightly.yml` (daily at 03:17 UTC and on demand): `pnpm test` with `FC_NUM_RUNS=10000`, plus `pnpm audit`. Not a required check. The commands table in AGENTS.md documents `FC_NUM_RUNS` and `FC_SEED`. End-of-session HANDOFF.
- Tests: the full suite passes locally at 10,000 cases per property (1.4 s); `pnpm audit` is clean; `actionlint` is clean.
- Scope/decisions: none.
- Next: M3 shaders, one PR per shader, starting in plan mode.

## 2026-10-09 · claude · stack/m2/04-store-url · #11
- Done: `src/params/store.ts` (vanilla zustand store hydrated from the link: `set`, `randomize`, `applyPreset`, all quantized), `src/params/urlSync.ts` (150 ms debounce, then `history.replaceState`), `src/ui/ParamControls.tsx` (native range, checkbox and colour inputs generated from metadata), and a notice for `unknown-version` and `invalid` links, all wired into the engine demo.
- Tests: `test/params/store.test.ts` (hydration, quantized writes, randomize, presets, debounce, unsubscribe) and `e2e/params.spec.ts` (slider to URL in under 250 ms measured in the page; shared URL restores values; newer-version notice), committed red first. 30/30 passed with `--repeat-each 10` and parallel workers.
- Scope/decisions: the minimal native controls are M2's means of meeting its acceptance; M4 styles them and adds presets and Randomize. Value labels are `aria-hidden` spans rather than `<output>`, whose implicit live region would announce every drag step. The sync subscribes in a layout effect to close a race with fast input. The lazy chunk is now 270 KB gzipped (zod, zustand); initial JS is still 70 KB.
- Next: nightly workflow (#12), then review and merge M2.

## 2026-10-09 · claude · stack/m2/03-codec · #10
- Done: `src/params/codec.ts`. `encode` writes `v=1&s=<uint32>&p=<base64url>` (numeric as LEB128 step index, bool 1 byte, colour 3 bytes). `decode` returns `{ seed, values, status }` with `ok | empty | unknown-version | invalid`; a fallback means defaults and seed 1. A truncated `p` defaults trailing params; out-of-grid indexes clamp.
- Tests: P1 (round trip equals `quantize`), P2 (`/s/<name>?<query>` at most 200 characters), the golden v1 string for the test shader's defaults, and the fallback cases (version, seed, charset, base64 length, long varint, short colour, missing `p`, appended params, clamp). Committed red first; P1 and P2 pass at 10,000 cases; `codec.ts` at 100% lines.
- Scope/decisions: none. The golden `v=1&s=1&p=HBR88qQA` locks the wire format: changing it needs `VERSION` 2.
- Next: zustand store, URL sync and generated controls (#11).

## 2026-10-09 · claude · stack/m2/02-random · #9
- Done: `src/params/random.ts` (`mulberry32`, `randomize`, uniform over each param's grid); fast-check with a seeded global config (`test/setup.ts`: `FC_SEED`, `FC_NUM_RUNS`, default 200); shared arbitraries for valid metas and values (`test/params/arbitraries.ts`). The schema's step limit now uses `stepCount`.
- Tests: P3 (deterministic; in-range and on-grid for arbitrary metas and seeds) and mulberry32 sequence tests, committed red first. Ran 10,000 and 100,000 cases locally; timing scales with `FC_NUM_RUNS`.
- Scope/decisions: none.
- Next: versioned URL codec, P1 and P2 (#10).

## 2026-10-09 · claude · stack/m2/01-schema · #8
- Done: `src/params/schema.ts`: zod metadata schema (float, int, bool, color; at most 16 params and 65,535 steps; unique names; presets limited to known params), `defineMeta`, `quantize` (snap to step, clamp, defaults for missing or mistyped values, drop unknown keys), `defaults`, `toUniforms` (uniform name `u` + Name, colour to 0..1 RGB, `uSeed`). `src/shaders/test/meta.ts` with all four types; the test shader uses them.
- Tests: `test/params/schema.test.ts` (18 cases) and `test/shaders/metas.test.ts` (every `meta.ts` named after its folder and every uniform declared in its GLSL), committed red first.
- Scope/decisions: none beyond the approved M2 plan.
- Next: seeded random and P3 (#9).

## 2026-10-09 · claude · stack/m1/05-frame-meter · #7
- Done: `createFrameStats` (`src/engine/frameStats.ts`, rolling window, nearest-rank p95) and `FrameMeter` (requestAnimationFrame sampling, refreshed every 500 ms, `F` toggles it; ignored while typing or with modifier keys), mounted in `App`.
- Tests: `test/engine/frameStats.test.ts` (percentile, window, empty) and `e2e/frame-meter.spec.ts` (F shows `p95 N.N ms`, F hides it), committed red first. The e2e test waits for the heading before pressing F: the listener attaches in a passive effect, after `load`.
- Scope/decisions: the meter measures page frames, not only the R3F loop, so it also covers thumbnails later. Its styling is provisional until the M4 theme.
- Next: M2 params (schema, codec, seeded random, store, URL sync), starting in plan mode.

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
