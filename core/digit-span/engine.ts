import type { DigitSpanGameState, DigitSpanResult, DigitSpanTrial, RecallMode } from "./types";
import { DIGIT_SPAN_CONFIG } from "./config";

function generateSequence(length: number): number[] {
  const [min, max] = DIGIT_SPAN_CONFIG.digitRange;
  return Array.from({ length }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}

export function calculateResult(state: DigitSpanGameState): DigitSpanResult {
  const forwardTrials = state.trials.filter((t) => t.mode === "forward" && t.isCorrect);
  const backwardTrials = state.trials.filter((t) => t.mode === "backward" && t.isCorrect);

  // Span = max length achieved correctly
  const forwardSpan = Math.max(
    0,
    ...forwardTrials.map((t) => t.sequence.length)
  );
  const backwardSpan = Math.max(
    0,
    ...backwardTrials.map((t) => t.sequence.length)
  );
  const maxSpan = Math.max(forwardSpan, backwardSpan);

  const levelEntry =
    DIGIT_SPAN_CONFIG.levelTable.find((entry) => maxSpan >= entry.span) ??
    DIGIT_SPAN_CONFIG.levelTable[DIGIT_SPAN_CONFIG.levelTable.length - 1];

  return {
    forwardSpan,
    backwardSpan,
    totalTrials: state.trials.length,
    correctTrials: state.trials.filter((t) => t.isCorrect).length,
    level: levelEntry.level,
    percentile: levelEntry.percentile,
  };
}

export function createInitialState(): DigitSpanGameState {
  return {
    phase: "idle",
    mode: "forward",
    currentLength: DIGIT_SPAN_CONFIG.minLength,
    maxLength: DIGIT_SPAN_CONFIG.maxLength,
    currentSequence: [],
    userAnswer: [],
    trials: [],
    correctCount: 0,
    startedAt: null,
    showingIndex: 0,
  };
}

export function startGame(
  state: DigitSpanGameState,
  mode: RecallMode = "forward"
): DigitSpanGameState {
  const sequence = generateSequence(DIGIT_SPAN_CONFIG.minLength);
  return {
    ...state,
    phase: "showing",
    mode,
    currentLength: DIGIT_SPAN_CONFIG.minLength,
    currentSequence: sequence,
    userAnswer: [],
    trials: [],
    correctCount: 0,
    startedAt: Date.now(),
    showingIndex: 0,
  };
}

export function advanceShowIndex(state: DigitSpanGameState): DigitSpanGameState {
  if (state.phase !== "showing") return state;

  const nextIndex = state.showingIndex + 1;
  if (nextIndex >= state.currentSequence.length) {
    // Finished showing, move to recalling
    return {
      ...state,
      phase: "recalling",
      showingIndex: nextIndex,
    };
  }

  return {
    ...state,
    showingIndex: nextIndex,
  };
}

export function submitDigit(state: DigitSpanGameState, digit: number): DigitSpanGameState {
  if (state.phase !== "recalling") return state;

  const newAnswer = [...state.userAnswer, digit];

  // Check if answer is complete
  if (newAnswer.length >= state.currentSequence.length) {
    const expected =
      state.mode === "forward"
        ? state.currentSequence
        : [...state.currentSequence].reverse();
    const isCorrect = newAnswer.every((d, i) => d === expected[i]);

    const trial: DigitSpanTrial = {
      sequence: [...state.currentSequence],
      userAnswer: newAnswer,
      isCorrect,
      mode: state.mode,
    };

    const newTrials = [...state.trials, trial];
    const correctForLength = newTrials.filter(
      (t) => t.sequence.length === state.currentLength && t.isCorrect
    ).length;

    // Check if should end (2 wrong at same length or reached max)
    const wrongForLength = newTrials.filter(
      (t) => t.sequence.length === state.currentLength && !t.isCorrect
    ).length;

    const shouldEnd =
      wrongForLength >= 2 ||
      (state.currentLength >= DIGIT_SPAN_CONFIG.maxLength &&
        newAnswer.length >= state.currentSequence.length);

    if (shouldEnd) {
      return {
        ...state,
        phase: "ended",
        userAnswer: newAnswer,
        trials: newTrials,
      };
    }

    // Advance to feedback then next sequence
    return {
      ...state,
      phase: "feedback",
      userAnswer: newAnswer,
      trials: newTrials,
      correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
    };
  }

  return {
    ...state,
    userAnswer: newAnswer,
  };
}

export function nextSequence(state: DigitSpanGameState): DigitSpanGameState {
  if (state.phase !== "feedback") return state;

  // Determine next length
  const correctForLength = state.trials.filter(
    (t) => t.sequence.length === state.currentLength && t.isCorrect
  ).length;
  const wrongForLength = state.trials.filter(
    (t) => t.sequence.length === state.currentLength && !t.isCorrect
  ).length;

  let nextLength = state.currentLength;
  // If at least 1 correct at this length, try next length
  if (correctForLength >= 1 && wrongForLength < 2) {
    nextLength = Math.min(state.currentLength + 1, DIGIT_SPAN_CONFIG.maxLength);
  }

  const newSequence = generateSequence(nextLength);

  return {
    ...state,
    phase: "showing",
    currentLength: nextLength,
    currentSequence: newSequence,
    userAnswer: [],
    showingIndex: 0,
  };
}
