import { useStore } from "zustand";
import type { ParamsStore } from "../params/store";

/**
 * One native input per param, generated from the shader's metadata (no per-shader UI code).
 * Deliberately unstyled: the M4 controls panel builds on it.
 */
export function ParamControls({ store }: { store: ParamsStore }) {
  const meta = useStore(store, (s) => s.meta);
  const values = useStore(store, (s) => s.values);
  const set = useStore(store, (s) => s.set);

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      {meta.params.map((p) => {
        const id = `param-${p.name}`;
        const value = values[p.name];
        return (
          <div key={p.name}>
            <label htmlFor={id}>{p.label ?? p.name}</label>{" "}
            {p.type === "bool" ? (
              <input
                id={id}
                type="checkbox"
                checked={value === true}
                onChange={(e) => set(p.name, e.currentTarget.checked)}
              />
            ) : p.type === "color" ? (
              <input
                id={id}
                type="color"
                value={String(value)}
                onChange={(e) => set(p.name, e.currentTarget.value)}
              />
            ) : (
              <>
                <input
                  id={id}
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={Number(value)}
                  onChange={(e) => set(p.name, e.currentTarget.valueAsNumber)}
                />{" "}
                {/* The slider already exposes its value; a live <output> would announce every drag step. */}
                <span aria-hidden="true">{String(value)}</span>
              </>
            )}
          </div>
        );
      })}
    </form>
  );
}
