# M4 — UI and identity

The gallery becomes a small digital botanical collection: generous serif type,
numbered specimens, borderless moving artwork and quiet monospace annotations.
The shader page uses the specified full-bleed canvas and a thin glass panel.
Colours and fonts follow DESIGN.md section 7. No shader algorithms change.

## Delivery stack

1. `stack/m4/01-live-gallery`: six live 256 px thumbnails, one offscreen WebGL
   renderer, visibility observation, 15 fps cap, pause and resource cleanup.
2. `stack/m4/02-controls`: presets, Randomize, reliable Copy link, pause and
   keyboard R / Space, generated parameter layout.
3. `stack/m4/03-source`: lazy Shiki GLSL viewer and S shortcut, including
   simulation passes and shared source.
4. `stack/m4/04-identity`: night-garden typography, gallery composition, glass
   panel, responsive layout and reduced-motion support.
5. `stack/m4/05-verification`: accessibility evidence, complete journeys,
   independent review fixes, README and session handoff.

## Verification

Commit and run failing behavior tests before each feature. J1 proves every tile
draws and animates, pauses when hidden, and opens its shader. J2 proves a slider
changes both URL and canvas. J3 copies current parameters even within the URL
debounce window and restores them in a new page. Additional tests cover presets,
keyboard focus, pause, clipboard denial and source toggling. Check desktop and
narrow layouts visually; run Lighthouse accessibility on gallery and shader page
(target >= 90). Run `pnpm check` for each PR and keep Linux shader goldens intact.

Draft PRs follow the repository template and receive screenshot evidence and log
entries. Once CI is green, a different agent reviews the stack. Georges approves
and merges bottom-up. Refresh and smoke-test existing `main` on production first;
M4 stays in previews until approved and merged.
