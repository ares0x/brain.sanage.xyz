import type {
  StroopColor,
  StroopQuestion,
  StroopAnswer,
  StroopGameState,
  StroopResult,
} from "./types";
import { STROOP_CONFIG } from "./config";

const COLORS: StroopColor[] = ["red", "green", "blue", "yellow", "purple"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateQuestions(count: number): StroopQuestion[] {
  const congruentCount = Math.floor(count * STROOP_CONFIG.congruentRatio);
  const incongruentCount = count - congruentCount;

  const questions: StroopQuestion[] = [];

  for (let i = 0; i < congruentCount; i++) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    questions.push({
      id: i,
      word: color,
      ink: color,
      isCongruent: true,
    });
  }

  for (let i = congruentCount; i < count; i++) {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    let ink = COLORS[Math.floor(Math.random() * COLORS.length)];
    while (ink === word) {
      ink = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    questions.push({
      id: i,
      word,
      ink,
      isCongruent: false,
    });
  }

  return shuffle(questions).map((q, idx) => ({ ...q, id: idx }));
}

export function validateAnswer(
  question: StroopQuestion,
  selected: StroopColor,
  reactionTimeMs: number
): StroopAnswer {
  return {
    questionId: question.id,
    selectedColor: selected,
    correctColor: question.ink,
    isCorrect: selected === question.ink,
    reactionTimeMs: Math.max(0, reactionTimeMs),
  };
}

/**
 * @deprecated Use `calculateDetailedResult(questions, answers)` instead.
 * This function cannot compute congruent/incongruent breakdowns and returns 0 for those fields.
 */
export function calculateResult(answers: StroopAnswer[]): StroopResult {
  const total = answers.length;
  if (total === 0) {
    return {
      totalQuestions: 0,
      correctCount: 0,
      incorrectCount: 0,
      accuracy: 0,
      averageReactionTimeMs: 0,
      congruentAccuracy: 0,
      incongruentAccuracy: 0,
      averageCongruentTimeMs: 0,
      averageIncongruentTimeMs: 0,
    };
  }

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const avgTime =
    answers.reduce((sum, a) => sum + a.reactionTimeMs, 0) / total;

  return {
    totalQuestions: total,
    correctCount,
    incorrectCount: total - correctCount,
    accuracy: correctCount / total,
    averageReactionTimeMs: Math.round(avgTime),
    congruentAccuracy: 0,
    incongruentAccuracy: 0,
    averageCongruentTimeMs: 0,
    averageIncongruentTimeMs: 0,
  };
}

export function calculateDetailedResult(
  questions: StroopQuestion[],
  answers: StroopAnswer[]
): StroopResult {
  const total = answers.length;
  if (total === 0) {
    return {
      totalQuestions: 0,
      correctCount: 0,
      incorrectCount: 0,
      accuracy: 0,
      averageReactionTimeMs: 0,
      congruentAccuracy: 0,
      incongruentAccuracy: 0,
      averageCongruentTimeMs: 0,
      averageIncongruentTimeMs: 0,
    };
  }

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const avgTime =
    answers.reduce((sum, a) => sum + a.reactionTimeMs, 0) / total;

  const congruentAnswers = answers.filter((a) => {
    const q = questions.find((q) => q.id === a.questionId);
    return q?.isCongruent;
  });

  const incongruentAnswers = answers.filter((a) => {
    const q = questions.find((q) => q.id === a.questionId);
    return q && !q.isCongruent;
  });

  const congruentCorrect = congruentAnswers.filter((a) => a.isCorrect).length;
  const incongruentCorrect = incongruentAnswers.filter(
    (a) => a.isCorrect
  ).length;

  return {
    totalQuestions: total,
    correctCount,
    incorrectCount: total - correctCount,
    accuracy: correctCount / total,
    averageReactionTimeMs: Math.round(avgTime),
    congruentAccuracy:
      congruentAnswers.length > 0
        ? congruentCorrect / congruentAnswers.length
        : 0,
    incongruentAccuracy:
      incongruentAnswers.length > 0
        ? incongruentCorrect / incongruentAnswers.length
        : 0,
    averageCongruentTimeMs:
      congruentAnswers.length > 0
        ? Math.round(
            congruentAnswers.reduce((s, a) => s + a.reactionTimeMs, 0) /
              congruentAnswers.length
          )
        : 0,
    averageIncongruentTimeMs:
      incongruentAnswers.length > 0
        ? Math.round(
            incongruentAnswers.reduce((s, a) => s + a.reactionTimeMs, 0) /
              incongruentAnswers.length
          )
        : 0,
  };
}

export function createInitialState(): StroopGameState {
  return {
    phase: "idle",
    questions: [],
    answers: [],
    currentIndex: 0,
    startedAt: null,
    questionStartedAt: null,
  };
}

export function startGame(state: StroopGameState): StroopGameState {
  const now = Date.now();
  return {
    ...state,
    phase: "playing",
    questions: generateQuestions(STROOP_CONFIG.totalRounds),
    answers: [],
    currentIndex: 0,
    startedAt: now,
    questionStartedAt: now,
  };
}

export function submitAnswer(
  state: StroopGameState,
  selectedColor: StroopColor
): StroopGameState {
  if (state.phase !== "playing" || state.currentIndex >= state.questions.length) {
    return state;
  }

  const question = state.questions[state.currentIndex];
  const now = Date.now();
  const reactionTime =
    state.questionStartedAt !== null ? now - state.questionStartedAt : 0;

  const answer = validateAnswer(question, selectedColor, reactionTime);
  const nextIndex = state.currentIndex + 1;
  const isEnded = nextIndex >= state.questions.length;

  return {
    ...state,
    answers: [...state.answers, answer],
    currentIndex: nextIndex,
    phase: isEnded ? "ended" : "playing",
    questionStartedAt: isEnded ? null : now,
  };
}
