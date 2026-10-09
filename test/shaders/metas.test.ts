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

  it.each(Object.entries(metas))("%s declares every uniform in its shader", (_, meta) => {
    const source = fragments[`/src/shaders/${meta.name}/${meta.name}.frag.glsl`] ?? "";
    for (const param of meta.params) {
      expect(source).toMatch(new RegExp(`uniform\\s+\\w+\\s+${uniformName(param)}\\s*;`));
    }
  });
});
