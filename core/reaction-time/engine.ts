import type {
  ReactionTimeGameState,
  ReactionTimeResult,
  ReactionTimeTrial,
} from "./types";
import { REACTION_TIME_CONFIG } from "./config";

function randomDelay(): number {
  const { minDelayMs, maxDelayMs } = REACTION_TIME_CONFIG;
  return Math.floor(minDelayMs + Math.random() * (maxDelayMs - minDelayMs));
}

function generateTrials(count: number): ReactionTimeTrial[] {
  return Array.from({ length: count }, () => ({
    delayMs: randomDelay(),
    reactionTimeMs: null,
    tooEarly: false,
  }));
}

export function calculatePercentile(averageMs: number): number {
  const table = REACTION_TIME_CONFIG.percentileTable;
  for (const entry of table) {
    if (averageMs <= entry.ms) return entry.percentile;
  }
  return 1;
}

export function calculateReactionAge(averageMs: number): string {
  const table = REACTION_TIME_CONFIG.ageTable;
  for (const entry of table) {
    if (averageMs <= entry.ms) return entry.age;
  }
  return "60岁+";
}

export function calculateResult(
  trials: ReactionTimeTrial[]
): ReactionTimeResult {
  const validTrials = trials.filter(
    (t) => t.reactionTimeMs !== null && !t.tooEarly
  );

  if (validTrials.length === 0) {
    return {
      averageMs: 0,
      fastestMs: 0,
      slowestMs: 0,
      validTrials: 0,
      tooEarlyCount: trials.filter((t) => t.tooEarly).length,
      percentile: 0,
      reactionAge: "—",
    };
  }

  const times = validTrials.map((t) => t.reactionTimeMs!);
  const averageMs = Math.round(
    times.reduce((s, t) => s + t, 0) / times.length
  );
  const fastestMs = Math.min(...times);
  const slowestMs = Math.max(...times);

  return {
    averageMs,
    fastestMs,
    slowestMs,
    validTrials: validTrials.length,
    tooEarlyCount: trials.filter((t) => t.tooEarly).length,
    percentile: calculatePercentile(averageMs),
    reactionAge: calculateReactionAge(averageMs),
  };
}

export function createInitialState(): ReactionTimeGameState {
  return {
    phase: "idle",
    totalTrials: REACTION_TIME_CONFIG.totalTrials,
    currentTrial: 0,
    trials: [],
    greenShownAt: null,
    startedAt: null,
  };
}

export function startGame(state: ReactionTimeGameState): ReactionTimeGameState {
  const trials = generateTrials(state.totalTrials);
  return {
    ...state,
    phase: "waiting",
    currentTrial: 0,
    trials,
    greenShownAt: null,
    startedAt: Date.now(),
  };
}

export function showGreen(state: ReactionTimeGameState): ReactionTimeGameState {
  if (state.phase !== "waiting") return state;
  return {
    ...state,
    phase: "ready",
    greenShownAt: Date.now(),
  };
}

export function recordClick(state: ReactionTimeGameState): ReactionTimeGameState {
  if (state.phase !== "ready" || state.greenShownAt === null) {
    return state;
  }

  const now = Date.now();
  const reactionTimeMs = now - state.greenShownAt;
  const nextTrial = state.currentTrial + 1;
  const isEnded = nextTrial >= state.totalTrials;

  const updatedTrials = state.trials.map((t, i) =>
    i === state.currentTrial
      ? { ...t, reactionTimeMs, tooEarly: false }
      : t
  );

  return {
    ...state,
    phase: isEnded ? "ended" : "waiting",
    currentTrial: nextTrial,
    trials: updatedTrials,
    greenShownAt: null,
  };
}

export function recordTooEarly(state: ReactionTimeGameState): ReactionTimeGameState {
  if (state.phase !== "waiting") return state;

  const nextTrial = state.currentTrial + 1;
  const isEnded = nextTrial >= state.totalTrials;

  const updatedTrials = state.trials.map((t, i) =>
    i === state.currentTrial ? { ...t, tooEarly: true } : t
  );

  return {
    ...state,
    phase: isEnded ? "ended" : "waiting",
    currentTrial: nextTrial,
    trials: updatedTrials,
    greenShownAt: null,
  };
}
