export const ATTENTION_CONFIG = {
  maxDurationMs: 60000, // 60 seconds max
  dotRadius: 0.08, // 8% of container
  fingerTolerance: 0.10, // extra tolerance for finger hit area
  baseSpeed: 0.15, // % per second
  speedIncreasePerSecond: 0.02, // speed increases over time
  // Level thresholds (seconds)
  levelTable: [
    { seconds: 45, level: "专注大师", description: "你的持续注意力堪比专业运动员", percentile: 95 },
    { seconds: 30, level: "高度专注", description: "注意力稳定性非常出色", percentile: 80 },
    { seconds: 20, level: "良好专注", description: "大多数人的正常水平", percentile: 60 },
    { seconds: 10, level: "需要练习", description: "多训练可以提升持续注意能力", percentile: 35 },
    { seconds: 0, level: "入门阶段", description: "持续注意是一项可训练的能力", percentile: 10 },
  ],
} as const;
