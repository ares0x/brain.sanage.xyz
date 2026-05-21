import type { FocusGazeGameState, FocusGazeResult } from "./types";
import { FOCUS_GAZE_CONFIG } from "./config";

export function createInitialState(): FocusGazeGameState {
  return {
    phase: "idle",
    durationMs: FOCUS_GAZE_CONFIG.defaultDurationSec * 1000,
    startedAt: null,
    endedAt: null,
    distractionCount: 0,
    isPaused: false,
    pausedAt: null,
    totalPausedMs: 0,
  };
}

export function startGame(
  state: FocusGazeGameState,
  durationSec?: number
): FocusGazeGameState {
  const durationMs = (durationSec ?? FOCUS_GAZE_CONFIG.defaultDurationSec) * 1000;
  return {
    ...state,
    phase: "countdown",
    durationMs,
    startedAt: null,
    endedAt: null,
    distractionCount: 0,
    isPaused: false,
    pausedAt: null,
    totalPausedMs: 0,
  };
}

export function beginGazing(state: FocusGazeGameState): FocusGazeGameState {
  return {
    ...state,
    phase: "gazing",
    startedAt: Date.now(),
  };
}

export function recordDistraction(state: FocusGazeGameState): FocusGazeGameState {
  if (state.phase !== "gazing") return state;
  return {
    ...state,
    distractionCount: state.distractionCount + 1,
  };
}

export function pauseGame(state: FocusGazeGameState): FocusGazeGameState {
  if (state.phase !== "gazing" || state.isPaused) return state;
  return {
    ...state,
    isPaused: true,
    pausedAt: Date.now(),
  };
}

export function resumeGame(state: FocusGazeGameState): FocusGazeGameState {
  if (!state.isPaused || !state.pausedAt) return state;
  const pausedDuration = Date.now() - state.pausedAt;
  return {
    ...state,
    isPaused: false,
    pausedAt: null,
    totalPausedMs: state.totalPausedMs + pausedDuration,
  };
}

export function endGame(state: FocusGazeGameState): FocusGazeGameState {
  return {
    ...state,
    phase: "ended",
    endedAt: Date.now(),
    isPaused: false,
  };
}

export function calculateResult(state: FocusGazeGameState): FocusGazeResult {
  const actualGazeMs = state.startedAt && state.endedAt
    ? state.endedAt - state.startedAt - state.totalPausedMs
    : 0;

  const completionRate = state.durationMs > 0
    ? Math.min(actualGazeMs / state.durationMs, 1)
    : 0;

  let level: string;
  if (state.distractionCount === 0 && completionRate >= 1) {
    level = "深度专注";
  } else if (state.distractionCount <= FOCUS_GAZE_CONFIG.maxDistractionsForGood && completionRate >= 0.8) {
    level = "良好专注";
  } else if (completionRate >= 0.5) {
    level = "基础专注";
  } else {
    level = "需要练习";
  }

  return {
    durationMs: state.durationMs,
    actualGazeMs,
    distractionCount: state.distractionCount,
    completionRate,
    level,
  };
}
