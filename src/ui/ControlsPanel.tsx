import { useCallback, useEffect, useState } from "react";
import { useStore } from "zustand";
import type { Clock } from "../engine/clock";
import { encode } from "../params/codec";
import { defaults, quantize } from "../params/schema";
import type { ParamsStore } from "../params/store";
import { ParamControls } from "./ParamControls";

export function ControlsPanel({
  store,
  clock,
  onSeed,
}: {
  store: ParamsStore;
  clock: Clock;
  onSeed?: (() => void) | undefined;
}) {
  const { meta, values, seed, applyPreset } = useStore(store);
  const [paused, setPaused] = useState(clock.paused);
  const [message, setMessage] = useState("");
  const [fallbackLink, setFallbackLink] = useState("");
  const randomize = useCallback(() => {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
    store.getState().randomize(next);
    setMessage("");
    setFallbackLink("");
  }, [store]);
  const togglePause = useCallback(() => {
    if (clock.paused) clock.play();
    else clock.pause();
    setPaused(clock.paused);
  }, [clock]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.closest("input, select, textarea"))
      )
        return;
      if (event.key === "r" || event.key === "R") randomize();
      if (event.code === "Space") {
        if (target instanceof HTMLElement && target.closest("button, a, summary")) return;
        event.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [randomize, togglePause]);
  // A fallback link must never keep old parameter values after an edit.
  const currentLink = new URL(
    `/s/${meta.name}?${encode(meta, seed, values)}`,
    window.location.origin,
  ).href;
  const copy = async () => {
    const current = store.getState();
    const link = new URL(
      `/s/${meta.name}?${encode(meta, current.seed, current.values)}`,
      window.location.origin,
    ).href;
    try {
      await navigator.clipboard.writeText(link);
      setFallbackLink("");
      setMessage("Link copied");
    } catch {
      setFallbackLink(link);
      setMessage("Copy this link to share your specimen.");
    }
  };
  return (
    <section className="controls-panel" aria-label="Shader controls">
      <div className="panel-heading">
        <span className="eyebrow">Make it your own</span>
        <span className="seed-label">Seed {seed}</span>
      </div>
      <fieldset className="presets">
        <legend>Presets</legend>
        <div className="preset-options">
          {Object.entries(meta.presets).map(([name, preset]) => {
            const expected = quantize(meta, { ...defaults(meta), ...preset });
            const active = Object.keys(expected).every((key) => expected[key] === values[key]);
            return (
              <button
                type="button"
                key={name}
                aria-pressed={active}
                onClick={() => applyPreset(name)}
              >
                {name}
              </button>
            );
          })}
        </div>
      </fieldset>
      <ParamControls store={store} />
      <div className="panel-actions">
        <button type="button" onClick={randomize} aria-keyshortcuts="R" aria-label="Randomize">
          Randomize <kbd>R</kbd>
        </button>
        <button type="button" onClick={togglePause} aria-keyshortcuts="Space">
          {paused ? "Play" : "Pause"}
        </button>
        {onSeed && (
          <button type="button" onClick={onSeed}>
            Seed
          </button>
        )}
      </div>
      <button className="copy-link" type="button" onClick={() => void copy()}>
        Copy link <span aria-hidden="true">↗</span>
      </button>
      {message && (
        <p className="share-status" role="status">
          {message}
        </p>
      )}
      {fallbackLink && (
        <label className="share-fallback">
          Shareable link
          <input readOnly value={currentLink} onFocus={(event) => event.currentTarget.select()} />
        </label>
      )}
    </section>
  );
}
