/**
 * Cognitive assessment scoring engine.
 *
 * Takes a collection of GameRecords and produces a 5-dimension cognitive
 * report with percentiles, summaries and recommendations.
 */

import type { GameRecord } from "@/lib/storage/types";
import type {
  CognitiveDimension,
  DimensionConfig,
  DimensionScore,
  CognitiveReport,
  Recommendation,
  ExtractedMetric,
} from "./types";
import { toPercentile } from "./norms";

// ------------------------------------------------------------------
// Dimension configuration
// ------------------------------------------------------------------

const DIMENSION_CONFIGS: DimensionConfig[] = [
  {
    dimension: "attention",
    label: "注意力",
    description: "持续注意、选择性注意与视觉搜索能力的综合表现",
    color: "#5A9DE0",
    gameWeights: [
      { gameId: "attention-span", weight: 4 },
      { gameId: "flanker", weight: 3 },
      { gameId: "schulte-grid", weight: 3 },
    ],
  },
  {
    dimension: "memory",
    label: "记忆力",
    description: "工作记忆容量与信息保持能力",
    color: "#A87AD4",
    gameWeights: [
      { gameId: "nback-memory", weight: 5 },
      { gameId: "digit-span", weight: 3 },
    ],
  },
  {
    dimension: "processingSpeed",
    label: "处理速度",
    description: "大脑接收刺激并作出反应的基础神经速度",
    color: "#D4A832",
    gameWeights: [{ gameId: "reaction-time", weight: 1 }],
  },
  {
    dimension: "executiveFunction",
    label: "执行功能",
    description: "认知灵活性、抑制控制与冲突解决能力",
    color: "#D4847C",
    gameWeights: [
      { gameId: "task-switching", weight: 4 },
      { gameId: "stroop-test", weight: 3 },
      { gameId: "go-nogo", weight: 4 },
    ],
  },
  {
    dimension: "emotionalRegulation",
    label: "情绪调节",
    description: "通过呼吸练习调节自主神经、缓解压力的能力",
    color: "#6BA7A8",
    gameWeights: [{ gameId: "breathing-478", weight: 1 }],
  },
];

// ------------------------------------------------------------------
// Metric extraction from raw game results
// ------------------------------------------------------------------

function extractMetric(record: GameRecord): ExtractedMetric | null {
  const r = record.result as Record<string, unknown> | undefined;
  if (!r) return null;

  switch (record.gameId) {
    case "reaction-time": {
      const p = r.percentile;
      if (typeof p === "number") {
        return { gameId: record.gameId, metric: "percentile", value: p };
      }
      return null;
    }
    case "nback-memory": {
      const d = r.dPrime;
      if (typeof d === "number") {
        return { gameId: record.gameId, metric: "dPrime", value: d };
      }
      return null;
    }
    case "stroop-test": {
      const a = r.accuracy;
      if (typeof a === "number") {
        return { gameId: record.gameId, metric: "accuracy", value: a };
      }
      return null;
    }
    case "flanker": {
      const a = r.accuracy;
      if (typeof a === "number") {
        return { gameId: record.gameId, metric: "accuracy", value: a };
      }
      return null;
    }
    case "attention-span": {
      const p = r.percentile;
      if (typeof p === "number") {
        return { gameId: record.gameId, metric: "percentile", value: p };
      }
      return null;
    }
    case "digit-span": {
      const p = r.percentile;
      if (typeof p === "number") {
        return { gameId: record.gameId, metric: "percentile", value: p };
      }
      return null;
    }
    case "schulte-grid": {
      const a = r.accuracy;
      if (typeof a === "number") {
        return { gameId: record.gameId, metric: "accuracy", value: a };
      }
      return null;
    }
    case "task-switching": {
      const a = r.accuracy;
      if (typeof a === "number") {
        return { gameId: record.gameId, metric: "accuracy", value: a };
      }
      return null;
    }
    case "breathing-478": {
      const total = r.totalRounds;
      const completed = r.completedRounds;
      if (
        typeof total === "number" &&
        typeof completed === "number" &&
        total > 0
      ) {
        return {
          gameId: record.gameId,
          metric: "completionRate",
          value: completed / total,
        };
      }
      return null;
    }
    case "go-nogo": {
      const p = r.percentile;
      if (typeof p === "number") {
        return { gameId: record.gameId, metric: "percentile", value: p };
      }
      const a = r.overallAccuracy;
      if (typeof a === "number") {
        return { gameId: record.gameId, metric: "accuracy", value: a / 100 };
      }
      return null;
    }
    case "focus-gaze": {
      const cr = r.completionRate;
      if (typeof cr === "number") {
        return {
          gameId: record.gameId,
          metric: "completionRate",
          value: cr,
        };
      }
      return null;
    }
    default:
      return null;
  }
}

