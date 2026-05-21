export type StroopColor = "red" | "green" | "blue" | "yellow" | "purple";

export interface StroopColorDef {
  key: StroopColor;
  label: string;
  hex: string;
  tailwindClass: string;
}

export interface StroopQuestion {
  id: number;
  word: StroopColor;
  ink: StroopColor;
  isCongruent: boolean;
}

export interface StroopAnswer {
  questionId: number;
  selectedColor: StroopColor;
  correctColor: StroopColor;
  isCorrect: boolean;
  reactionTimeMs: number;
}

export type StroopGamePhase = "idle" | "playing" | "ended";

export interface StroopGameState {
  phase: StroopGamePhase;
  questions: StroopQuestion[];
  answers: StroopAnswer[];
  currentIndex: number;
  startedAt: number | null;
  questionStartedAt: number | null;
}

export interface StroopResult {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  averageReactionTimeMs: number;
  congruentAccuracy: number;
  incongruentAccuracy: number;
  averageCongruentTimeMs: number;
  averageIncongruentTimeMs: number;
}
