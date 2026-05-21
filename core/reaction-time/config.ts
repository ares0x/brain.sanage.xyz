export const REACTION_TIME_CONFIG = {
  totalTrials: 5,
  minDelayMs: 2000,
  maxDelayMs: 5000,
  // Percentile lookup table (average reaction time ms -> percentile)
  // Based on typical human simple reaction time data
  percentileTable: [
    { ms: 150, percentile: 99 },
    { ms: 180, percentile: 95 },
    { ms: 200, percentile: 90 },
    { ms: 220, percentile: 80 },
    { ms: 250, percentile: 65 },
    { ms: 280, percentile: 50 },
    { ms: 320, percentile: 35 },
    { ms: 370, percentile: 20 },
    { ms: 450, percentile: 10 },
    { ms: 600, percentile: 5 },
  ],
  // Age mapping for "reaction age" concept
  ageTable: [
    { ms: 180, age: "18岁" },
    { ms: 210, age: "22岁" },
    { ms: 240, age: "26岁" },
    { ms: 280, age: "30岁" },
    { ms: 330, age: "35岁" },
    { ms: 400, age: "40岁" },
    { ms: 500, age: "50岁" },
    { ms: 700, age: "60岁+" },
  ],
} as const;
