import { describe, expect, it } from "vitest";
import { defaults, defineMeta, quantize, type ShaderMeta, toUniforms } from "../../src/params/schema";

const meta: ShaderMeta = defineMeta({
  name: "demo",
  title: "Demo",
  params: [
    { name: "warp", type: "float", min: 0, max: 1, step: 0.1, default: 0.3 },
    { name: "octaves", type: "int", min: 1, max: 8, step: 1, default: 4, uniform: "uOct" },
    { name: "glow", type: "bool", default: true },
    { name: "tint", type: "color", default: "#7CF2A4" },
  ],
  presets: { Calm: { warp: 0.1, glow: false } },
});

describe("defineMeta", () => {
  const base = { name: "x", title: "X", presets: {} };
  const float = { name: "a", type: "float", min: 0, max: 1, step: 0.1, default: 0.5 };

  it("accepts a valid meta", () => {
    expect(meta.params).toHaveLength(4);
  });

  it.each([
    ["min not below max", [{ ...float, min: 1, max: 1 }]],
    ["default out of range", [{ ...float, default: 2 }]],
    ["non-positive step", [{ ...float, step: 0 }]],
    ["more than 65,535 steps", [{ ...float, step: 0.00001 }]],
    ["a fractional int step", [{ ...float, type: "int", min: 0, max: 4, step: 0.5, default: 1 }]],
    ["a name that is not a GLSL-friendly identifier", [{ ...float, name: "my param" }]],
    ["duplicate names", [float, float]],
    ["a malformed colour", [{ name: "c", type: "color", default: "green" }]],
    ["more than 16 params", Array.from({ length: 17 }, (_, i) => ({ ...float, name: `p${i}` }))],
  ])("rejects %s", (_, params) => {
    expect(() => defineMeta({ ...base, params } as never)).toThrow();
  });

  it("rejects a preset naming an unknown param", () => {
    expect(() => defineMeta({ ...base, params: [float], presets: { P: { b: 1 } } } as never)).toThrow();
  });
});

describe("quantize", () => {
  it("snaps numbers to the step grid without float noise", () => {
    expect(quantize(meta, { warp: 0.29 }).warp).toBe(0.3);
    expect(quantize(meta, { warp: 0.7000000001 }).warp).toBe(0.7);
  });

  it("clamps numbers into range", () => {
    expect(quantize(meta, { warp: -5, octaves: 99 })).toMatchObject({ warp: 0, octaves: 8 });
  });

  it("falls back to defaults for missing or mistyped values and drops unknown keys", () => {
    const values = quantize(meta, { warp: "0.5", glow: 1, tint: "red", extra: 1 });
    expect(values).toEqual({ warp: 0.3, octaves: 4, glow: true, tint: "#7cf2a4" });
  });

  it("lowercases colours", () => {
    expect(quantize(meta, { tint: "#ABCDEF" }).tint).toBe("#abcdef");
  });

  it("is idempotent", () => {
    const once = quantize(meta, { warp: 0.55, octaves: 3.4 });
    expect(quantize(meta, once)).toEqual(once);
  });
});

describe("defaults", () => {
  it("returns every param's default, quantized", () => {
    expect(defaults(meta)).toEqual({ warp: 0.3, octaves: 4, glow: true, tint: "#7cf2a4" });
  });
});

describe("toUniforms", () => {
  it("maps params to uniform names and GLSL-ready values, plus the seed", () => {
    expect(toUniforms(meta, defaults(meta), 2 ** 31)).toEqual({
      uWarp: 0.3,
      uOct: 4,
      uGlow: true,
      uTint: [124 / 255, 242 / 255, 164 / 255],
      uSeed: 0.5,
    });
  });
});
