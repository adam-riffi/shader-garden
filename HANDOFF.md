# Handoff — 2026-10-09 · claude

## State
- `main` at `ca77403`: docs: add design pack. No CI on `main` yet (`ci.yml` lands with #1).
- Open PRs (stack M0, merge bottom-up):
  - #1 build: scaffold Vite, React, TypeScript, Biome, Vitest and Playwright with CI. Ready, all checks green, waiting on review and merge.
  - #2 ci: add post-deploy smoke, security headers and Dependabot. Based on #1; smoke green on its preview, waiting on CI, then review and merge after #1.

## Done this session
- Repository `adam-riffi/shader-garden` created (public). ENGINEERING.md section 16 setup done: squash only (PR title and body), head branches deleted on merge, read-only Actions token, `main` ruleset (PR required, linear history, squash only, required checks `lint typecheck test build e2e`), Dependabot alerts, CodeQL default setup.
- Vercel project `shader-garden` (team `wuxinggraph`, Vite preset, Git integration), with Vercel Authentication turned off so smoke reaches previews without a secret.
- M0 stack #1 and #2.

## Verified
- #2: preview `shader-garden-1ubeod83l` returns 200 with the CSP, Referrer-Policy and nosniff headers; [`smoke` passed](https://github.com/adam-riffi/shader-garden/actions/runs/37928306102) against it.
- #1: lint, typecheck, test, build, e2e, meme and Vercel checks green; the Vercel bot commented the preview URL; the deployment returns 200 with `<title>Shader Garden</title>`.

## Next
1. After #1 and #2 merge, check that production deploys from `main`, smoke passes on it, and `GET /` contains "Shader Garden".
2. M1 engine (DESIGN.md section 9): start in plan mode. `ShaderView` with uniform binding, a deterministic clock, `PingPong`, the frame meter, `shaders:check`, and the coverage gate.

## Needs from Georges
- **Vercel production branch:** the project's first Git deployment (branch `stack/m0/01-scaffold`) went out as *production*, probably because the new project had no production deployment yet. #2's branch deployed as a preview. Please confirm that Vercel, shader-garden, Settings, Environments, Production, Branch Tracking shows `main`. The MCP tools cannot read this setting.
- Review and merge #1, then #2.

## Notes
- Uptime target (ENGINEERING.md section 16 step 8) is deferred to M7 per DESIGN.md section 9.
- `actionlint` is installed locally (`~/go/bin`); run it whenever workflows change.
- Vercel deploys every pushed branch; `smoke.yml` runs from the deployed commit's own copy of the workflow.
