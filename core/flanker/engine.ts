import type { FlankerTrial, FlankerGameState, FlankerResult, FlankerResponse } from "./types";
import { FLANKER_CONFIG } from "./config";

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateArrowString(center: "left" | "right", type: "congruent" | "incongruent"): string {
  const left = FLANKER_CONFIG.leftArrow;
  const right = FLANKER_CONFIG.rightArrow;
  const half = Math.floor(FLANKER_CONFIG.arrowsPerTrial / 2);

  if (type === "congruent") {
    return center === "left"
      ? left.repeat(FLANKER_CONFIG.arrowsPerTrial)
      : right.repeat(FLANKER_CONFIG.arrowsPerTrial);
  }

  // incongruent: flanking arrows opposite to center
  const flank = center === "left" ? right : left;
  const centerArrow = center === "left" ? left : right;
  return flank.repeat(half) + centerArrow + flank.repeat(half);
}

export function generateTrials(total: number): FlankerTrial[] {
  const congruentCount = Math.floor(total * FLANKER_CONFIG.congruentRatio);
  const incongruentCount = total - congruentCount;
  const trials: FlankerTrial[] = [];
  let id = 0;

  for (let i = 0; i < congruentCount; i++) {
    const center = randInt(2) === 0 ? "left" : "right";
    trials.push({
      id: id++,
      arrows: generateArrowString(center, "congruent"),
      centerDirection: center,
      type: "congruent",
    });
  }

  for (let i = 0; i < incongruentCount; i++) {
    const center = randInt(2) === 0 ? "left" : "right";
    trials.push({
      id: id++,
      arrows: generateArrowString(center, "incongruent"),
      centerDirection: center,
      type: "incongruent",
    });
  }

  return shuffleArray(trials).map((t, i) => ({ ...t, id: i }));
}

export function createInitialState(): FlankerGameState {
  return {
    phase: "idle",
    trials: [],
    currentIndex: 0,
    responses: [],
    startedAt: null,
    trialShownAt: null,
  };
}

export function startGame(state: FlankerGameState): FlankerGameState {
  const now = Date.now();
  const trials = generateTrials(FLANKER_CONFIG.totalTrials);
  return {
    ...state,
    phase: "playing",
    trials,
    currentIndex: 0,
    responses: [],
    startedAt: now,
    trialShownAt: now,
  };
}

export function recordResponse(
  state: FlankerGameState,
  userDirection: "left" | "right"
): FlankerGameState {
  if (state.phase !== "playing" || state.currentIndex >= state.trials.length || !state.trialShownAt) {
    return state;
  }

  const trial = state.trials[state.currentIndex];
  const now = Date.now();
  const reactionTime = now - state.trialShownAt;
  const correct = trial.centerDirection === userDirection;

  const response: FlankerResponse = {
    trialId: trial.id,
    type: trial.type,
    correct,
    reactionTimeMs: Math.max(0, reactionTime),
  };

  const nextIndex = state.currentIndex + 1;
  const isEnded = nextIndex >= state.trials.length;

  return {
    ...state,
    responses: [...state.responses, response],
    currentIndex: nextIndex,
    phase: isEnded ? "ended" : "playing",
    trialShownAt: isEnded ? null : now,
  };
}

export function advanceToNextTrial(state: FlankerGameState): FlankerGameState {
  if (state.phase !== "playing") return state;
  return {
    ...state,
    trialShownAt: Date.now(),
  };
}

export function calculateResult(responses: FlankerResponse[]): FlankerResult {
  const total = responses.length;
  if (total === 0) {
    return {
      totalTrials: 0,
      correctTrials: 0,
      accuracy: 0,
      congruentAvgMs: 0,
      incongruentAvgMs: 0,
      conflictEffectMs: 0,
      congruentAccuracy: 0,
      incongruentAccuracy: 0,
    };
  }

  const correctTrials = responses.filter((r) => r.correct).length;
  const accuracy = correctTrials / total;

  const congruent = responses.filter((r) => r.type === "congruent");
  const incongruent = responses.filter((r) => r.type === "incongruent");

  const congruentAvgMs =
    congruent.length > 0
      ? Math.round(congruent.reduce((s, r) => s + r.reactionTimeMs, 0) / congruent.length)
      : 0;

  const incongruentAvgMs =
    incongruent.length > 0
      ? Math.round(incongruent.reduce((s, r) => s + r.reactionTimeMs, 0) / incongruent.length)
      : 0;

  const conflictEffectMs = incongruentAvgMs - congruentAvgMs;

  const congruentAccuracy =
    congruent.length > 0 ? congruent.filter((r) => r.correct).length / congruent.length : 0;

  const incongruentAccuracy =
    incongruent.length > 0 ? incongruent.filter((r) => r.correct).length / incongruent.length : 0;

  return {
    totalTrials: total,
    correctTrials,
    accuracy,
    congruentAvgMs,
    incongruentAvgMs,
    conflictEffectMs,
    congruentAccuracy,
    incongruentAccuracy,
  };
}
