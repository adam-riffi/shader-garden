import { type IUniform, Vector2, Vector3, Vector4 } from "three";

/** A uniform value as shader metadata states it: a float or int, a bool, or a vec2 to vec4 tuple. */
export type UniformInput =
  | number
  | boolean
  | readonly [number, number]
  | readonly [number, number, number]
  | readonly [number, number, number, number];

export type Uniforms = Record<string, IUniform<unknown>>;

/** A binding that does not match the shader's declared uniforms: a programming error in metadata. */
export class UniformBindingError extends Error {
  override name = "UniformBindingError";
}

function toValue(input: UniformInput): unknown {
  if (typeof input !== "object") return input;
  if (input.length === 2) return new Vector2(...input);
  if (input.length === 3) return new Vector3(...input);
  return new Vector4(...input);
}

export function createUniforms(values: Record<string, UniformInput>): Uniforms {
  const uniforms: Uniforms = {};
  for (const [name, input] of Object.entries(values)) uniforms[name] = { value: toValue(input) };
  return uniforms;
}

/**
 * Writes `values` into existing uniforms in place. The material keeps references to the uniform
 * objects and their vectors, so they are mutated, never replaced.
 */
export function bindUniforms(uniforms: Uniforms, values: Record<string, UniformInput>): void {
  for (const [name, input] of Object.entries(values)) {
    const uniform = uniforms[name];
    if (!uniform) throw new UniformBindingError(`Unknown uniform "${name}"`);
    const current = uniform.value;
    const isVector =
      current instanceof Vector2 || current instanceof Vector3 || current instanceof Vector4;
    if (typeof input !== "object") {
      if (isVector) throw new UniformBindingError(`Uniform "${name}" expects a vector`);
      uniform.value = input;
    } else if (isVector && input.length === current.toArray().length) {
      current.fromArray(input);
    } else {
      throw new UniformBindingError(`Uniform "${name}" does not take a ${input.length}-vector`);
    }
  }
}
