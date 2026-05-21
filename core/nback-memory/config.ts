import type { NBackStimulusType } from "./types";

export const NBACK_CONFIG = {
  defaultN: 1,
  minN: 1,
  maxN: 4,
  totalTrials: 20,
  matchRatio: 0.3,
  stimulusDurationMs: 500,
  interStimulusIntervalMs: 2500,
  postResponseDelayMs: 500,
  stimulusTypes: ["position"] as NBackStimulusType[],
  positions: 9,
  colors: ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7"],
  letters: "ABCDEFGHJKLMNPQRSTUVWXYZ".split(""),
} as const;
