/**
 * Literature-based grade system.
 *
 * Maps raw game metrics to a 5-tier grade using published cognitive
 * psychology norms.  **Never claims to rank against real users** —
 * the grade is always labelled "基于文献参考标准".
 */

import type { GameId } from "@/lib/storage/types";
import { toPercentile } from "@/lib/cognitive-report/norms";

export type GradeLevel = "top" | "excellent" | "good" | "average" | "below";

export interface Grade {
  level: GradeLevel;
  /** Localised label shown to the user */
  label: string;
  /** Hex colour for badges / progress bars */
  color: string;
  /** Short one-line description */
  desc: string;
}

const GRADE_TABLE: { minPercentile: number; grade: Grade }[] = [
  {
    minPercentile: 90,
    grade: {
      level: "top",
      label: "顶尖",
      color: "#D4A832",
      desc: "基于文献参考标准，表现处于顶尖水平",
    },
  },
  {
    minPercentile: 75,
    grade: {
      level: "excellent",
      label: "优秀",
      color: "#4AAD7A",
      desc: "基于文献参考标准，表现优秀",
    },
  },
  {
    minPercentile: 50,
    grade: {
      level: "good",
      label: "良好",
      color: "#5A9DE0",
      desc: "基于文献参考标准，表现良好",
    },
  },
  {
    minPercentile: 25,
    grade: {
      level: "average",
      label: "一般",
      color: "#D4847C",
      desc: "基于文献参考标准，处于一般水平",
    },
  },
  {
    minPercentile: 0,
    grade: {
      level: "below",
      label: "待提升",
      color: "#8B7E74",
      desc: "基于文献参考标准，还有提升空间",
    },
  },
];

/**
 * Map a percentile (0–100) to a Grade.
 */
export function percentileToGrade(percentile: number): Grade {
  const p = Math.max(0, Math.min(100, percentile));
  for (const entry of GRADE_TABLE) {
    if (p >= entry.minPercentile) return entry.grade;
  }
  return GRADE_TABLE[GRADE_TABLE.length - 1].grade;
}

/**
 * Compute a Grade for a raw game metric.
 *
 * @param gameId  Game identifier
 * @param metric  Metric name (e.g. "accuracy", "dPrime")
 * @param value   Raw observed value
 * @returns       Grade or null if no norm is available for this metric
 */
export function getGradeForMetric(
  gameId: GameId,
  metric: string,
  value: number
): Grade | null {
  const p = toPercentile(gameId, metric, value);
  if (p === null) return null;
  return percentileToGrade(p);
}

/**
 * Convenience: some games already compute a percentile internally
 * (reaction-time, attention-span, digit-span, go-nogo).
 * Pass that percentile directly instead of re-computing from a raw value.
 */
export function getGradeForPercentile(percentile: number): Grade {
  return percentileToGrade(percentile);
}
