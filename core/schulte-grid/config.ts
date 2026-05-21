import type { GridSize, TimedDuration } from "./types";

export const SCHULTE_CONFIG = {
  defaultSize: 5 as GridSize,
  sizes: [3, 4, 5, 6, 7] as GridSize[],
  defaultMode: "classic" as const,
  timedDurations: [30, 60] as TimedDuration[],
  defaultTimedDuration: 30 as TimedDuration,
} as const;
