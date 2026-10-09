import fc from "fast-check";
import { defineMeta, type ParamDef, type ShaderMeta } from "../../src/params/schema";

const STEPS = [0.001, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5];

const floatParam = fc
  .record({
    min: fc.integer({ min: -1000, max: 1000 }).map((x) => x / 10),
    step: fc.constantFrom(...STEPS),
    count: fc.integer({ min: 1, max: 60_000 }),
    at: fc.double({ min: 0, max: 1, noNaN: true }),
  })
  .map(({ min, step, count, at }) => {
    const round = (x: number) => Number(x.toFixed(4));
    const max = round(min + count * step);
    return {
      type: "float" as const,
      min,
      max,
      step,
      default: round(min + Math.floor(at * count) * step),
    };
  });

const intParam = fc
  .record({
    min: fc.integer({ min: -1000, max: 1000 }),
    step: fc.integer({ min: 1, max: 10 }),
    count: fc.integer({ min: 1, max: 1000 }),
    at: fc.double({ min: 0, max: 1, noNaN: true }),
  })
  .map(({ min, step, count, at }) => ({
    type: "int" as const,
    min,
    max: min + count * step,
    step,
    default: min + Math.floor(at * count) * step,
  }));

const hex = fc
  .array(fc.integer({ min: 0, max: 255 }), { minLength: 3, maxLength: 3 })
  .map((bytes) => `#${bytes.map((b) => b.toString(16).padStart(2, "0")).join("")}`);

const param = fc.oneof(
  floatParam,
  intParam,
  fc.boolean().map((d) => ({ type: "bool" as const, default: d })),
  hex.map((d) => ({ type: "color" as const, default: d })),
);

/** Any valid shader metadata: 1 to 16 params of mixed types. */
export const metaArb: fc.Arbitrary<ShaderMeta> = fc
  .array(param, { minLength: 1, maxLength: 16 })
  .map((params) =>
    defineMeta({
      name: "prop",
      title: "Property",
      params: params.map((p, i) => ({ ...p, name: `p${i}` })),
      presets: {},
    }),
  );

function valueArb(p: ParamDef): fc.Arbitrary<unknown> {
  switch (p.type) {
    case "float":
    case "int":
      return fc.double({ min: p.min, max: p.max, noNaN: true });
    case "bool":
      return fc.boolean();
    case "color":
      return hex;
  }
}

/** A meta with any valid (in-range, correctly typed) values for it. */
export const metaWithValuesArb = metaArb.chain((meta) =>
  fc
    .tuple(...meta.params.map(valueArb))
    .map((values) => ({
      meta,
      values: Object.fromEntries(meta.params.map((p, i) => [p.name, values[i]])),
    })),
);

export const seedArb = fc.integer({ min: 0, max: 2 ** 32 - 1 });
