import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { encode } from "../../src/params/codec";
import { randomize } from "../../src/params/random";
import { defaults } from "../../src/params/schema";
import { createParamsStore } from "../../src/params/store";
import { syncToUrl } from "../../src/params/urlSync";
import { meta } from "../../src/shaders/test/meta";

describe("createParamsStore", () => {
  it("starts from the link in the query string", () => {
    const link = encode(meta, 9, { ...defaults(meta), rings: 30 });
    const state = createParamsStore(meta, `?${link}`).getState();
    expect(state).toMatchObject({ seed: 9, values: { rings: 30 }, status: "ok" });
  });

  it("reports an unreadable link and starts from the defaults", () => {
    const state = createParamsStore(meta, "?v=99").getState();
    expect(state).toMatchObject({ seed: 1, values: defaults(meta), status: "unknown-version" });
  });

  it("quantizes every value it is given", () => {
    const store = createParamsStore(meta);
    store.getState().set("rings", 12.3);
    store.getState().set("tint", "#ABCDEF");
    expect(store.getState().values).toMatchObject({ rings: 12.5, tint: "#abcdef" });
  });

  it("randomizes from a seed and remembers it", () => {
    const store = createParamsStore(meta);
    store.getState().randomize(1234);
    expect(store.getState()).toMatchObject({ seed: 1234, values: randomize(meta, 1234) });
  });

  it("applies a preset over the defaults", () => {
    const store = createParamsStore(meta);
    store.getState().set("invert", true);
    store.getState().applyPreset("Calm");
    expect(store.getState().values).toEqual({ ...defaults(meta), rings: 8, speed: 0.5 });
  });

  it("rejects an unknown preset", () => {
    expect(() => createParamsStore(meta).getState().applyPreset("Nope")).toThrow(/Nope/);
  });
});

describe("syncToUrl", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("writes the encoded state once changes settle", () => {
    const store = createParamsStore(meta);
    const write = vi.fn();
    syncToUrl(store, write, 150);

    store.getState().set("rings", 10);
    store.getState().set("rings", 11);
    vi.advanceTimersByTime(149);
    expect(write).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(write).toHaveBeenCalledOnce();
    expect(write).toHaveBeenCalledWith(encode(meta, 1, { ...defaults(meta), rings: 11 }));
  });

  it("stops writing once unsubscribed, dropping a pending write", () => {
    const store = createParamsStore(meta);
    const write = vi.fn();
    const stop = syncToUrl(store, write, 150);
    store.getState().set("rings", 10);
    stop();
    vi.advanceTimersByTime(1000);
    expect(write).not.toHaveBeenCalled();
  });
});
