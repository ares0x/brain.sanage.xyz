/**
 * Weekly ability trend tracking.
 *
 * Compares this week's cognitive scores vs last week to show
 * improvement stats on the daily plan card.
 */

import { getRecords } from "@/lib/storage";
import { generateCognitiveReport } from "@/lib/cognitive-report";

export interface AbilityTrend {
  label: string;
  changePercent: number;
}

/**
 * Get the most improved cognitive dimension compared to last week.
 * Returns null if there's not enough data for both weeks.
 */
export function getAbilityTrend(): AbilityTrend | null {
  if (typeof window === "undefined") return null;

  const records = getRecords();
  if (records.length === 0) return null;

  const now = new Date();

  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - 6);
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(now.getDate() - 13);
  lastWeekStart.setHours(0, 0, 0, 0);

  const thisWeekRecords = records.filter(
    (r) => r.timestamp >= thisWeekStart.getTime()
  );
  const lastWeekRecords = records.filter(
    (r) =>
      r.timestamp >= lastWeekStart.getTime() &&
      r.timestamp < thisWeekStart.getTime()
  );

  const thisWeekReport = generateCognitiveReport(thisWeekRecords);
  const lastWeekReport = generateCognitiveReport(lastWeekRecords);

  if (!thisWeekReport || !lastWeekReport) return null;

  let bestImprovement: AbilityTrend | null = null;

  for (const dim of thisWeekReport.dimensions) {
    const lastWeekDim = lastWeekReport.dimensions.find(
      (d) => d.dimension === dim.dimension
    );
    if (!lastWeekDim) continue;

    const change = dim.score - lastWeekDim.score;
    if (!bestImprovement || change > bestImprovement.changePercent) {
      bestImprovement = {
        label: dim.label,
        changePercent: change,
      };
    }
  }

  return bestImprovement;
}

/**
 * Check if user has any training data at all.
 */
export function hasTrainingData(): boolean {
  if (typeof window === "undefined") return false;
  const records = getRecords();
  return records.length > 0;
}
