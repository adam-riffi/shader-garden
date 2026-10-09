# Handoff — 2026-10-09 · claude

## State
- `main` includes M0 (#1, #2), M1 (#3–#7), M2 (#8–#12) and M3 (#13–#19); this file ships with #19, the last PR merged this session. CI green on every merge.
- Production: https://shader-garden-weld.vercel.app (Vercel's alias; `shader-garden.vercel.app` belongs to an unrelated project). `/` lists six shaders; `/s/<name>` shows one with generated controls and a shareable `?v=1&s=&p=` URL; `?t=<s>` is capture mode; `F` toggles the frame meter.
- Open PRs: none.
- **Vercel is rate limited** (Hobby cap of 100 deployments per day, hit by this session's restack pushes). Production is still on #14 (`0add410`), and #15–#19 deploy once the limit resets, about 24 hours after 18:50 UTC on 2026-10-09.

## Done this session
- Setup (ENGINEERING.md section 16), M0 scaffold, M1 engine, M2 params: see `docs/AGENT_LOG.md`.
- M3 shaders:
  - #13: registry, react-router routes, capture mode, golden harness.
  - #14–#17: Terrain (with `common/noise.glsl`), Aurora, Moiré, Mandelbulb.
  - #18–#19: Bloom (Gray-Scott, `SimulationPlane`) and Ink (curl-noise advection).
  - All with presets and goldens.

## Verified
- Goldens (seed 1, t = 2 s, 512×512, 1% tolerance) pass on CI's Linux SwiftShader for all six shaders plus the test pattern. Bloom's 960-step replay takes about 40 s there; the golden timeout is 120 s.
- `shaders:check`: 11 of 11 programs. Properties pass at 10,000 cases (nightly green).
- Independent reviews (code-review skill) were posted on #1, #2, #3, #7, #8, #12, #13 and #19.

## Next
1. After the Vercel limit resets, redeploy `main` (any push to `main`, or Redeploy on the latest production deployment in Vercel), then check that `/s/<name>` loads for all six shaders on production and that smoke passes.
2. M4 UI and identity (DESIGN.md section 9): gallery grid with live 256 px thumbnails (one shared offscreen renderer, 15 fps, IntersectionObserver), a styled glass controls panel (presets, Randomize, Copy link), a shiki source viewer, the night-garden theme (IBM Plex Mono, Instrument Serif), keyboard `R`, `Space` and `S`, journeys J1–J3, and Lighthouse accessibility of 90 or more. Start in plan mode.

## Needs from Georges
- Nothing blocking. Optional: a nicer production alias than `shader-garden-weld.vercel.app`, then an ADR updating DESIGN.md sections 12 and 14.

## Notes
- **Goldens:** generated only on CI (`test.skip` off Linux). To add or refresh one, delete the PNG (or add a shader), push, download the `golden-screenshots` artifact, check it by eye, and commit it. A newer push to the same branch cancels the running CI (concurrency group).
- **Capture mode** sets `html[data-capture-ready]` after the frame is drawn and read back. The M6 capture script should wait for it.
- **Simulations:** state wraps (a torus). Step passes get `uSimTime` and `uStepDt`. Ink takes 2 steps per frame (advection blurs per step); Bloom takes 8, as DESIGN says.
- **Deferred:**
  - M4: Home loads every GLSL source; Playwright browser cache in CI.
  - M5: `uSimTime` float precision in long sessions; zod at runtime; Mandelbulb and Terrain cost at 1080p; the `RGBA16F` fallback (DESIGN.md section 14).
  - M7: a production-alias check in `smoke.yml`.
- **Metadata rules (schema-enforced):** names at most 32 characters; at most 16 params; `max` on the step grid; at most 6 decimals; presets on type, range and grid. The URL wire format is locked by the codec golden.
- **Vercel budget:** every push to a PR branch is a preview deployment, and a restack pushes the whole stack, so a 7-PR stack restacked 7 times costs about 50 deployments. Restack less often (merge in bigger batches) or skip previews for golden-only commits.
- **Pitfall:** Python `str.replace` edits silently miss lines that Biome has rewrapped. Re-read the file, or use the Edit tool.
- `actionlint` is in `~/go/bin`. On Windows, stop a stray `vite preview` by port (`netstat -ano`, `taskkill //PID … //F`).
