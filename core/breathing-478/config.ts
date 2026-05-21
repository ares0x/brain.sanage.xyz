export const BREATHING_478_CONFIG = {
  // Durations in milliseconds
  inhaleMs: 4000,
  holdMs: 7000,
  exhaleMs: 8000,
  // Total cycle = 4 + 7 + 8 = 19 seconds
  defaultRounds: 4,
  roundOptions: [1, 2, 3, 4, 5, 6, 7, 8] as const,
} as const;
