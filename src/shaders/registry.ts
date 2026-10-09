import type { ShaderMeta } from "../params/schema";
import { meta as terrainMeta } from "./terrain/meta";
import terrainFragment from "./terrain/terrain.frag.glsl";
import { meta as testMeta } from "./test/meta";
import testFragment from "./test/test.frag.glsl";

export interface ShaderEntry {
  meta: ShaderMeta;
  fragment: string;
  /** Reachable by URL but not listed in the gallery (the engine test pattern). */
  hidden?: boolean;
}

/** Every shader, in gallery order. */
export const registry: ShaderEntry[] = [
  { meta: terrainMeta, fragment: terrainFragment },
  { meta: testMeta, fragment: testFragment, hidden: true },
];

export const gallery = registry.filter((entry) => !entry.hidden);

export function findShader(name: string): ShaderEntry | undefined {
  return registry.find((entry) => entry.meta.name === name);
}
