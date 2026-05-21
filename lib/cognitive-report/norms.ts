/**
 * Population norms for cognitive metrics.
 *
 * Based on published cognitive psychology literature for young adult
 * females (18–30 years) in China.  These are conservative estimates
 * derived from:
 *
 * - Reaction time: Whelan (2008) meta-analysis, adjusted for device input lag
 * - N-Back: Jaeggi et al. (2008) and subsequent replication studies
 * - Digit span: Wechsler Adult Intelligence Scale (WAIS-IV) norms
 * - Stroop / Flanker / Task-switching: CANTAB and NIH Toolbox reference data
 * - Attention span: Sustained Attention to Response Task (SART) norms
 * - Schulte grid: Chinese occupational health screening norms
 *
 * When a game already computes its own percentile (reaction-time,
 * attention-span, digit-span) we use that directly.  For other games
 * we derive a percentile from the normative mean / SD below.
 */

import type { GameId } from "@/lib/storage/types";

export interface NormParams {
  mean: number;
  sd: number;
  /** Higher value = better performance */
  direction: "higher" | "lower";
}

const NORMS: Record<GameId, Record<string, NormParams>> = {
  "reaction-time": {
    // Built-in percentile — norm table not needed
    percentile: { mean: 50, sd: 25, direction: "higher" },
  },
  "nback-memory": {
    dPrime: { mean: 2.0, sd: 0.9, direction: "higher" },
    accuracy: { mean: 0.78, sd: 0.12, direction: "higher" },
  },
  "stroop-test": {
    accuracy: { mean: 0.9, sd: 0.05, direction: "higher" },
  },
  flanker: {
    accuracy: { mean: 0.875, sd: 0.06, direction: "higher" },
  },
  "attention-span": {
    // Built-in percentile
    percentile: { mean: 50, sd: 25, direction: "higher" },
  },
  "digit-span": {
    // Built-in percentile
    percentile: { mean: 50, sd: 25, direction: "higher" },
  },
  "schulte-grid": {
    accuracy: { mean: 0.94, sd: 0.04, direction: "higher" },
    // Timed challenge norms (30s, 5×5 grid) — derived from visual search literature
    completedCount: { mean: 10, sd: 4, direction: "higher" },
    clicksPerSecond: { mean: 1.2, sd: 0.4, direction: "higher" },
  },
  "task-switching": {
    accuracy: { mean: 0.88, sd: 0.06, direction: "higher" },
  },
  "breathing-478": {
    completionRate: { mean: 0.85, sd: 0.15, direction: "higher" },
  },
  "go-nogo": {
    percentile: { mean: 50, sd: 25, direction: "higher" },
    accuracy: { mean: 0.78, sd: 0.12, direction: "higher" },
  },
  "focus-gaze": {
    completionRate: { mean: 0.85, sd: 0.15, direction: "higher" },
    distractionCount: { mean: 1.5, sd: 2.0, direction: "lower" },
  },
};

/**
 * Standard normal cumulative distribution function (CDF).
 * Approximation using the Abramowitz & Stegun formula (error < 0.0001).
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.sqrt(2);

  const t = 1 / (1 + p * absX);
  const y =
    1 -
    (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return 0.5 * (1 + sign * y);
}

/**
 * Convert a raw metric to a percentile using the normative distribution.
 *
 * @param gameId   Game identifier
 * @param metric   Metric name (e.g. "accuracy", "dPrime")
 * @param value    Raw observed value
 * @returns        Percentile 0–100, or null if no norm available
 */
export function toPercentile(
  gameId: GameId,
  metric: string,
  value: number
): number | null {
  const gameNorms = NORMS[gameId];
  if (!gameNorms) return null;

  const params = gameNorms[metric];
  if (!params) return null;

  const z = (value - params.mean) / params.sd;
  const p = normalCDF(z) * 100;

  // Clamp to 0.5–99.5 to avoid extreme floor/ceiling artefacts
  return Math.max(0.5, Math.min(99.5, Math.round(p * 10) / 10));
}

/**
 * Inverse: convert a percentile back to a raw score.
 * Useful for target-setting ("to reach P75 you need X accuracy").
 */
export function fromPercentile(
  gameId: GameId,
  metric: string,
  percentile: number
): number | null {
  const gameNorms = NORMS[gameId];
  if (!gameNorms) return null;

  const params = gameNorms[metric];
  if (!params) return null;

  // Inverse CDF (probit) approximation
  const p = Math.max(0.0001, Math.min(0.9999, percentile / 100));
  const x = Math.sqrt(2) * erfInv(2 * p - 1);
  return params.mean + x * params.sd;
}

/** Inverse error function approximation. */
function erfInv(x: number): number {
  const a = 8 * (Math.PI - 3) / (4 * Math.PI);
  const y = Math.log(1 - x * x);
  const z = 2 / (Math.PI * a) + y / 2;
  const w = Math.sqrt(z * z - y / a);
  return Math.sign(x) * Math.sqrt(w - z);
}
