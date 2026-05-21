import type {
  GridSize,
  SchulteCell,
  SchulteGrid,
  SchulteGameState,
  SchulteResult,
  SchulteClick,
  SchulteGameMode,
  TimedDuration,
} from "./types";
import { SCHULTE_CONFIG } from "./config";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateGrid(size: GridSize): SchulteGrid {
  const total = size * size;
  const values = shuffle(Array.from({ length: total }, (_, i) => i + 1));

  const cells: SchulteCell[][] = [];
  const flatCells: SchulteCell[] = [];

  for (let row = 0; row < size; row++) {
    const rowCells: SchulteCell[] = [];
    for (let col = 0; col < size; col++) {
      const value = values[row * size + col];
      const cell = { value, row, col };
      rowCells.push(cell);
      flatCells.push(cell);
    }
    cells.push(rowCells);
  }

  return { size, cells, flatCells };
}

export function validateClick(
  state: SchulteGameState,
  value: number
): { isCorrect: boolean; nextState: SchulteGameState } {
  if (state.phase !== "playing" || !state.grid) {
    return { isCorrect: false, nextState: state };
  }

  const isCorrect = value === state.nextExpected;
  const now = Date.now();
  const click: SchulteClick = { value, timestampMs: now };

  const totalNumbers = state.grid.size * state.grid.size;

  // End when all numbers are correctly clicked (both classic and timed modes)
  const isComplete = isCorrect && value === totalNumbers;

  const nextState: SchulteGameState = {
    ...state,
    clicks: [...state.clicks, click],
    nextExpected: isCorrect ? state.nextExpected + 1 : state.nextExpected,
    phase: isComplete ? "ended" : state.phase,
    endedAt: isComplete ? now : state.endedAt,
  };

  return { isCorrect, nextState };
}

export function endGame(state: SchulteGameState): SchulteGameState {
  if (state.phase !== "playing") return state;
  return {
    ...state,
    phase: "ended",
    endedAt: Date.now(),
  };
}

export function calculateResult(state: SchulteGameState): SchulteResult {
  if (!state.grid || !state.startedAt) {
    return {
      mode: state.mode,
      size: SCHULTE_CONFIG.defaultSize,
      totalNumbers: 0,
      correctClicks: 0,
      incorrectClicks: 0,
      accuracy: 0,
      totalTimeMs: 0,
      avgTimePerNumberMs: 0,
      completedCount: 0,
      clicksPerSecond: 0,
      timeLimitMs: state.timedDurationMs ?? 0,
    };
  }

  const totalNumbers = state.grid.size * state.grid.size;
  // nextExpected is the *next* number to find, so everything below it was correct.
  const correctClicks = state.nextExpected - 1;
  const incorrectClicks = state.clicks.length - correctClicks;
  const totalTimeMs =
    (state.endedAt ?? Date.now()) - state.startedAt;

  const timeLimitMs = state.timedDurationMs ?? totalTimeMs;

  return {
    mode: state.mode,
    size: state.grid.size,
    totalNumbers,
    correctClicks,
    incorrectClicks,
    accuracy:
      state.clicks.length > 0 ? correctClicks / state.clicks.length : 0,
    totalTimeMs,
    avgTimePerNumberMs:
      correctClicks > 0 ? Math.round(totalTimeMs / correctClicks) : 0,
    completedCount: correctClicks,
    clicksPerSecond:
      timeLimitMs > 0
        ? Math.round((state.clicks.length / timeLimitMs) * 1000 * 10) / 10
        : 0,
    timeLimitMs,
  };
}

export function createInitialState(): SchulteGameState {
  return {
    phase: "idle",
    grid: null,
    nextExpected: 1,
    clicks: [],
    startedAt: null,
    endedAt: null,
    mode: SCHULTE_CONFIG.defaultMode,
    timedDurationMs: null,
  };
}

export function startGame(
  state: SchulteGameState,
  size: GridSize = SCHULTE_CONFIG.defaultSize,
  mode: SchulteGameMode = SCHULTE_CONFIG.defaultMode,
  timedDuration: TimedDuration = SCHULTE_CONFIG.defaultTimedDuration
): SchulteGameState {
  const now = Date.now();
  return {
    ...state,
    phase: "playing",
    grid: generateGrid(size),
    nextExpected: 1,
    clicks: [],
    startedAt: now,
    endedAt: null,
    mode,
    timedDurationMs: mode === "timed" ? timedDuration * 1000 : null,
  };
}
