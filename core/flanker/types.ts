export type FlankerTrialType = "congruent" | "incongruent";

export interface FlankerTrial {
  id: number;
  arrows: string; // e.g. "<<<<<", ">><>>"
  centerDirection: "left" | "right";
  type: FlankerTrialType;
}

export type FlankerPhase = "idle" | "playing" | "ended";

export interface FlankerGameState {
  phase: FlankerPhase;
  trials: FlankerTrial[];
  currentIndex: number;
  responses: FlankerResponse[];
  startedAt: number | null;
  trialShownAt: number | null;
}

export interface FlankerResponse {
  trialId: number;
  type: FlankerTrialType;
  correct: boolean;
  reactionTimeMs: number;
}

export interface FlankerResult {
  totalTrials: number;
  correctTrials: number;
  accuracy: number;
  congruentAvgMs: number;
  incongruentAvgMs: number;
  conflictEffectMs: number;
  congruentAccuracy: number;
  incongruentAccuracy: number;
}
