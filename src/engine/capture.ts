/**
 * Capture mode: `?t=<seconds>` freezes the clock at that time so goldens and recorded videos see
 * the same frame every run (DESIGN.md section 6, "Determinism"). Undefined means a live view.
 */
export function captureTime(search: string): number | undefined {
  const raw = new URLSearchParams(search).get("t");
  if (raw === null || raw.trim() === "") return undefined;
  const time = Number(raw);
  return Number.isFinite(time) && time >= 0 ? time : undefined;
}
