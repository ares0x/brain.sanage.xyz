import type { Breathing478GameState, Breathing478Result, BreathingSubPhase } from "./types";
import { BREATHING_478_CONFIG } from "./config";

export function createInitialState(): Breathing478GameState {
  return {
    phase: "idle",
    currentRound: 0,
    totalRounds: BREATHING_478_CONFIG.defaultRounds,
    subPhase: null,
    startedAt: null,
    endedAt: null,
  };
}

export function startGame(
  state: Breathing478GameState,
  totalRounds?: number
): Breathing478GameState {
  return {
    ...state,
    phase: "instruction",
    currentRound: 0,
    totalRounds: totalRounds ?? state.totalRounds,
    subPhase: null,
    startedAt: null,
    endedAt: null,
  };
}

export function beginBreathing(
  state: Breathing478GameState
): Breathing478GameState {
  return {
    ...state,
    phase: "breathing_in",
    currentRound: 1,
    subPhase: "breathing_in",
    startedAt: Date.now(),
  };
}

export function nextSubPhase(
  state: Breathing478GameState
): Breathing478GameState {
  if (state.phase === "ended") return state;

  const cycle: BreathingSubPhase[] = ["breathing_in", "hold", "breathing_out"];
  const currentIdx = state.subPhase ? cycle.indexOf(state.subPhase) : -1;
  const nextIdx = currentIdx + 1;

  if (nextIdx < cycle.length) {
    return {
      ...state,
      phase: cycle[nextIdx],
      subPhase: cycle[nextIdx],
    };
  }

  // Finished exhale — advance round or end
  const nextRound = state.currentRound + 1;
  if (nextRound > state.totalRounds) {
    return {
      ...state,
      phase: "ended",
      subPhase: null,
      endedAt: Date.now(),
    };
  }

  return {
    ...state,
    phase: "breathing_in",
    currentRound: nextRound,
    subPhase: "breathing_in",
  };
}

export function calculateResult(
  state: Breathing478GameState
): Breathing478Result {
  const completedRounds =
    state.phase === "ended" ? state.totalRounds : state.currentRound - 1;

  return {
    totalRounds: state.totalRounds,
    completedRounds,
  };
}
