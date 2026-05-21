import type { AttentionGameState, AttentionResult } from "./types";
import { ATTENTION_CONFIG } from "./config";

export function calculateResult(state: AttentionGameState): AttentionResult {
  const durationMs = state.endedAt && state.startedAt
    ? state.endedAt - state.startedAt
    : 0;
  const durationSeconds = Math.round(durationMs / 1000);

  const levelEntry = ATTENTION_CONFIG.levelTable.find(
    (entry) => durationSeconds >= entry.seconds
  ) ?? ATTENTION_CONFIG.levelTable[ATTENTION_CONFIG.levelTable.length - 1];

  return {
    durationMs,
    durationSeconds,
    maxComboSeconds: Math.round(state.comboSeconds),
    level: levelEntry.level,
    description: levelEntry.description,
    percentile: levelEntry.percentile,
  };
}

export function createInitialState(): AttentionGameState {
  return {
    phase: "idle",
    startedAt: null,
    endedAt: null,
    elapsedMs: 0,
    comboSeconds: 0,
    missed: false,
  };
}

export function startGame(state: AttentionGameState): AttentionGameState {
  const now = Date.now();
  return {
    ...state,
    phase: "playing",
    startedAt: now,
    endedAt: null,
    elapsedMs: 0,
    comboSeconds: 0,
    missed: false,
  };
}

export function endGame(state: AttentionGameState): AttentionGameState {
  return {
    ...state,
    phase: "ended",
    endedAt: Date.now(),
  };
}

export function updateElapsed(
  state: AttentionGameState,
  elapsedMs: number
): AttentionGameState {
  if (state.phase !== "playing") return state;

  const comboSeconds = Math.round(elapsedMs / 1000);

  return {
    ...state,
    elapsedMs,
    comboSeconds,
  };
}

export function getCurrentSpeed(elapsedMs: number): number {
  const elapsedSeconds = elapsedMs / 1000;
  return (
    ATTENTION_CONFIG.baseSpeed +
    elapsedSeconds * ATTENTION_CONFIG.speedIncreasePerSecond
  );
}
