import { z } from "zod";
import type { UniformInput } from "../engine/uniforms";

/** An index on a numeric step grid fits a 3-byte varint in the URL codec. */
export const MAX_STEPS = 65_535;
const MAX_PARAMS = 16;

const identifier = z.string().regex(/^[a-z][a-zA-Z0-9]*$/, "use a camelCase identifier");
const common = {
  name: identifier,
  label: z.string().optional(),
  /** GLSL uniform name; defaults to `u` + the capitalized param name. */
  uniform: z
    .string()
    .regex(/^[a-zA-Z_]\w*$/)
    .optional(),
};

function numeric<T extends "float" | "int">(type: T, value: z.ZodNumber) {
  return z
    .object({
      ...common,
      type: z.literal(type),
      min: value,
      max: value,
      step: value.positive(),
      default: value,
    })
    .superRefine((p, ctx) => {
      if (p.min >= p.max) ctx.addIssue({ code: "custom", message: "min must be below max" });
      if (p.default < p.min || p.default > p.max) {
        ctx.addIssue({ code: "custom", message: "default must lie within [min, max]" });
      }
      if (stepCount(p) > MAX_STEPS) {
        ctx.addIssue({ code: "custom", message: `at most ${MAX_STEPS} steps` });
      }
    });
}

const paramSchema = z.discriminatedUnion("type", [
  numeric("float", z.number()),
  numeric("int", z.number().int()),
  z.object({ ...common, type: z.literal("bool"), default: z.boolean() }),
  z.object({
    ...common,
    type: z.literal("color"),
    default: z.string().regex(/^#[0-9a-fA-F]{6}$/, "use #rrggbb"),
  }),
]);

const metaSchema = z
  .object({
    name: z.string().regex(/^[a-z][a-z0-9-]*$/),
    title: z.string().min(1),
    params: z.array(paramSchema).max(MAX_PARAMS),
    presets: z.record(
      z.string(),
      z.record(z.string(), z.union([z.number(), z.boolean(), z.string()])),
    ),
  })
  .superRefine((meta, ctx) => {
    const names = new Set(meta.params.map((p) => p.name));
    if (names.size !== meta.params.length) {
      ctx.addIssue({ code: "custom", message: "param names must be unique" });
    }
    for (const [preset, values] of Object.entries(meta.presets)) {
      for (const key of Object.keys(values)) {
        if (!names.has(key)) {
          ctx.addIssue({ code: "custom", message: `preset ${preset} sets unknown param ${key}` });
        }
      }
    }
  });

export type ParamDef = z.output<typeof paramSchema>;
export type NumericParam = Extract<ParamDef, { type: "float" | "int" }>;
export type ShaderMeta = z.output<typeof metaSchema>;
export type ParamValue = number | boolean | string;
export type ParamValues = Record<string, ParamValue>;

/** Validates shader metadata at import, so a bad `meta.ts` fails tests and the build early. */
export function defineMeta(meta: z.input<typeof metaSchema>): ShaderMeta {
  return metaSchema.parse(meta);
}

/** Number of steps above `min`; the grid holds `stepCount + 1` values. */
export function stepCount(p: { min: number; max: number; step: number }): number {
  return Math.floor((p.max - p.min) / p.step + 1e-9);
}

function decimals(x: number): number {
  const [mantissa = "", exponent = "0"] = String(x).split("e");
  return Math.max(0, (mantissa.split(".")[1] ?? "").length - Number(exponent));
}

/** Grid value at `index`, rounded to the step's precision so 0.1 * 3 reads 0.3. */
export function fromIndex(p: NumericParam, index: number): number {
  const digits = Math.max(decimals(p.min), decimals(p.step));
  return Number((p.min + index * p.step).toFixed(digits));
}

/** Nearest grid index for `value`, clamped to the grid. */
export function toIndex(p: NumericParam, value: number): number {
  return Math.min(Math.max(Math.round((value - p.min) / p.step), 0), stepCount(p));
}

function quantizeOne(p: ParamDef, raw: unknown): ParamValue {
  switch (p.type) {
    case "float":
    case "int":
      return fromIndex(p, toIndex(p, Number.isFinite(raw) ? (raw as number) : p.default));
    case "bool":
      return typeof raw === "boolean" ? raw : p.default;
    case "color":
      return (
        typeof raw === "string" && /^#[0-9a-f]{6}$/i.test(raw) ? raw : p.default
      ).toLowerCase();
  }
}

/**
 * Every param of `meta`, snapped to its grid and clamped into range. Missing or mistyped values
 * take the default and unknown keys are dropped, so any input yields a valid, shareable state.
 */
export function quantize(meta: ShaderMeta, values: Readonly<Record<string, unknown>>): ParamValues {
  return Object.fromEntries(meta.params.map((p) => [p.name, quantizeOne(p, values[p.name])]));
}

export function defaults(meta: ShaderMeta): ParamValues {
  return quantize(meta, {});
}

export function uniformName(p: ParamDef): string {
  return p.uniform ?? `u${p.name.charAt(0).toUpperCase()}${p.name.slice(1)}`;
}

/** Uniform values for `ShaderView`: colours become 0..1 RGB, the seed `uSeed` in [0, 1). */
export function toUniforms(
  meta: ShaderMeta,
  values: Readonly<Record<string, unknown>>,
  seed: number,
): Record<string, UniformInput> {
  const quantized = quantize(meta, values);
  const uniforms: Record<string, UniformInput> = { uSeed: seed / 2 ** 32 };
  for (const p of meta.params) {
    const value = quantized[p.name] as ParamValue;
    uniforms[uniformName(p)] =
      typeof value === "string"
        ? ([1, 3, 5].map((i) => Number.parseInt(value.slice(i, i + 2), 16) / 255) as [
            number,
            number,
            number,
          ])
        : value;
  }
  return uniforms;
}
