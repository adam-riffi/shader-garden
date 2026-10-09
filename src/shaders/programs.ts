/** One GPU program: a fragment shader and the vertex shader it runs with. */
export interface ShaderProgram {
  /** Path under `src/shaders` without the `.frag.glsl` suffix, for example `bloom/sim`. */
  name: string;
  vertex: string;
  fragment: string;
}

const ROOT = "/src/shaders/";
const FULLSCREEN = `${ROOT}common/fullscreen.vert.glsl`;

/**
 * Pairs every `<name>.frag.glsl` with `<name>.vert.glsl` when it exists, otherwise with the shared
 * full-screen vertex shader. Files in `common/` are only included by others, never compiled alone.
 */
export function pairPrograms(sources: Record<string, string>): ShaderProgram[] {
  const fullscreen = sources[FULLSCREEN];
  if (fullscreen === undefined) throw new Error(`Missing ${FULLSCREEN}`);
  return Object.keys(sources)
    .filter((path) => path.endsWith(".frag.glsl") && !path.startsWith(`${ROOT}common/`))
    .sort()
    .map((path) => ({
      name: path.slice(ROOT.length, -".frag.glsl".length),
      vertex: sources[path.replace(/\.frag\.glsl$/, ".vert.glsl")] ?? fullscreen,
      fragment: sources[path] ?? "",
    }));
}

/** Every shader program in the repository, with `#include`s resolved by vite-plugin-glsl. */
export function loadPrograms(): ShaderProgram[] {
  return pairPrograms(
    import.meta.glob<string>("/src/shaders/**/*.glsl", { eager: true, import: "default" }),
  );
}
