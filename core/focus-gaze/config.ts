export const FOCUS_GAZE_CONFIG = {
  // Pre-gaze countdown in milliseconds
  countdownMs: 3000,
  // Duration options in seconds
  durationOptions: [30, 45, 60] as const,
  defaultDurationSec: 30,
  // Distraction threshold: if user touches screen during gazing, count as distraction
  maxDistractionsForPerfect: 0,
  maxDistractionsForGood: 2,
} as const;
