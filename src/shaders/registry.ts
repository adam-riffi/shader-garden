import type { SimulationSpec } from "../engine/SimulationPlane";
import type { ShaderMeta } from "../params/schema";
import auroraFragment from "./aurora/aurora.frag.glsl";
import { meta as auroraMeta } from "./aurora/meta";
import bloomFragment from "./bloom/bloom.frag.glsl";
import { meta as bloomMeta } from "./bloom/meta";
import bloomSeed from "./bloom/seed.frag.glsl";
import bloomStep from "./bloom/sim.frag.glsl";
import mandelbulbFragment from "./mandelbulb/mandelbulb.frag.glsl";
import { meta as mandelbulbMeta } from "./mandelbulb/meta";
import { meta as moireMeta } from "./moire/meta";
import moireFragment from "./moire/moire.frag.glsl";
import { meta as terrainMeta } from "./terrain/meta";
import terrainFragment from "./terrain/terrain.frag.glsl";
import { meta as testMeta } from "./test/meta";
import testFragment from "./test/test.frag.glsl";

export interface ShaderEntry {
  meta: ShaderMeta;
  fragment: string;
  /** Reachable by URL but not listed in the gallery (the engine test pattern). */
  hidden?: boolean;
  /** Stateful shaders: `fragment` is then the display pass. */
  simulation?: SimulationSpec;
}

/** Every shader, in gallery order. */
export const registry: ShaderEntry[] = [
  { meta: terrainMeta, fragment: terrainFragment },
  { meta: mandelbulbMeta, fragment: mandelbulbFragment },
  {
    meta: bloomMeta,
    fragment: bloomFragment,
    simulation: { step: bloomStep, seed: bloomSeed, stepsPerFrame: 8, size: 512 },
  },
  { meta: auroraMeta, fragment: auroraFragment },
  { meta: moireMeta, fragment: moireFragment },
  { meta: testMeta, fragment: testFragment, hidden: true },
];

export const gallery = registry.filter((entry) => !entry.hidden);

export function findShader(name: string): ShaderEntry | undefined {
  return registry.find((entry) => entry.meta.name === name);
}
