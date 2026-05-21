export type AttentionPhase = "idle" | "playing" | "ended";

export interface DotPosition {
  x: number; // 0-1 relative to container
  y: number; // 0-1 relative to container
}

export interface AttentionGameState {
  phase: AttentionPhase;
  startedAt: number | null;
  endedAt: number | null;
  elapsedMs: number;
  comboSeconds: number; // continuous tracking seconds before miss
  missed: boolean;
}

export interface AttentionResult {
  durationMs: number;
  durationSeconds: number;
  maxComboSeconds: number;
  level: string;
  description: string;
  percentile: number;
}