// ------------------------------------------------------------------
// Score calculation
// ------------------------------------------------------------------

/**
 * Convert an extracted metric to a 0-100 score.
 *
 * For games that already provide a percentile we use it directly.
 * For others we map via the normative distribution.
 */
function metricToScore(metric: ExtractedMetric): number | null {
  if (metric.metric === "percentile") {
    return Math.round(metric.value);
  }

  const p = toPercentile(metric.gameId, metric.metric, metric.value);
  if (p === null) return null;
  return Math.round(p);
}

/**
 * Calculate a single dimension score from the relevant game records.
 *
 * Uses the most recent record per game (users may play the same game
 * multiple times — we always use the latest attempt for the report).
 */
function calculateDimensionScore(
  config: DimensionConfig,
  records: GameRecord[]
): DimensionScore | null {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const gw of config.gameWeights) {
    // Most recent record for this game
    const gameRecords = records
      .filter((r) => r.gameId === gw.gameId)
      .sort((a, b) => b.timestamp - a.timestamp);

    if (gameRecords.length === 0) continue;

    const latest = gameRecords[0];
    const metric = extractMetric(latest);
    if (!metric) continue;

    const score = metricToScore(metric);
    if (score === null) continue;

    weightedSum += score * gw.weight;
    totalWeight += gw.weight;
  }

  if (totalWeight === 0) return null;

  const rawScore = weightedSum / totalWeight;
  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  // Percentile for the dimension = the score itself (it is already
  // percentile-normalised via the per-game norms).
  return {
    dimension: config.dimension,
    label: config.label,
    score,
    percentile: score,
    description: config.description,
    color: config.color,
  };
}

// ------------------------------------------------------------------
// Report generation
// ------------------------------------------------------------------

function buildSummary(dimensions: DimensionScore[]): string {
  if (dimensions.length === 0) {
    return "还没有足够的训练数据。完成 2–3 个游戏后即可生成你的认知评估报告。";
  }

  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];

  if (top.score >= 80 && bottom.score >= 60) {
    return `你的整体认知表现非常优秀，${top.label}尤为突出，继续保持！`;
  }
  if (top.score >= 70) {
    return `你的${top.label}表现亮眼，${bottom.score < 50 ? `${bottom.label}还有提升空间，建议针对性训练。` : "各项能力较为均衡。"}`;
  }
  if (bottom.score < 40) {
    return `${bottom.label}是目前最需要关注的领域，通过系统训练可以获得明显改善。`;
  }
  return `你的认知能力处于正常水平，${top.label}相对较强，持续训练有助于全面提升。`;
}

function buildStrengths(dimensions: DimensionScore[]): string[] {
  return dimensions
    .filter((d) => d.score >= 65)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((d) => {
      if (d.score >= 85) return `${d.label}：优于绝大多数同龄人`;
      if (d.score >= 70) return `${d.label}：表现良好，高于平均水平`;
      return `${d.label}：处于中等偏上水平`;
    });
}

function buildWeaknesses(dimensions: DimensionScore[]): string[] {
  return dimensions
    .filter((d) => d.score < 60)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((d) => {
      if (d.score < 35) return `${d.label}：明显低于同龄平均水平，建议优先训练`;
      if (d.score < 50) return `${d.label}：有提升空间，针对性练习效果显著`;
      return `${d.label}：略低于平均，稍加练习即可改善`;
    });
}

