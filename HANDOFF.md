# Handoff — 2026-10-09 · claude

## State
- `main` includes M0 (#1, #2), M1 (#3–#7) and M2 (#8–#12); this file ships with #12, the last PR merged this session. CI green on every merge.
- Production: https://shader-garden-weld.vercel.app (Vercel's alias; `shader-garden.vercel.app` belongs to an unrelated project). It shows the title, the test shader with generated controls (Rings, Speed, Tint, Invert), a shareable `?v=1&s=&p=` URL, and the frame meter on `F`.
- Open PRs: none.

## Done this session
- Repository and one-time setup (ENGINEERING.md section 16): squash only (PR title and body), head branches deleted on merge, read-only Actions token, `main` ruleset (required `lint typecheck test build e2e`), Dependabot alerts, CodeQL default setup, Vercel project `shader-garden` (team `wuxinggraph`, Vite preset, Git integration, Vercel Authentication off).
- M0 scaffold (#1, #2). M1 engine (#3–#7): clock, uniforms and `ShaderView`, `shaders:check`, `PingPong`, frame meter.
- M2 params (#8–#12): zod schema and quantization, mulberry32 `randomize` (P3), versioned codec (P1, P2, golden `v=1&s=1&p=HBR88qQA`), zustand store with URL sync (150 ms debounce), generated native controls, `nightly.yml` (10,000-case properties and `pnpm audit`).

## Verified
- Production smoke passed after M0 and M1 (latest: [run](https://github.com/adam-riffi/shader-garden/actions/runs/37957676361)); `curl` shows the CSP, Referrer-Policy and nosniff headers.
- Properties pass at 10,000 cases locally. The 250 ms URL e2e test passed 30/30 under `--repeat-each 10` with parallel workers.
- Independent reviews (code-review skill) were posted on #1, #2, #3, #7, #8 and #12; their findings are fixed or deferred with reasons.

## Next
1. Trigger `nightly` once on GitHub (`gh workflow run nightly`) and check that it passes.
2. M3 shaders (DESIGN.md section 9): one PR per shader with `meta.ts` and presets (Terrain, Mandelbulb, Bloom, Ink, Aurora, Moiré); golden screenshots at seed 1 and t = 2 s. Start in plan mode. Bloom and Ink need `PingPong` seeding and readback and a display pass; `common/noise.glsl`, `sdf.glsl` and `palette.glsl` come in through vite-plugin-glsl `#include`.

## Needs from Georges
- Nothing blocking. Optional: a nicer Vercel production alias than `shader-garden-weld.vercel.app`, then an ADR updating DESIGN.md sections 12 and 14.

## Notes
- Deferred review items: zod at runtime, about 25 KB gzipped in the lazy chunk (M5: `zod/mini` or validate in tests only); Playwright browser cache in CI (M4); a production-alias check in `smoke.yml` (M7); uniform-type messages in `shaders:check` (M3 if they mislead).
- The URL wire format is locked by the golden test: reordering or removing params needs codec `VERSION` 2. Appending params is backwards compatible.
- Metadata rules (schema-enforced): names at most 32 characters; at most 16 params; `max` on the step grid; at most 6 decimals; presets on type, range and grid.
- e2e timing: measure app latency in the page, not with Playwright timeouts. Listeners that tests rely on attach in layout effects or after the heading renders.
- pnpm 12 enforces a one-day minimum release age; pin the previous version rather than adding `minimumReleaseAgeExclude`.
- `actionlint` is in `~/go/bin`. On Windows, stop a stray `vite preview` by port (`netstat -ano`, `taskkill //PID … //F`).
