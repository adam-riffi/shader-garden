import { describe, expect, it } from "vitest";
import { loadPrograms, pairPrograms } from "../../src/shaders/programs";

const FULLSCREEN = "/src/shaders/common/fullscreen.vert.glsl";

describe("pairPrograms", () => {
  it("pairs each fragment shader with its own vertex shader, else the full-screen one", () => {
    const programs = pairPrograms({
      [FULLSCREEN]: "fullscreen",
      "/src/shaders/common/noise.glsl": "noise",
      "/src/shaders/bloom/bloom.frag.glsl": "bloom frag",
      "/src/shaders/bloom/sim.frag.glsl": "sim frag",
      "/src/shaders/terrain/terrain.frag.glsl": "terrain frag",
      "/src/shaders/terrain/terrain.vert.glsl": "terrain vert",
    });
    expect(programs).toEqual([
      { name: "bloom/bloom", vertex: "fullscreen", fragment: "bloom frag" },
      { name: "bloom/sim", vertex: "fullscreen", fragment: "sim frag" },
      { name: "terrain/terrain", vertex: "terrain vert", fragment: "terrain frag" },
    ]);
  });

  it("fails loudly when the shared full-screen vertex shader is missing", () => {
    expect(() => pairPrograms({ "/src/shaders/a/a.frag.glsl": "a" })).toThrow(/fullscreen/);
  });
});

describe("loadPrograms", () => {
  it("finds the repository's shaders with includes resolved", () => {
    const test = loadPrograms().find((program) => program.name === "test/test");
    expect(test?.fragment).toContain("uniform float uTime");
    expect(test?.vertex).toContain("gl_Position");
  });
});
