export type GoNogoPhase = "idle" | "stimulus" | "feedback" | "ended";

export type TrialType = "go" | "no-go";

export type TrialOutcome =
  | "hit"        // go trial + responded
  | "miss"       // go trial + no response
  | "correct_reject" // no-go trial + no response
  | "false_alarm";   // no-go trial + responded

export interface GoNogoTrial {
  type: TrialType;
  outcome: TrialOutcome | null;
  rtMs: number | null; // reaction time for responses
}

export interface GoNogoGameState {
  phase: GoNogoPhase;
  totalTrials: number;
  currentTrial: number;
  trials: GoNogoTrial[];
  stimulusShownAt: number | null;
  startedAt: number | null;
}

export interface GoNogoResult {
  goAccuracy: number;      // 0-100
  noGoAccuracy: number;    // 0-100
  overallAccuracy: number; // 0-100
  averageRtMs: number;     // avg RT on correct go trials
  falseAlarmRate: number;  // 0-100
  hitRate: number;         // 0-100
  dPrime: number | null;   // signal detection sensitivity
  totalTrials: number;
  level: string;           // descriptive level
  percentile: number;      // simulated percentile
}
