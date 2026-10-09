import { useEffect, useState } from "react";
import { createFrameStats } from "./frameStats";

const REFRESH_MS = 500;

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName))
  );
}

/** p95 frame time of the page, toggled with `F` (DESIGN.md section 7). */
export function FrameMeter() {
  const [visible, setVisible] = useState(false);
  const [p95, setP95] = useState(Number.NaN);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "f" || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTyping(event.target)) return;
      setVisible((shown) => !shown);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const stats = createFrameStats();
    let last = performance.now();
    let frame = requestAnimationFrame(function sample(now) {
      stats.push(now - last);
      last = now;
      frame = requestAnimationFrame(sample);
    });
    const refresh = setInterval(() => setP95(stats.p95()), REFRESH_MS);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(refresh);
    };
  }, [visible]);

  if (!visible) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        padding: "4px 8px",
        font: "12px monospace",
        color: "#7cf2a4",
        background: "rgba(11, 18, 16, 0.8)",
      }}
    >
      {Number.isNaN(p95) ? "p95 – ms" : `p95 ${p95.toFixed(1)} ms`}
    </div>
  );
}
