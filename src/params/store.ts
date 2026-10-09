import { createStore, type StoreApi } from "zustand/vanilla";
import { type DecodeStatus, decode } from "./codec";
import { randomize } from "./random";
import { defaults, type ParamValues, quantize, type ShaderMeta } from "./schema";

export interface ParamsState {
  meta: ShaderMeta;
  seed: number;
  values: ParamValues;
  /** How the starting link decoded; the UI explains `unknown-version` and `invalid`. */
  status: DecodeStatus;
  set(name: string, value: unknown): void;
  randomize(seed: number): void;
  applyPreset(name: string): void;
}

export type ParamsStore = StoreApi<ParamsState>;

/** State for one shader, starting from the link in `search`. Every write is quantized. */
export function createParamsStore(meta: ShaderMeta, search = ""): ParamsStore {
  const { seed, values, status } = decode(meta, search);
  return createStore<ParamsState>()((setState, getState) => ({
    meta,
    seed,
    values,
    status,
    set: (name, value) =>
      setState({ values: quantize(meta, { ...getState().values, [name]: value }) }),
    randomize: (next) => setState({ seed: next >>> 0, values: randomize(meta, next >>> 0) }),
    applyPreset: (name) => {
      const preset = meta.presets[name];
      if (!preset) throw new Error(`Unknown preset "${name}" for ${meta.name}`);
      setState({ values: quantize(meta, { ...defaults(meta), ...preset }) });
    },
  }));
}
