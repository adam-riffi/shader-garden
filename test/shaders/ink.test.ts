import { describe, expect, it } from "vitest";
import { findShader, gallery } from "../../src/shaders/registry";

describe("Ink", () => {
  const ink = findShader("ink");

  it("is a gallery simulation within the 512 px texture budget", () => {
    expect(gallery.map((entry) => entry.meta.name)).toContain("ink");
    expect(ink?.simulation?.size).toBeLessThanOrEqual(512);
  });

  it("controls the curl field, its speed and how fast dye fades", () => {
    expect(ink?.meta.params.map((p) => p.name)).toEqual(
      expect.arrayContaining(["curl", "flow", "fade"]),
    );
  });

  it("ships its presets", () => {
    expect(Object.keys(ink?.meta.presets ?? {})).toEqual(["Marble", "Smoke"]);
  });
});
