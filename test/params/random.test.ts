import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { mulberry32, randomize } from "../../src/params/random";
import { quantize } from "../../src/params/schema";
import { meta as testMeta } from "../../src/shaders/test/meta";
import { metaArb, seedArb } from "./arbitraries";

describe("mulberry32", () => {
  it("yields the same sequence for the same seed, within [0, 1)", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it("yields different sequences for different seeds", () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});

describe("randomize", () => {
  it("P3: is deterministic for a given meta and seed", () => {
    fc.assert(
      fc.property(metaArb, seedArb, (meta, seed) => {
        expect(randomize(meta, seed)).toEqual(randomize(meta, seed));
      }),
    );
  });

  it("P3: always yields in-range, on-grid values for every param", () => {
    fc.assert(
      fc.property(metaArb, seedArb, (meta, seed) => {
        const values = randomize(meta, seed);
        expect(Object.keys(values)).toEqual(meta.params.map((p) => p.name));
        expect(quantize(meta, values)).toEqual(values);
      }),
    );
  });

  it("gives different views for different seeds", () => {
    expect(randomize(testMeta, 1)).not.toEqual(randomize(testMeta, 2));
  });
});
