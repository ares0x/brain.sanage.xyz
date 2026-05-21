"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Flame,
  Check,
  Circle,
  Zap,
  Target,
  Brain,
  BrainCircuit,
  Grid3X3,
  MemoryStick,
  Wind,
  Gauge,
  ArrowRight,
  Sparkles,
  Calendar,
  Eye,
  TrendingUp,
  Shield,
} from "lucide-react";
import { getTodayPlan, getStreak, recordCompletion, getAbilityTrend, hasTrainingData } from "@/lib/training";
import type { DailyPlan, StreakData } from "@/lib/training";
import { GAMES_META } from "@/config/games";

const ICON_MAP: Record<string, React.ElementType> = {
  Gauge,
  Target,
  Brain,
  BrainCircuit,
  Grid3X3,
  MemoryStick,
  Wind,
  Zap,
  Eye,
};

function getIcon(name: string): React.ElementType {
  return ICON_MAP[name] || Zap;
}

export function DailyPlanCard() {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [abilityTrend, setAbilityTrend] = useState<{
    label: string;
    changePercent: number;
  } | null>(null);
  const [hasData, setHasData] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const p = getTodayPlan();
    const s = getStreak();
    const trend = getAbilityTrend();
    setPlan(p);
    setStreak(s);
    setAbilityTrend(trend);
    setHasData(hasTrainingData());

    // If all tasks are completed but streak not recorded, record it
    if (p?.allCompleted && s && !s.history[p.date]) {
      const updated = recordCompletion();
      setStreak(updated);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl border border-border p-4 shadow-sm animate-pulse h-40" />
    );
  }

  if (!plan || plan.tasks.length === 0) {
    return null;
  }

  const completedCount = plan.tasks.filter((t) => t.completed).length;
  const totalCount = plan.tasks.length;
  const allDone = completedCount === totalCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl border border-border p-5 shadow-sm mb-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[rgba(212,168,50,0.1)] border border-[rgba(212,168,50,0.15)] flex items-center justify-center">
            <Calendar className="w-4.5 h-4.5 text-[#D4A832]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-foreground">
              今日训练计划
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {allDone
                ? "今日目标已达成 🎉"
                : `已完成 ${completedCount}/${totalCount} 项`}
            </p>
          </div>
        </div>

        {streak && streak.currentStreak > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/8 border border-primary/15">
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">
              连续 {streak.currentStreak} 天
            </span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-4">
        {streak && (
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-background-soft border border-border">
            <Flame className={`w-4 h-4 ${streak.currentStreak > 0 ? "text-primary" : "text-muted-secondary"}`} />
            <div>
              <p className="text-[10px] text-muted-foreground">连续训练</p>
              <p className="text-sm font-bold text-foreground">{streak.currentStreak} 天</p>
            </div>
          </div>
        )}
        {abilityTrend ? (
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#E1F5EE] border border-[rgba(74,173,122,0.12)]">
            <TrendingUp className="w-4 h-4 text-[#4AAD7A]" />
            <div>
              <p className="text-[10px] text-[#6B9E8A]">{abilityTrend.label}</p>
              <p className="text-sm font-bold text-[#4AAD7A]">较上周 +{abilityTrend.changePercent}%</p>
            </div>
          </div>
        ) : hasData ? (
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#E6F1FB] border border-[rgba(90,157,224,0.12)]">
            <TrendingUp className="w-4 h-4 text-[#5A9DE0]" />
            <div>
              <p className="text-[10px] text-[#5A9DE0]">能力变化</p>
              <p className="text-sm font-bold text-[#0C447C]">持续训练中</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#E6F1FB] border border-[rgba(90,157,224,0.12)]">
            <Shield className="w-4 h-4 text-[#5A9DE0]" />
            <div>
              <p className="text-[10px] text-[#5A9DE0]">能力变化</p>
              <p className="text-sm font-bold text-[#0C447C]">开始训练建立基线</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {!allDone && (
        <div className="h-1.5 bg-[#F5F0EB] rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full rounded-full bg-[#D4A832]"
            initial={{ width: 0 }}
            animate={{
              width: `${(completedCount / totalCount) * 100}%`,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        <AnimatePresence>
          {plan.tasks.map((task, index) => {
            const gameMeta = GAMES_META[task.gameId];
            const Icon = gameMeta ? gameMeta.icon : getIcon(task.gameIcon);
            return (
              <motion.div
                key={task.gameId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                {task.completed ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background-soft">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#4AAD7A]/10">
                      <Check className="w-4 h-4 text-[#4AAD7A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground line-through">
                        {task.gameTitle}
                      </p>
                      <p className="text-[10px] text-muted-secondary">
                        {task.reason}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#4AAD7A] font-medium">
                      已完成
                    </span>
                  </div>
                ) : (
                  <Link
                    href={`/${task.gameId}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-background-soft hover:bg-accent-hover transition-colors group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${task.gameColor}14`,
                      }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: task.gameColor }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {task.gameTitle}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {task.reason} · 约 {task.estimatedMinutes} 分钟
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-secondary group-hover:text-muted-foreground transition-colors" />
                  </Link>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Completion celebration */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 pt-3 border-t border-border text-center"
          >
            <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-[#4AAD7A]">
              <Sparkles className="w-4 h-4" />
              {streak && streak.currentStreak >= 3
                ? `太棒了！连续 ${streak.currentStreak} 天打卡`
                : "今日训练完成！"}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              坚持训练，认知能力会持续提升
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
