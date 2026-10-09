import {
  defaults,
  fromIndex,
  type ParamValue,
  type ParamValues,
  quantize,
  type ShaderMeta,
  stepCount,
  toIndex,
} from "./schema";

/**
 * Query string: `v=1&s=<seed>&p=<base64url>`. `p` packs the values in declaration order: a numeric
 * param as the LEB128 varint of its step index, a bool as one byte, a colour as three bytes.
 * Appending params keeps old links working (missing trailing values take defaults); reordering or
 * removing params needs a new version.
 */
export const VERSION = 1;
export const DEFAULT_SEED = 1;
const MAX_VARINT_BYTES = 3;

export type DecodeStatus = "ok" | "empty" | "unknown-version" | "invalid";

export interface Decoded {
  seed: number;
  values: ParamValues;
  status: DecodeStatus;
}

function toBase64Url(bytes: number[]): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(text: string): number[] | undefined {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) return undefined;
  try {
    return [...atob(text.replace(/-/g, "+").replace(/_/g, "/"))].map((c) => c.charCodeAt(0));
  } catch {
    return undefined; // A length that no base64 encoding produces.
  }
}

export function encode(
  meta: ShaderMeta,
  seed: number,
  values: Readonly<Record<string, unknown>>,
): string {
  const quantized = quantize(meta, values);
  const bytes: number[] = [];
  for (const p of meta.params) {
    const value = quantized[p.name] as ParamValue;
    if (p.type === "bool") bytes.push(value ? 1 : 0);
    else if (p.type === "color") {
      for (const i of [1, 3, 5]) bytes.push(Number.parseInt(String(value).slice(i, i + 2), 16));
    } else {
      let index = toIndex(p, value as number);
      do {
        bytes.push((index & 0x7f) | (index > 0x7f ? 0x80 : 0));
        index >>>= 7;
      } while (index > 0);
    }
  }
  return `v=${VERSION}&s=${seed >>> 0}&p=${toBase64Url(bytes)}`;
}

/** Reads `p` back into raw values; undefined if the bytes are malformed. */
function unpack(meta: ShaderMeta, bytes: number[]): Record<string, unknown> | undefined {
  const raw: Record<string, unknown> = {};
  let at = 0;
  for (const p of meta.params) {
    if (at >= bytes.length) break; // Params appended after this link was made keep their defaults.
    if (p.type === "bool") raw[p.name] = bytes[at++] !== 0;
    else if (p.type === "color") {
      const rgb = bytes.slice(at, at + 3);
      at += 3;
      if (rgb.length < 3) return undefined;
      raw[p.name] = `#${rgb.map((b) => b.toString(16).padStart(2, "0")).join("")}`;
    } else {
      let index = 0;
      for (let shift = 0; ; shift += 7) {
        const byte = bytes[at++];
        if (byte === undefined || shift >= 7 * MAX_VARINT_BYTES) return undefined;
        index |= (byte & 0x7f) << shift;
        if (byte < 0x80) break;
      }
      raw[p.name] = fromIndex(p, Math.min(index, stepCount(p)));
    }
  }
  return raw;
}

/** Parses a query string. Anything unreadable falls back to the defaults with a status to report. */
export function decode(meta: ShaderMeta, search: string): Decoded {
  const query = new URLSearchParams(search);
  const fallback = (status: DecodeStatus): Decoded => ({
    seed: DEFAULT_SEED,
    values: defaults(meta),
    status,
  });
  const version = query.get("v");
  if (version === null) return fallback("empty");
  if (version !== String(VERSION)) return fallback("unknown-version");

  const seedText = query.get("s") ?? String(DEFAULT_SEED);
  const seed = Number(seedText);
  if (!/^\d{1,10}$/.test(seedText) || seed > 0xffffffff) return fallback("invalid");
  const bytes = fromBase64Url(query.get("p") ?? "");
  const raw = bytes && unpack(meta, bytes);
  if (!raw) return fallback("invalid");
  return { seed, values: quantize(meta, raw), status: "ok" };
}
