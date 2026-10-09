import { describe, expect, it } from "vitest";
import { propertyConfig } from "./setup";

describe("propertyConfig", () => {
  it("defaults to 200 runs and a random seed", () => {
    expect(propertyConfig({})).toEqual({ numRuns: 200 });
  });

  it("reads FC_NUM_RUNS and FC_SEED", () => {
    expect(propertyConfig({ FC_NUM_RUNS: "10000", FC_SEED: "-42" })).toEqual({
      numRuns: 10000,
      seed: -42,
    });
  });

  it.each([{ FC_NUM_RUNS: "10k" }, { FC_NUM_RUNS: "0" }, { FC_SEED: "abc" }])(
    "refuses %o instead of silently running nothing",
    (env) => {
      expect(() => propertyConfig(env)).toThrow();
    },
  );
});