const RECOMMENDATION_MAP: Record<
  CognitiveDimension,
  { gameId: string; gameTitle: string; reason: string }[]
> = {
  attention: [
    {
      gameId: "attention-span",
      gameTitle: "专注力追踪",
      reason: "通过持续追踪移动目标，强化注意稳定性",
    },
    {
      gameId: "schulte-grid",
      gameTitle: "舒尔特方格",
      reason: "扩大注意力广度，提升视觉搜索效率",
    },
    {
      gameId: "flanker",
      gameTitle: "Flanker 任务",
      reason: "在干扰中保持专注，训练选择性注意",
    },
  ],
  memory: [
    {
      gameId: "nback-memory",
      gameTitle: "N-Back 记忆",
      reason: "工作记忆的黄金标准训练方法",
    },
    {
      gameId: "digit-span",
      gameTitle: "数字广度",
      reason: "经典记忆容量测试，循序渐进扩展",
    },
  ],
  processingSpeed: [
    {
      gameId: "reaction-time",
      gameTitle: "反应速度测试",
      reason: "最直接的基础神经速度训练",
    },
    {
      gameId: "stroop-test",
      gameTitle: "斯特鲁普测试",
      reason: "在冲突情境下加快信息处理速度",
    },
  ],
  executiveFunction: [
    {
      gameId: "go-nogo",
      gameTitle: "Go / No-Go",
      reason: "直接训练抑制控制能力，减少冲动反应",
    },
    {
      gameId: "task-switching",
      gameTitle: "任务切换",
      reason: "灵活切换认知集，提升执行控制力",
    },
    {
      gameId: "stroop-test",
      gameTitle: "斯特鲁普测试",
      reason: "强化认知抑制，克服自动化反应",
    },
  ],
  emotionalRegulation: [
    {
      gameId: "breathing-478",
      gameTitle: "4-7-8 呼吸法",
      reason: "激活副交感神经，快速平复情绪",
    },
  ],
};

function buildRecommendations(
  dimensions: DimensionScore[]
): Recommendation[] {
  // Sort by lowest score first — prioritise weakest dimensions
  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  const recs: Recommendation[] = [];

  for (const dim of sorted) {
    const options = RECOMMENDATION_MAP[dim.dimension];
    if (!options || options.length === 0) continue;

    // Pick the first option for this dimension
    const opt = options[0];
    recs.push({
      dimension: dim.dimension,
      dimensionLabel: dim.label,
      gameId: opt.gameId as Recommendation["gameId"],
      gameTitle: opt.gameTitle,
      reason: opt.reason,
    });

    if (recs.length >= 3) break;
  }

  return recs;
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

/**
 * Generate a complete cognitive assessment report from game records.
 *
 * @param records  Game records (usually from getRecords() or a subset)
 * @returns        CognitiveReport or null if no usable data
 */
export function generateCognitiveReport(
  records: GameRecord[]
): CognitiveReport | null {
  const dimensionScores: DimensionScore[] = [];

  for (const config of DIMENSION_CONFIGS) {
    const score = calculateDimensionScore(config, records);
    if (score) {
      dimensionScores.push(score);
    }
  }

  if (dimensionScores.length === 0) {
    return null;
  }

  const overallScore = Math.round(
    dimensionScores.reduce((sum, d) => sum + d.score, 0) / dimensionScores.length
  );

  return {
    overallScore,
    generatedAt: new Date().toISOString(),
    dimensions: dimensionScores,
    summary: buildSummary(dimensionScores),
    strengths: buildStrengths(dimensionScores),
    weaknesses: buildWeaknesses(dimensionScores),
    recommendations: buildRecommendations(dimensionScores),
  };
}

/**
 * Quick check: do we have enough data to generate a meaningful report?
 * Requires at least 2 distinct cognitive dimensions.
 */
export function canGenerateReport(records: GameRecord[]): boolean {
  const report = generateCognitiveReport(records);
  return report !== null && report.dimensions.length >= 2;
}
