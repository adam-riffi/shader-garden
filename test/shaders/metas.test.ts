import { describe, expect, it } from "vitest";
import { type ShaderMeta, uniformName } from "../../src/params/schema";

const metas = import.meta.glob<ShaderMeta>("/src/shaders/*/meta.ts", {
  eager: true,
  import: "meta",
});
const fragments = import.meta.glob<string>("/src/shaders/*/*.frag.glsl", {
  eager: true,
  import: "default",
});

describe("shader metadata", () => {
  it("exists for at least one shader", () => {
    expect(Object.keys(metas).length).toBeGreaterThan(0);
  });

  it.each(Object.entries(metas))("%s is named after its folder", (path, meta) => {
    expect(path).toBe(`/src/shaders/${meta.name}/meta.ts`);
  });

  // Simulations keep some params in their step shader, so any fragment in the folder counts.
  it.each(Object.entries(metas))("%s declares every uniform in its shaders", (_, meta) => {
    const source = Object.entries(fragments)
      .filter(([path]) => path.startsWith(`/src/shaders/${meta.name}/`))
      .map(([, code]) => code)
      .join("\n");
    for (const param of meta.params) {
      expect(source).toMatch(new RegExp(`uniform\\s+\\w+\\s+${uniformName(param)}\\s*;`));
    }
  });
});
