/**
 * Score extractors for each game.
 *
 * Each extractor turns a game-specific raw result into a normalised scalar
 * where **higher = better**.  The storage layer uses these to compute
 * cross-session stats (best, average) without knowing result internals.
 */

import { registerScoreExtractor } from "./game-storage";
import type { GameId } from "./types";

// ------------------------------------------------------------------
// Reaction Time
// ------------------------------------------------------------------
registerScoreExtractor("reaction-time", (result) => {
  const r = result as { percentile?: number };
  if (typeof r.percentile === "number") return r.percentile;
  return null;
});

// ------------------------------------------------------------------
// N-Back Memory
// ------------------------------------------------------------------
registerScoreExtractor("nback-memory", (result) => {
  const r = result as {
    accuracy?: number;
    dPrime?: number;
    n?: number;
  };
  // Prefer d′ (signal detection) when available; fall back to accuracy.
  // Scale to roughly 0-100 range for consistency with other games.
  if (typeof r.dPrime === "number" && r.dPrime > 0) {
    // d′ of ~3.0 is excellent → 100 pts; cap at 100
    return Math.min(100, Math.round(r.dPrime * 33.3));
  }
  if (typeof r.accuracy === "number") {
    return Math.round(r.accuracy * 100);
  }
  return null;
});

// ------------------------------------------------------------------
// Stroop Test
// ------------------------------------------------------------------
registerScoreExtractor("stroop-test", (result) => {
  const r = result as { accuracy?: number };
  if (typeof r.accuracy === "number") return Math.round(r.accuracy * 100);
  return null;
});

// ------------------------------------------------------------------
// Flanker
// ------------------------------------------------------------------
registerScoreExtractor("flanker", (result) => {
  const r = result as { accuracy?: number };
  if (typeof r.accuracy === "number") return Math.round(r.accuracy * 100);
  return null;
});

// ------------------------------------------------------------------
// Attention Span
// ------------------------------------------------------------------
registerScoreExtractor("attention-span", (result) => {
  const r = result as { percentile?: number };
  if (typeof r.percentile === "number") return r.percentile;
  return null;
});

// ------------------------------------------------------------------
// Digit Span
// ------------------------------------------------------------------
registerScoreExtractor("digit-span", (result) => {
  const r = result as { percentile?: number };
  if (typeof r.percentile === "number") return r.percentile;
  return null;
});

// ------------------------------------------------------------------
// Schulte Grid
// ------------------------------------------------------------------
registerScoreExtractor("schulte-grid", (result) => {
  const r = result as { mode?: string; accuracy?: number; completedCount?: number };
  if (r.mode === "timed") {
    if (typeof r.completedCount === "number") return r.completedCount;
    return null;
  }
  if (typeof r.accuracy === "number") return Math.round(r.accuracy * 100);
  return null;
});

// ------------------------------------------------------------------
// Task Switching
// ------------------------------------------------------------------
registerScoreExtractor("task-switching", (result) => {
  const r = result as { accuracy?: number };
  if (typeof r.accuracy === "number") return Math.round(r.accuracy * 100);
  return null;
});

// ------------------------------------------------------------------
// Breathing 4-7-8
// ------------------------------------------------------------------
registerScoreExtractor("breathing-478", (result) => {
  const r = result as { totalRounds?: number; completedRounds?: number };
  if (typeof r.totalRounds === "number" && typeof r.completedRounds === "number") {
    if (r.totalRounds === 0) return null;
    return Math.round((r.completedRounds / r.totalRounds) * 100);
  }
  return null;
});

// ------------------------------------------------------------------
// Go / No-Go
// ------------------------------------------------------------------
registerScoreExtractor("go-nogo", (result) => {
  const r = result as { percentile?: number; overallAccuracy?: number };
  if (typeof r.percentile === "number") return r.percentile;
  if (typeof r.overallAccuracy === "number") return r.overallAccuracy;
  return null;
});

// ------------------------------------------------------------------
// Focus Gaze
// ------------------------------------------------------------------
registerScoreExtractor("focus-gaze", (result) => {
  const r = result as { completionRate?: number };
  if (typeof r.completionRate === "number") {
    return Math.round(r.completionRate * 100);
  }
  return null;
});
