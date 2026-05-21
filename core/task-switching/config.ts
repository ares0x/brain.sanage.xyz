export const TASK_SWITCHING_CONFIG = {
  totalTrials: 24,
  switchRatio: 0.35, // ~35% of non-first trials are rule switches
  minNumber: 1,
  maxNumber: 9,
} as const;
