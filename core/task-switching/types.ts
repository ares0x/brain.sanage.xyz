export type TaskRule = "magnitude" | "parity";

export interface TaskSwitchingTrial {
  id: number;
  number: number; // 1-9
  rule: TaskRule;
  isSwitch: boolean; // true if this trial's rule differs from previous
  correctAnswer: "left" | "right";
}

export type TaskSwitchingPhase = "idle" | "playing" | "ended";

export interface TaskSwitchingGameState {
  phase: TaskSwitchingPhase;
  trials: TaskSwitchingTrial[];
  currentIndex: number;
  responses: TaskSwitchingResponse[];
  startedAt: number | null;
  trialShownAt: number | null;
}

export interface TaskSwitchingResponse {
  trialId: number;
  rule: TaskRule;
  isSwitch: boolean;
  correct: boolean;
  reactionTimeMs: number;
}

export interface TaskSwitchingResult {
  totalTrials: number;
  correctTrials: number;
  accuracy: number;
  repeatAvgMs: number;
  switchAvgMs: number;
  switchCostMs: number;
  magnitudeAccuracy: number;
  parityAccuracy: number;
}
