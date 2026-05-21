"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Lock, ArrowRight, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRecords } from "@/lib/storage";
import { generateCognitiveReport, type CognitiveReport, type DimensionScore } from "@/lib/cognitive-report";
import { RadarChart } from "./radar-chart";
import { PercentileBar } from "./percentile-bar";
import { ScoreCounter } from "./score-counter";
import { ShareButton } from "@/components/share/share-dialog";

const UNLOCK_KEY = "bs_report_unlocked";

function isUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(UNLOCK_KEY) === "true";
}

function setUnlocked(value: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(UNLOCK_KEY, String(value));
}

interface ReportClientProps {
  initialReport: CognitiveReport | null;
}

export function ReportClient({ initialReport }: ReportClientProps) {
  const [report, setReport] = useState<CognitiveReport | null>(initialReport);
  const [unlocked, setUnlockedState] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  // 付费功能暂隐藏，等支付接入后再开启
  // useEffect(() => {
  //   setUnlockedState(isUnlocked());
  // }, []);

  useEffect(() => {
    // Re-generate report from latest data on mount
    const records = getRecords();
    const fresh = generateCognitiveReport(records);
    setReport(fresh);
  }, []);

  const handleUnlock = () => {
    // Simulate payment — in production this would integrate with a payment provider
    setUnlocked(true);
    setUnlockedState(true);
    setShowPaywall(false);
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[rgba(212,132,124,0.08)] border border-[rgba(212,132,124,0.12)] flex items-center justify-center">
            <Brain className="w-7 h-7 text-[#D4847C]" />
          </div>
          <h1 className="font-serif text-xl font-bold text-[#3D2B1F] mb-2">
            还没有足够的训练数据
          </h1>
          <p className="text-sm text-[#8B7E74] mb-6 max-w-xs mx-auto">
            完成 2–3 个认知训练游戏后，即可生成你的专属评估报告。
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D4847C] hover:text-[#C4746C] transition-colors"
          >
            去首页选择游戏
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  const dimensions = report.dimensions;
  const topDimension = [...dimensions].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[rgba(212,132,124,0.08)] text-[#D4847C] border border-[rgba(212,132,124,0.12)] mb-3">
            <Sparkles className="w-3 h-3" />
            认知能力评估
          </div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#3D2B1F] mb-1">
            你的大脑能力报告
          </h1>
          <p className="text-xs text-[#8B7E74]">
            基于 {dimensions.length} 项认知维度评估
          </p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block">
            <ScoreCounter
              target={report.overallScore}
              className="font-serif text-6xl sm:text-7xl font-bold text-[#3D2B1F]"
            />
            <span className="text-xl text-[#8B7E74] font-medium ml-1">分</span>
          </div>
          <p className="text-sm text-[#8B7E74] mt-1 max-w-xs mx-auto leading-relaxed">
            {report.summary}
          </p>
          <div className="mt-4">
            <ShareButton
              data={{
                type: "report",
                overallScore: report.overallScore,
                dimensionScores: report.dimensions.map((d) => ({
                  label: d.label,
                  score: d.score,
                  color: d.color,
                })),
                summary: report.summary,
              }}
              filename="brain-sanage-report.png"
            />
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-2xl border border-[#EDE5DB] p-4 sm:p-6 shadow-sm">
            <RadarChart dimensions={dimensions} size={260} />
          </div>
        </motion.div>

        {/* Dimension Scores — always visible (free) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="font-serif text-sm font-bold text-[#3D2B1F] mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#D4847C]" />
            维度得分
          </h2>
          <div className="bg-white rounded-2xl border border-[#EDE5DB] p-4 shadow-sm space-y-4">
            {dimensions.map((dim) => (
              <PercentileBar
                key={dim.dimension}
                label={dim.label}
                score={dim.score}
                color={dim.color}
              />
            ))}
          </div>
        </motion.div>

        {/* Premium content — paywalled */}
        <div className="relative overflow-hidden">
          {!unlocked && (
            <>
              {/* Blur overlay */}
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#FDF8F3]/40 via-[#FDF8F3]/85 to-[#FDF8F3] pointer-events-none" />
              {/* Unlock CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="sticky bottom-4 z-20 mx-2"
              >
                <div className="bg-white rounded-2xl border border-[#EDE5DB] shadow-lg p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-[rgba(212,132,124,0.08)] border border-[rgba(212,132,124,0.12)] flex items-center justify-center">
                    <Lock className="w-4 h-4 text-[#D4847C]" />
                  </div>
                  <p className="text-sm font-bold text-[#3D2B1F] mb-1">
                    解锁完整报告
                  </p>
                  <p className="text-xs text-[#8B7E74] mb-3">
                    同龄人深度对比 · 个性化训练方案 · PDF 导出
                  </p>
                  <Button
                    onClick={handleUnlock}
                    className="w-full bg-[#3D2B1F] hover:bg-[#2D1B0F] text-white rounded-xl text-sm font-medium h-11"
                  >
                    9.9 元解锁完整报告
                  </Button>
                  <p className="text-[10px] text-[#B5A99A] mt-2">
                    模拟付费流程 · 真实支付后续接入
                  </p>
                </div>
              </motion.div>
            </>
          )}

          {/* Deep Analysis — blurred when locked */}
          <div className={!unlocked ? "blur-[2px] select-none pb-24" : ""}>
            {/* Strengths & Weaknesses */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mb-6"
            >
              <h2 className="font-serif text-sm font-bold text-[#3D2B1F] mb-3">
                能力解析
              </h2>
              <div className="grid gap-3">
                {report.strengths.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#EDE5DB] p-4 shadow-sm">
                    <p className="text-xs font-medium text-[#4AAD7A] mb-2">
                      优势领域
                    </p>
                    <ul className="space-y-1.5">
                      {report.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="text-sm text-[#3D2B1F] flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4AAD7A] mt-1.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.weaknesses.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#EDE5DB] p-4 shadow-sm">
                    <p className="text-xs font-medium text-[#D4847C] mb-2">
                      提升空间
                    </p>
                    <ul className="space-y-1.5">
                      {report.weaknesses.map((w, i) => (
                        <li
                          key={i}
                          className="text-sm text-[#3D2B1F] flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4847C] mt-1.5 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Per-dimension deep dive */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-6"
            >
              <h2 className="font-serif text-sm font-bold text-[#3D2B1F] mb-3">
                维度详解
              </h2>
              <div className="space-y-3">
                {dimensions.map((dim) => (
                  <DimensionCard key={dim.dimension} dim={dim} />
                ))}
              </div>
            </motion.div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="mb-8"
              >
                <h2 className="font-serif text-sm font-bold text-[#3D2B1F] mb-3">
                  训练建议
                </h2>
                <div className="space-y-3">
                  {report.recommendations.map((rec, i) => (
                    <a
                      key={i}
                      href={`/${rec.gameId}`}
                      className="block bg-white rounded-2xl border border-[#EDE5DB] p-4 shadow-sm hover:shadow-md hover:border-[#DDD5CC] transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: `${rec.dimension === "attention" ? "#5A9DE0" : rec.dimension === "memory" ? "#A87AD4" : rec.dimension === "processingSpeed" ? "#D4A832" : rec.dimension === "executiveFunction" ? "#D4847C" : "#6BA7A8"}14`,
                          }}
                        >
                          <Target className="w-4 h-4" style={{ color: rec.dimension === "attention" ? "#5A9DE0" : rec.dimension === "memory" ? "#A87AD4" : rec.dimension === "processingSpeed" ? "#D4A832" : rec.dimension === "executiveFunction" ? "#D4847C" : "#6BA7A8" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#3D2B1F] break-words leading-snug">
                            {rec.gameTitle}
                          </p>
                          <p className="text-xs text-[#8B7E74] mt-0.5 break-words leading-relaxed">
                            {rec.reason}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#B5A99A] shrink-0 mt-1" />
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-[10px] text-[#B5A99A]">
            Brain Sanage · 科学认知训练 · 数据基于经典心理学实验范式
          </p>
        </div>
      </div>
    </div>
  );
}

function DimensionCard({ dim }: { dim: DimensionScore }) {
  const [expanded, setExpanded] = useState(false);

  const interpretations = [
    {
      min: 85,
      title: "表现卓越",
      text: `你的${dim.label}表现优于绝大多数同龄人。这一优势有助于你在需要高度${dim.label.includes("注意") ? "专注" : dim.label.includes("记忆") ? "记忆" : dim.label.includes("速度") ? "快速反应" : dim.label.includes("执行") ? "灵活决策" : "情绪管理"}的任务中脱颖而出。`,
    },
    {
      min: 65,
      title: "表现良好",
      text: `你的${dim.label}处于中上水平，能够胜任大多数日常任务。通过针对性训练，仍有进一步提升的空间。`,
    },
    {
      min: 45,
      title: "平均水平",
      text: `你的${dim.label}与同龄人大致相当，属于正常范围。如果这一能力对你的学习或工作特别重要，建议投入时间进行系统训练。`,
    },
    {
      min: 0,
      title: "需要关注",
      text: `你的${dim.label}低于平均水平，这可能影响你在相关任务中的表现。好消息是，认知能力具有可塑性，持续训练可以带来显著改善。`,
    },
  ];

  const interp = interpretations.find((i) => dim.score >= i.min) || interpretations[3];

  return (
    <div className="bg-white rounded-2xl border border-[#EDE5DB] p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: dim.color }}
          />
          <span className="text-sm font-bold text-[#3D2B1F]">{dim.label}</span>
        </div>
        <span className="text-sm font-bold" style={{ color: dim.color }}>
          {dim.score}%
        </span>
      </div>
      <p className="text-xs text-[#8B7E74] mb-2">{dim.description}</p>
      <div className="bg-[#FAF7F4] rounded-xl p-3">
        <p className="text-xs font-medium text-[#3D2B1F] mb-1">
          {interp.title}
        </p>
        <p className="text-xs text-[#8B7E74] leading-relaxed">{interp.text}</p>
      </div>
    </div>
  );
}
