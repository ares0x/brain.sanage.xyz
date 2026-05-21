/**
 * Cognitive assessment report types.
 *
 * A report aggregates results across multiple game sessions into 5
 * cognitive dimensions, each scored 0-100 with a population percentile.
 */

import type { GameId } from "@/lib/storage/types";

export type CognitiveDimension =
  | "attention"
  | "memory"
  | "processingSpeed"
  | "executiveFunction"
  | "emotionalRegulation";

export interface DimensionConfig {
  dimension: CognitiveDimension;
  label: string;
  description: string;
  color: string;
  gameWeights: { gameId: GameId; weight: number }[];
}

export interface DimensionScore {
  dimension: CognitiveDimension;
  label: string;
  score: number; // 0-100
  percentile: number; // 0-100
  description: string;
  color: string;
}

export interface Recommendation {
  dimension: CognitiveDimension;
  dimensionLabel: string;
  gameId: GameId;
  gameTitle: string;
  reason: string;
}

export interface CognitiveReport {
  /** Overall composite score 0-100 */
  overallScore: number;
  /** ISO date string */
  generatedAt: string;
  /** Per-dimension breakdown */
  dimensions: DimensionScore[];
  /** One-sentence personalised summary */
  summary: string;
  /** Top 2-3 strengths */
  strengths: string[];
  /** Top 2-3 areas for improvement */
  weaknesses: string[];
  /** Game recommendations ordered by priority */
  recommendations: Recommendation[];
}

/** Raw metric extracted from a game result for norm comparison. */
export interface ExtractedMetric {
  gameId: GameId;
  metric: "percentile" | "accuracy" | "dPrime" | "completionRate" | "span";
  value: number;
}
