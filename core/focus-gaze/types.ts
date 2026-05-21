export type FocusGazePhase = "idle" | "countdown" | "gazing" | "ended";

export interface FocusGazeGameState {
  phase: FocusGazePhase;
  durationMs: number;
  startedAt: number | null;
  endedAt: number | null;
  distractionCount: number;
  isPaused: boolean;
  pausedAt: number | null;
  totalPausedMs: number;
}

export interface FocusGazeResult {
  durationMs: number;
  actualGazeMs: number;
  distractionCount: number;
  completionRate: number; // 0-1
  level: string; // e.g. "初级专注", "深度专注"
}
