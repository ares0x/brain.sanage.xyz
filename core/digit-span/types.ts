export type DigitSpanPhase = "idle" | "showing" | "recalling" | "feedback" | "ended";
export type RecallMode = "forward" | "backward";

export interface DigitSpanTrial {
  sequence: number[];
  userAnswer: number[];
  isCorrect: boolean | null;
  mode: RecallMode;
}

export interface DigitSpanGameState {
  phase: DigitSpanPhase;
  mode: RecallMode;
  currentLength: number;
  maxLength: number;
  currentSequence: number[];
  userAnswer: number[];
  trials: DigitSpanTrial[];
  correctCount: number;
  startedAt: number | null;
  showingIndex: number; // current digit being shown
}

export interface DigitSpanResult {
  forwardSpan: number;
  backwardSpan: number;
  totalTrials: number;
  correctTrials: number;
  level: string;
  percentile: number;
}
