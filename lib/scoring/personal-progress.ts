/**
 * Personal longitudinal comparison.
 *
 * Compares the current session against the user's own history.
 * 100% honest — all data comes from localStorage.
 */

import type { GameId, GameRecord } from "@/lib/storage/types";
import { getRecords } from "@/lib/storage/game-storage";

export interface PersonalComparison {
  /** Total number of sessions for this game */
  totalSessions: number;
  /** Best record (most recent if tied) */
  bestRecord: GameRecord | null;
  /** Average of the last N sessions */
  recentAverage: number | null;
  /** How many sessions to include in "recent" */
  recentWindow: number;
  /** Direction vs last session: "up" | "down" | "flat" | "first" */
  trend: "up" | "down" | "flat" | "first";
  /** Percentage change vs last session (e.g. +12 or -8) */
  trendDeltaPercent: number | null;
  /** Is this a new personal best? */
  isNewBest: boolean;
}

/**
 * Extract a comparable numeric score from a GameRecord.
 * Mirrors the logic in score-extractors.ts but returns the raw
 * normalised value (0–100) for comparison.
 */
function extractComparableScore(record: GameRecord): number | null {
  const r = record.result as Record<string, unknown> | undefined;
  if (!r) return null;

  switch (record.gameId) {
    case "reaction-time": {
      const p = r.percentile;
      if (typeof p === "number") return p;
      return null;
    }
    case "attention-span": {
      const p = r.percentile;
      if (typeof p === "number") return p;
      return null;
    }
    case "digit-span": {
      const p = r.percentile;
      if (typeof p === "number") return p;
      return null;
    }
    case "go-nogo": {
      const p = r.percentile;
      if (typeof p === "number") return p;
      const a = r.overallAccuracy;
      if (typeof a === "number") return a;
      return null;
    }
    case "nback-memory": {
      const d = r.dPrime;
      if (typeof d === "number" && d > 0) {
        return Math.min(100, Math.round(d * 33.3));
      }
      const a = r.accuracy;
      if (typeof a === "number") return Math.round(a * 100);
      return null;
    }
    case "stroop-test":
    case "flanker":
    case "task-switching": {
      const a = r.accuracy;
      if (typeof a === "number") return Math.round(a * 100);
      return null;
    }
    case "schulte-grid": {
      if (r.mode === "timed") {
        const c = r.completedCount;
        if (typeof c === "number") return c;
        return null;
      }
      const a = r.accuracy;
      if (typeof a === "number") return Math.round(a * 100);
      return null;
    }
    case "breathing-478": {
      const total = r.totalRounds;
      const completed = r.completedRounds;
      if (typeof total === "number" && typeof completed === "number" && total > 0) {
        return Math.round((completed / total) * 100);
      }
      return null;
    }
    case "focus-gaze": {
      const cr = r.completionRate;
      if (typeof cr === "number") return Math.round(cr * 100);
      return null;
    }
    default:
      return null;
  }
}

/**
 * Build a personal comparison for a game.
 *
 * @param gameId        Game to analyse
 * @param currentRecord The record from the just-finished session
 * @param recentWindow  How many recent sessions to average (default 5)
 */
export function getPersonalComparison(
  gameId: GameId,
  currentRecord: GameRecord,
  recentWindow = 5
): PersonalComparison {
  let all = getRecords({ gameId });

  // For schulte-grid, filter by mode so classic and timed are not mixed.
  const currentResult = currentRecord.result as Record<string, unknown> | undefined;
  const currentMode = currentResult?.mode;
  if (gameId === "schulte-grid" && currentMode) {
    all = all.filter((r) => {
      const rResult = r.result as Record<string, unknown> | undefined;
      // Records without a mode field were created before timed mode existed — treat as classic.
      const rMode = rResult?.mode ?? "classic";
      return rMode === currentMode;
    });
  }

  const totalSessions = all.length;

  // Find best record among filtered sessions
  let best: GameRecord | null = null;
  let bestScore = -Infinity;
  for (const r of all) {
    const score = extractComparableScore(r);
    if (score !== null && score > bestScore) {
      bestScore = score;
      best = r;
    }
  }

  // Recent average (excluding current if it has already been saved)
  const priorSessions = all.filter((r) => r.id !== currentRecord.id).slice(0, recentWindow);
  const recentScores = priorSessions
    .map(extractComparableScore)
    .filter((s): s is number => s !== null);
  const recentAverage =
    recentScores.length > 0
      ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length)
      : null;

  // Trend vs last session
  const currentScore = extractComparableScore(currentRecord);
  const lastSession = priorSessions[0] ?? null;
  const lastScore = lastSession ? extractComparableScore(lastSession) : null;

  let trend: PersonalComparison["trend"] = "first";
  let trendDeltaPercent: number | null = null;

  if (currentScore !== null && lastScore !== null && lastScore !== 0) {
    const delta = ((currentScore - lastScore) / lastScore) * 100;
    trendDeltaPercent = Math.round(delta);
    if (delta > 3) trend = "up";
    else if (delta < -3) trend = "down";
    else trend = "flat";
  }

  // New best?
  let isNewBest = false;
  if (best && best.id === currentRecord.id) {
    isNewBest = true;
  } else if (currentScore !== null && best) {
    const bestScore = extractComparableScore(best);
    if (bestScore !== null && currentScore > bestScore) {
      isNewBest = true;
    }
  }

  return {
    totalSessions,
    bestRecord: best,
    recentAverage,
    recentWindow,
    trend,
    trendDeltaPercent,
    isNewBest,
  };
}

/**
 * Generate a human-friendly feedback sentence based on personal progress.
 */
export function getPersonalFeedback(
  comparison: PersonalComparison,
  gameTitle: string
): string {
  if (comparison.totalSessions <= 1) {
    return `完成第一次${gameTitle}测试！这是你的基准成绩，下次再来对比进步。`;
  }

  if (comparison.isNewBest) {
    return `新纪录！这是你${comparison.totalSessions}次练习中的最佳表现。`;
  }

  if (comparison.trend === "up" && comparison.trendDeltaPercent !== null) {
    return `比上次进步了 ${comparison.trendDeltaPercent}%，保持这个节奏！`;
  }

  if (comparison.trend === "down" && comparison.trendDeltaPercent !== null) {
    return `比上次下降了 ${Math.abs(comparison.trendDeltaPercent)}%，可能是疲劳了，注意休息后再试。`;
  }

  if (comparison.trend === "flat") {
    return `成绩与上次持平，连续保持稳定也是好现象。`;
  }

  return `这是你第 ${comparison.totalSessions} 次练习。坚持训练，认知能力会持续提升。`;
}
