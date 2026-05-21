export type NBackStimulusType = "position" | "color" | "letter";

export interface NBackStimulus {
  id?: number;
  position?: number; // 0-8 for 3x3 grid
  color?: string;
  letter?: string;
}

export interface NBackTrial {
  id: number;
  stimulus: NBackStimulus;
  isMatch: boolean;
}

export interface NBackResponse {
  trialId: number;
  isMatch: boolean;
  userSaidMatch: boolean;
  reactionTimeMs: number;
  timeout?: boolean;
}

export type NBackGamePhase = "idle" | "playing" | "ended";

export interface NBackGameState {
  phase: NBackGamePhase;
  n: number;
  trials: NBackTrial[];
  responses: NBackResponse[];
  currentIndex: number;
  stimulusVisible: boolean;
  hasResponded: boolean;
  startedAt: number | null;
  trialStartedAt: number | null;
}

export interface NBackResult {
  n: number;
  totalTrials: number;
  correctResponses: number;
  misses: number;
  falseAlarms: number;
  accuracy: number;
  dPrime: number; // signal detection theory measure
  averageReactionTimeMs: number;
}
