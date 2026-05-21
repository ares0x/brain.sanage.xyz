export type ReactionTimePhase = "idle" | "waiting" | "ready" | "too_early" | "ended";

export interface ReactionTimeTrial {
  delayMs: number; // delay before screen turns green
  reactionTimeMs: number | null; // null if too early or not reacted
  tooEarly: boolean;
}

export interface ReactionTimeGameState {
  phase: ReactionTimePhase;
  totalTrials: number;
  currentTrial: number;
  trials: ReactionTimeTrial[];
  greenShownAt: number | null;
  startedAt: number | null;
}

export interface ReactionTimeResult {
  averageMs: number;
  fastestMs: number;
  slowestMs: number;
  validTrials: number;
  tooEarlyCount: number;
  percentile: number; // 0-100, simulated based on average
  reactionAge: string; // e.g. "24岁"
}
