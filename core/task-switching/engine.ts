import type {
  TaskSwitchingTrial,
  TaskSwitchingGameState,
  TaskSwitchingResult,
  TaskSwitchingResponse,
} from "./types";
import { TASK_SWITCHING_CONFIG } from "./config";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getCorrectAnswer(number: number, rule: "magnitude" | "parity"): "left" | "right" {
  if (rule === "magnitude") {
    return number >= 5 ? "right" : "left";
  }
  return number % 2 === 0 ? "right" : "left";
}

export function generateTrials(total: number): TaskSwitchingTrial[] {
  const rules: ("magnitude" | "parity")[] = ["magnitude", "parity"];
  const trials: TaskSwitchingTrial[] = [];

  // First trial: random rule
  let currentRule = rules[Math.floor(Math.random() * rules.length)];
  const firstNumber = randInt(
    TASK_SWITCHING_CONFIG.minNumber,
    TASK_SWITCHING_CONFIG.maxNumber
  );
  trials.push({
    id: 0,
    number: firstNumber,
    rule: currentRule,
    isSwitch: false,
    correctAnswer: getCorrectAnswer(firstNumber, currentRule),
  });

  // Decide which trials are switches (excluding first)
  const switchCount = Math.round((total - 1) * TASK_SWITCHING_CONFIG.switchRatio);
  const switchIndices = new Set<number>();
  while (switchIndices.size < switchCount) {
    const idx = randInt(1, total - 1);
    switchIndices.add(idx);
  }

  for (let i = 1; i < total; i++) {
    const isSwitch = switchIndices.has(i);
    if (isSwitch) {
      currentRule = currentRule === "magnitude" ? "parity" : "magnitude";
    }

    let number = randInt(
      TASK_SWITCHING_CONFIG.minNumber,
      TASK_SWITCHING_CONFIG.maxNumber
    );
    // Avoid same number as previous trial to prevent confusion
    if (i > 0 && number === trials[i - 1].number) {
      const pool = [];
      for (let n = TASK_SWITCHING_CONFIG.minNumber; n <= TASK_SWITCHING_CONFIG.maxNumber; n++) {
        if (n !== trials[i - 1].number) pool.push(n);
      }
      number = pool[Math.floor(Math.random() * pool.length)];
    }

    trials.push({
      id: i,
      number,
      rule: currentRule,
      isSwitch,
      correctAnswer: getCorrectAnswer(number, currentRule),
    });
  }

  return trials;
}

export function createInitialState(): TaskSwitchingGameState {
  return {
    phase: "idle",
    trials: [],
    currentIndex: 0,
    responses: [],
    startedAt: null,
    trialShownAt: null,
  };
}

export function startGame(state: TaskSwitchingGameState): TaskSwitchingGameState {
  const now = Date.now();
  const trials = generateTrials(TASK_SWITCHING_CONFIG.totalTrials);
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
  state: TaskSwitchingGameState,
  answer: "left" | "right"
): TaskSwitchingGameState {
  if (
    state.phase !== "playing" ||
    state.currentIndex >= state.trials.length ||
    !state.trialShownAt
  ) {
    return state;
  }

  const trial = state.trials[state.currentIndex];
  const now = Date.now();
  const reactionTime = now - state.trialShownAt;
  const correct = trial.correctAnswer === answer;

  const response: TaskSwitchingResponse = {
    trialId: trial.id,
    rule: trial.rule,
    isSwitch: trial.isSwitch,
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

export function calculateResult(responses: TaskSwitchingResponse[]): TaskSwitchingResult {
  const total = responses.length;
  if (total === 0) {
    return {
      totalTrials: 0,
      correctTrials: 0,
      accuracy: 0,
      repeatAvgMs: 0,
      switchAvgMs: 0,
      switchCostMs: 0,
      magnitudeAccuracy: 0,
      parityAccuracy: 0,
    };
  }

  const correctTrials = responses.filter((r) => r.correct).length;
  const accuracy = correctTrials / total;

  const repeat = responses.filter((r) => !r.isSwitch);
  const switched = responses.filter((r) => r.isSwitch);

  const repeatAvgMs =
    repeat.length > 0
      ? Math.round(repeat.reduce((s, r) => s + r.reactionTimeMs, 0) / repeat.length)
      : 0;

  const switchAvgMs =
    switched.length > 0
      ? Math.round(switched.reduce((s, r) => s + r.reactionTimeMs, 0) / switched.length)
      : 0;

  const switchCostMs = switchAvgMs - repeatAvgMs;

  const magnitude = responses.filter((r) => r.rule === "magnitude");
  const parity = responses.filter((r) => r.rule === "parity");

  const magnitudeAccuracy =
    magnitude.length > 0 ? magnitude.filter((r) => r.correct).length / magnitude.length : 0;

  const parityAccuracy =
    parity.length > 0 ? parity.filter((r) => r.correct).length / parity.length : 0;

  return {
    totalTrials: total,
    correctTrials,
    accuracy,
    repeatAvgMs,
    switchAvgMs,
    switchCostMs,
    magnitudeAccuracy,
    parityAccuracy,
  };
}
