import { lazy, Suspense, useEffect, useState } from "react";
import type { ShaderEntry } from "../shaders/registry";

const SourceViewer = lazy(() => import("./SourceViewer"));

export function SourcePanel({ entry }: { entry: ShaderEntry }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "s" && event.key !== "S") return;
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.closest("input, select, textarea"))
      )
        return;
      event.preventDefault();
      setOpen((value) => !value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="source-panel">
      <button
        className="source-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="shader-source"
        aria-keyshortcuts="S"
        aria-label="Source"
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{open ? "−" : "+"}</span> Source <kbd>S</kbd>
      </button>
      {open && (
        <section id="shader-source" className="source-content" aria-label="GLSL source">
          <Suspense fallback={<p>Opening source…</p>}>
            <SourceViewer entry={entry} />
          </Suspense>
        </section>
      )}
    </div>
  );
}
