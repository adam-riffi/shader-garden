import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { DEFAULT_SEED, decode, encode } from "../../src/params/codec";
import { defaults, defineMeta, quantize } from "../../src/params/schema";
import { meta as testMeta } from "../../src/shaders/test/meta";
import { metaWithValuesArb, seedArb } from "./arbitraries";

describe("encode", () => {
  it("writes the v1 format: version, seed, packed values (format locked by this test)", () => {
    // rings index 28, speed index 20, tint 7c f2 a4, invert 0 -> bytes 1c 14 7c f2 a4 00.
    expect(encode(testMeta, 1, defaults(testMeta))).toBe("v=1&s=1&p=HBR88qQA");
  });
});

describe("decode", () => {
  const fallback = { seed: DEFAULT_SEED, values: defaults(testMeta) };

  it("P1: decode(encode(values)) equals quantize(values)", () => {
    fc.assert(
      fc.property(metaWithValuesArb, seedArb, ({ meta, values }, seed) => {
        expect(decode(meta, encode(meta, seed, values))).toEqual({
          seed,
          values: quantize(meta, values),
          status: "ok",
        });
      }),
    );
  });

  it("P2: every shareable URL is at most 200 characters", () => {
    fc.assert(
      fc.property(metaWithValuesArb, seedArb, ({ meta, values }, seed) => {
        // Measured with the longest name the schema allows.
        const url = `/s/${"x".repeat(32)}?${encode(meta, seed, values)}`;
        expect(url.length).toBeLessThanOrEqual(200);
      }),
    );
  });

  it("returns defaults for a URL without parameters", () => {
    expect(decode(testMeta, "")).toEqual({ ...fallback, status: "empty" });
  });

  it("returns defaults for an unknown version", () => {
    expect(decode(testMeta, "?v=99&s=5&p=AAAA")).toEqual({
      ...fallback,
      status: "unknown-version",
    });
  });

  it.each([
    ["a non-numeric seed", "v=1&s=abc&p=HBR88qQA"],
    ["a seed above 32 bits", "v=1&s=4294967296&p=HBR88qQA"],
    ["characters outside base64url", "v=1&s=1&p=HB+8/qQ="],
    ["a length no base64 string has", "v=1&s=1&p=HBR88"],
    ["a varint longer than 3 bytes", "v=1&s=1&p=_____w"],
    ["a colour cut short", "v=1&s=1&p=HBR8"],
  ])("returns defaults for %s", (_, search) => {
    expect(decode(testMeta, search)).toEqual({ ...fallback, status: "invalid" });
  });

  it("keeps the seed and defaults all values when p is absent", () => {
    expect(decode(testMeta, "v=1&s=7")).toEqual({
      seed: 7,
      values: defaults(testMeta),
      status: "ok",
    });
  });

  it("defaults params appended after the link was made", () => {
    const older = defineMeta({ ...testMeta, params: testMeta.params.slice(0, 2) });
    const link = encode(older, 3, { rings: 30, speed: 1 });
    expect(decode(testMeta, link)).toEqual({
      seed: 3,
      values: { ...defaults(testMeta), rings: 30, speed: 1 },
      status: "ok",
    });
  });

  it("clamps an index beyond the grid to the maximum", () => {
    // 0xff 0xff 0x03 is index 65535; rings has 72 steps.
    expect(decode(testMeta, "v=1&s=1&p=__8D").values.rings).toBe(40);
  });
});
