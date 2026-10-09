import fc from "fast-check";

// Property runs are reproducible: FC_SEED replays a failure (fast-check prints the seed),
// FC_NUM_RUNS raises the case count (the nightly workflow uses 10,000).
const seed = process.env.FC_SEED;
fc.configureGlobal({
  numRuns: Number(process.env.FC_NUM_RUNS ?? 200),
  ...(seed ? { seed: Number(seed) } : {}),
});
