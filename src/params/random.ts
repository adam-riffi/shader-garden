import {
  fromIndex,
  type ParamDef,
  type ParamValue,
  type ParamValues,
  type ShaderMeta,
  stepCount,
} from "./schema";

/** Mulberry32: a small, fast 32-bit seeded generator; returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };
}

function randomValue(p: ParamDef, next: () => number): ParamValue {
  switch (p.type) {
    case "float":
    case "int":
      return fromIndex(p, Math.floor(next() * (stepCount(p) + 1)));
    case "bool":
      return next() < 0.5;
    case "color": {
      const byte = () =>
        Math.floor(next() * 256)
          .toString(16)
          .padStart(2, "0");
      return `#${byte()}${byte()}${byte()}`;
    }
  }
}

/** A random view for "Randomize": uniform over each param's grid, the same for the same seed. */
export function randomize(meta: ShaderMeta, seed: number): ParamValues {
  const next = mulberry32(seed);
  return Object.fromEntries(meta.params.map((p) => [p.name, randomValue(p, next)]));
}
