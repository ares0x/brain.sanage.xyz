export const GO_NOGO_CONFIG = {
  totalTrials: 60,
  goRatio: 0.75,         // 75% go trials, 25% no-go
  stimulusDurationMs: 800, // stimulus visible for 800ms max
  minItiMs: 500,         // inter-trial interval minimum
  maxItiMs: 1000,        // inter-trial interval maximum
  responseWindowMs: 800, // must respond within 800ms for go trials

  // Percentile lookup based on overall accuracy
  percentileTable: [
    { accuracy: 95, percentile: 99 },
    { accuracy: 90, percentile: 90 },
    { accuracy: 85, percentile: 80 },
    { accuracy: 80, percentile: 70 },
    { accuracy: 75, percentile: 60 },
    { accuracy: 70, percentile: 50 },
    { accuracy: 65, percentile: 40 },
    { accuracy: 60, percentile: 30 },
    { accuracy: 55, percentile: 20 },
    { accuracy: 50, percentile: 10 },
  ],

  // Level descriptions
  levelTable: [
    { minAccuracy: 90, label: "抑制控制卓越" },
    { minAccuracy: 80, label: "抑制控制优秀" },
    { minAccuracy: 70, label: "抑制控制良好" },
    { minAccuracy: 60, label: "抑制控制一般" },
    { minAccuracy: 0, label: "需加强练习" },
  ],
} as const;
