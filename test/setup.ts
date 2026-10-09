import fc from "fast-check";

/**
 * Property runs are reproducible: FC_SEED replays a failure (fast-check prints the seed) and
 * FC_NUM_RUNS raises the case count (the nightly workflow uses 10,000). Bad values throw, so a
 * typo cannot silently run zero cases.
 */
export function propertyConfig(env: Record<string, string | undefined>): fc.Parameters<unknown> {
  const numRuns = Number(env.FC_NUM_RUNS ?? 200);
  if (!Number.isInteger(numRuns) || numRuns < 1)
    throw new Error(`Bad FC_NUM_RUNS: ${env.FC_NUM_RUNS}`);
  if (env.FC_SEED === undefined) return { numRuns };
  const seed = Number(env.FC_SEED);
  if (!Number.isInteger(seed)) throw new Error(`Bad FC_SEED: ${env.FC_SEED}`);
  return { numRuns, seed };
}

fc.configureGlobal(propertyConfig(process.env));
