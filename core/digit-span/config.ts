export const DIGIT_SPAN_CONFIG = {
  minLength: 3,
  maxLength: 9,
  trialsPerLength: 2, // 2 trials per length
  digitRange: [1, 9] as const,
  showDurationMs: 800,
  showIntervalMs: 400,
  levelTable: [
    { span: 9, level: "记忆大师", percentile: 98 },
    { span: 8, level: "超强记忆", percentile: 90 },
    { span: 7, level: "优秀记忆", percentile: 75 },
    { span: 6, level: "良好记忆", percentile: 55 },
    { span: 5, level: "平均记忆", percentile: 35 },
    { span: 4, level: "需要训练", percentile: 15 },
    { span: 3, level: "入门阶段", percentile: 5 },
  ],
} as const;
