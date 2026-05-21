export type GridSize = 3 | 4 | 5 | 6 | 7;

export type SchulteGameMode = "classic" | "timed";

export type TimedDuration = 30 | 60;

export interface SchulteCell {
  value: number;
  row: number;
  col: number;
}

export interface SchulteGrid {
  size: GridSize;
  cells: SchulteCell[][];
  flatCells: SchulteCell[];
}

export interface SchulteClick {
  value: number;
  timestampMs: number;
}

export type SchulteGamePhase = "idle" | "playing" | "ended";

export interface SchulteGameState {
  phase: SchulteGamePhase;
  grid: SchulteGrid | null;
  nextExpected: number;
  clicks: SchulteClick[];
  startedAt: number | null;
  endedAt: number | null;
  mode: SchulteGameMode;
  timedDurationMs: number | null;
}

export interface SchulteResult {
  mode: SchulteGameMode;
  size: GridSize;
  totalNumbers: number;
  correctClicks: number;
  incorrectClicks: number;
  accuracy: number;
  /** Classic mode: total time to complete */
  totalTimeMs: number;
  /** Classic mode: average time per correctly clicked number */
  avgTimePerNumberMs: number;
  /** Timed mode: how many numbers were correctly clicked within the time limit */
  completedCount: number;
  /** Timed mode: clicks per second */
  clicksPerSecond: number;
  /** Timed mode: time limit that was set */
  timeLimitMs: number;
}
