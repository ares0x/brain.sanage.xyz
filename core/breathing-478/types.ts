export type BreathingPhase =
  | "idle"
  | "instruction"
  | "breathing_in"
  | "hold"
  | "breathing_out"
  | "ended";

export type BreathingSubPhase = "breathing_in" | "hold" | "breathing_out";

export interface Breathing478GameState {
  phase: BreathingPhase;
  currentRound: number;
  totalRounds: number;
  subPhase: BreathingSubPhase | null;
  startedAt: number | null;
  endedAt: number | null;
}

export interface Breathing478Result {
  totalRounds: number;
  completedRounds: number;
}
