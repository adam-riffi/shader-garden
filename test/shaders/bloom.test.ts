import { describe, expect, it } from "vitest";
import { findShader, gallery } from "../../src/shaders/registry";

describe("Bloom", () => {
  const bloom = findShader("bloom");

  it("is a gallery simulation stepping 8 times per frame on a 512 px state (DESIGN.md section 6)", () => {
    expect(gallery.map((entry) => entry.meta.name)).toContain("bloom");
    expect(bloom?.simulation).toMatchObject({ stepsPerFrame: 8, size: 512 });
  });

  it("stores its presets as Gray-Scott (feed, kill) pairs", () => {
    const presets = bloom?.meta.presets ?? {};
    expect(Object.keys(presets)).toEqual(["Coral", "Mitosis", "Maze", "Spots"]);
    expect(presets.Coral).toMatchObject({ feed: 0.0545, kill: 0.062 });
    expect(presets.Mitosis).toMatchObject({ feed: 0.0367, kill: 0.0649 });
  });
});
