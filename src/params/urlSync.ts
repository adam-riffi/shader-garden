import { encode } from "./codec";
import type { ParamsStore } from "./store";

/**
 * Writes the encoded state through `write` once changes settle for `delayMs`, so dragging a
 * slider does not flood the history API. 150 ms keeps the URL within DESIGN.md's 250 ms goal.
 * Returns a function that stops syncing and drops any pending write.
 */
export function syncToUrl(store: ParamsStore, write: (query: string) => void, delayMs = 150) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const unsubscribe = store.subscribe(({ meta, seed, values }) => {
    clearTimeout(timer);
    timer = setTimeout(() => write(encode(meta, seed, values)), delayMs);
  });
  return () => {
    clearTimeout(timer);
    unsubscribe();
  };
}

/** `href` (path, query and hash) with its query replaced by `query`. */
export function withQuery(href: string, query: string): string {
  const url = new URL(href, "http://x");
  url.search = query;
  return `${url.pathname}${url.search}${url.hash}`;
}
