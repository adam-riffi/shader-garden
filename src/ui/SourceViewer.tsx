import { type ReactNode, useEffect, useState } from "react";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import glsl from "shiki/langs/glsl.mjs";
import night from "shiki/themes/github-dark.mjs";
import vertex from "../shaders/common/fullscreen.vert.glsl";
import type { ShaderEntry } from "../shaders/registry";

// This module (and therefore Shiki) is requested only when Source is opened.
const highlighter = createHighlighterCore({
  langs: [glsl],
  themes: [night],
  engine: createJavaScriptRegexEngine(),
});

export default function SourceViewer({ entry }: { entry: ShaderEntry }) {
  const files: Record<string, string> = {
    Display: entry.fragment,
    ...(entry.simulation ? { Simulation: entry.simulation.step, Seed: entry.simulation.seed } : {}),
    Vertex: vertex,
  };
  const [file, setFile] = useState("Display");
  const source = files[file] ?? entry.fragment;
  return (
    <>
      <div className="source-heading">
        <label>
          Source file{" "}
          <select value={file} onChange={(event) => setFile(event.currentTarget.value)}>
            {Object.keys(files).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <span>GLSL ES 3.00 · read only</span>
      </div>
      <HighlightedCode key={source} source={source} />
      <p className="source-note">
        Shared includes are expanded to show the code rendered by your GPU.
      </p>
    </>
  );
}

function HighlightedCode({ source }: { source: string }) {
  const [highlighted, setHighlighted] = useState<ReactNode>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let canceled = false;
    highlighter
      .then((value) => {
        const { tokens } = value.codeToTokens(source, { lang: "glsl", theme: "github-dark" });
        const content = tokens.flatMap((line) => [
          ...line.map((token) => (
            <span key={token.offset} style={{ color: token.color }}>
              {token.content}
            </span>
          )),
          "\n",
        ]);
        if (!canceled) setHighlighted(content);
      })
      .catch(() => {
        if (!canceled) setFailed(true);
      });
    return () => {
      canceled = true;
    };
  }, [source]);
  return (
    <>
      {failed && (
        <p role="status">Highlighting is unavailable. The complete source is shown below.</p>
      )}
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable source must be reachable for keyboard scrolling. */}
      <section className="source-code" tabIndex={0} aria-label="Shader source code">
        <pre>
          <code>{highlighted ?? source}</code>
        </pre>
      </section>
    </>
  );
}
