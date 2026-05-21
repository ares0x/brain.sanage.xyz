"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Trophy,
  Clock,
  Calendar,
  TrendingUp,
  Gamepad2,
  History,
  Zap,
  Target,
  MemoryStick,
  Wind,
  Grid3X3,
  Gauge,
  BrainCircuit,
  ArrowRight,
  Shield,
  Download,
  X,
  Flame,
  Star,
  Crown,
  Medal,
  Gem,
  Award,
  Eye,
} from "lucide-react";
import { CommunityCard } from "@/components/game/community-card";
import { exportData } from "@/lib/storage";
import type { GameRecord, GameStats } from "@/lib/storage";
import type { CognitiveReport, DimensionScore } from "@/lib/cognitive-report";
import { TrendChart } from "./trend-chart";
import type { StreakData, AchievementIcon } from "@/lib/achievements";
import { calculateStreak, checkAchievements, getAchievementsStatus, getUnlockedCount } from "@/lib/achievements";

const GAME_ICONS: Record<string, React.ElementType> = {
  "reaction-time": Gauge,
  "attention-span": Target,
  flanker: Target,
  "task-switching": BrainCircuit,
  "stroop-test": Brain,
  "schulte-grid": Grid3X3,
  "nback-memory": MemoryStick,
  "digit-span": BrainCircuit,
  "breathing-478": Wind,
  "go-nogo": Shield,
  "focus-gaze": Eye,
};

const GAME_NAMES: Record<string, string> = {
  "reaction-time": "反应速度测试",
  "attention-span": "专注力追踪",
  flanker: "Flanker 任务",
  "task-switching": "任务切换",
  "stroop-test": "斯特鲁普测试",
  "schulte-grid": "舒尔特方格",
  "nback-memory": "N-Back 记忆",
  "digit-span": "数字广度",
  "breathing-478": "4-7-8 呼吸法",
  "go-nogo": "Go / No-Go",
  "focus-gaze": "凝视启动",
};

const GAME_COLORS: Record<string, string> = {
  "reaction-time": "#D4A832",
  "attention-span": "#8FB8A8",
  flanker: "#5A9DE0",
  "task-switching": "#A87AD4",
  "stroop-test": "#D4847C",
  "schulte-grid": "#5A9DE0",
  "nback-memory": "#A87AD4",
  "digit-span": "#9B7BC7",
  "breathing-478": "#6BA7A8",
  "go-nogo": "#D4847C",
  "focus-gaze": "#D4A832",
};

export function ProfileClient() {
  const [showTip, setShowTip] = useState(true);
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [stats, setStats] = useState<GameStats[]>([]);
  const [report, setReport] = useState<CognitiveReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastTrainingDate: null });
  const [achievementCount, setAchievementCount] = useState({ unlocked: 0, total: 0 });

  useEffect(() => {
    // Import inside useEffect to ensure client-side execution
    Promise.all([
      import("@/lib/storage"),
      import("@/lib/cognitive-report"),
    ]).then(([storageMod, reportMod]) => {
      const r = storageMod.getRecords();
      const s = storageMod.getAllGameStats();
      const rep = reportMod.generateCognitiveReport(r);
      const st = calculateStreak(r);
      checkAchievements(r);
      setRecords(r);
      setStats(s);
      setReport(rep);
      setStreak(st);
      setAchievementCount(getUnlockedCount());
      setLoading(false);
    });
  }, []);

  const overview = useMemo(() => {
    const totalSessions = records.length;
    const totalDurationMs = records.reduce((s, r) => s + (r.durationMs || 0), 0);
    const totalMinutes = Math.round(totalDurationMs / 60000);
    const lastActivity = records.length > 0
      ? Math.max(...records.map((r) => r.timestamp))
      : null;

    const bestGame = stats
      .filter((s) => s.bestScore !== null)
      .sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0))[0];

    return { totalSessions, totalMinutes, lastActivity, bestGame };
  }, [records, stats]);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brain-sanage-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[rgba(212,132,124,0.08)] border border-[rgba(212,132,124,0.12)] flex items-center justify-center animate-pulse">
            <Brain className="w-7 h-7 text-[#D4847C]" />
          </div>
          <p className="text-sm text-[#8B7E74]">正在加载训练数据...</p>
        </div>
      </div>
    );
  }

  const hasData = records.length > 0;

  if (!hasData) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[rgba(212,132,124,0.08)] border border-[rgba(212,132,124,0.12)] flex items-center justify-center">
            <Brain className="w-7 h-7 text-[#D4847C]" />
          </div>
          <h1 className="font-serif text-xl font-bold text-[#3D2B1F] mb-2">
            还没有训练记录
          </h1>
          <p className="text-sm text-[#8B7E74] mb-6 max-w-xs mx-auto">
            完成任意认知训练游戏后，你的个人档案就会在这里显示。
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D4847C] hover:text-[#C4746C] transition-colors"
          >
            去首页开始训练
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#3D2B1F] mb-1">
            你的认知档案
          </h1>
          <p className="text-xs text-[#8B7E74]">
            追踪训练进度，见证能力提升
          </p>
        </motion.div>

        {/* Data Persistence Tip */}
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-[#FFF9F0] border border-[#EDE5DB] rounded-xl p-3 flex items-start gap-2.5"
          >
            <Shield className="w-4 h-4 text-[#D4A832] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#5A4A3F] leading-relaxed">
                数据仅存储于本地浏览器，清除缓存或换设备时会丢失。
                建议定期导出备份。
              </p>
              <button
                onClick={handleExport}
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-[#D4847C] hover:text-[#C4746C] transition-colors"
              >
                <Download className="w-3 h-3" />
                导出备份
              </button>
            </div>
            <button
              onClick={() => setShowTip(false)}
              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[#F5F0EB] transition-colors shrink-0"
              aria-label="关闭提示"
            >
              <X className="w-3 h-3 text-[#B5A99A]" />
            </button>
          </motion.div>
        )}

        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <OverviewCard
            icon={Gamepad2}
            label="总训练次数"
            value={`${overview.totalSessions}次`}
            color="#5A9DE0"
          />
          <OverviewCard
            icon={Clock}
            label="总训练时长"
            value={`${overview.totalMinutes}分钟`}
            color="#8FB8A8"
          />
          <OverviewCard
            icon={Trophy}
            label="最佳表现"
            value={
              overview.bestGame
                ? `${GAME_NAMES[overview.bestGame.gameId] || ""} ${Math.round(
                    overview.bestGame.bestScore || 0
                  )}分`
                : "暂无"
            }
            color="#D4A832"
          />
          <OverviewCard
            icon={Flame}
            label="连续打卡"
            value={
              streak.currentStreak > 0
                ? `${streak.currentStreak} 天`
                : "暂无"
            }
            color="#D4847C"
          />
        </motion.div>

        {/* Ability Trend */}
        {report && report.dimensions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="font-serif text-sm font-bold text-[#3D2B1F] mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D4847C]" />
              当前能力评估
            </h2>
            <div className="bg-white rounded-2xl border border-[#EDE5DB] p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#8B7E74]">综合评分</span>
                <span className="font-serif text-2xl font-bold text-[#3D2B1F]">
                  {report.overallScore}
                </span>
              </div>
              <div className="space-y-2.5">
                {report.dimensions.map((dim) => (
                  <div key={dim.dimension}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: dim.color }}
                        />
                        <span className="text-xs text-[#3D2B1F]">
                          {dim.label}
                        </span>
                      </div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: dim.color }}
                      >
                        {dim.score}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#F5F0EB] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${dim.score}%`,
                          backgroundColor: dim.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="mb-6"
        >
          <h2 className="font-serif text-sm font-bold text-[#3D2B1F] mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#D4847C]" />
            能力变化趋势
          </h2>
          <div className="bg-white rounded-2xl border border-[#EDE5DB] p-4 shadow-sm">
            <TrendChart records={records} />
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mb-6"
        >
          <h2 className="font-serif text-sm font-bold text-[#3D2B1F] mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#D4847C]" />
            成就徽章
            <span className="ml-auto text-xs font-normal text-[#B5A99A]">
              {achievementCount.unlocked} / {achievementCount.total}
            </span>
          </h2>
          <div className="bg-white rounded-2xl border border-[#EDE5DB] p-4 shadow-sm">
            <AchievementsGrid />
          </div>
        </motion.div>

        {/* Activity Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-6"
        >
          <h2 className="font-serif text-sm font-bold text-[#3D2B1F] mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D4847C]" />
            训练日历
          </h2>
          <div className="bg-white rounded-2xl border border-[#EDE5DB] p-4 shadow-sm">
            <ActivityHeatmap records={records} />
          </div>
        </motion.div>

        {/* Game Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="font-serif text-sm font-bold text-[#3D2B1F] mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#D4847C]" />
            游戏表现
          </h2>
          <div className="bg-white rounded-2xl border border-[#EDE5DB] p-4 shadow-sm space-y-3">
            {stats
              .filter((s) => s.totalSessions > 0)
              .sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0))
              .map((stat) => {
                const Icon =
                  GAME_ICONS[stat.gameId] || Gamepad2;
                const color = GAME_COLORS[stat.gameId] || "#D4847C";
                return (
                  <div
                    key={stat.gameId}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: `${color}14`,
                        border: `1px solid ${color}22`,
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#3D2B1F]">
                          {GAME_NAMES[stat.gameId] || stat.gameId}
                        </span>
                        <span
                          className="text-sm font-bold"
                          style={{ color }}
                        >
                          {stat.bestScore !== null
                            ? Math.round(stat.bestScore)
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#B5A99A]">
                        <span>{stat.totalSessions} 次训练</span>
                        {stat.averageScore !== null && (
                          <>
                            <span>·</span>
                            <span>
                              平均 {Math.round(stat.averageScore)} 分
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>

        {/* Community */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.36 }}
          className="mb-6"
        >
          <CommunityCard />
        </motion.div>

        {/* Recent Records */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
          className="mb-8"
        >
          <h2 className="font-serif text-sm font-bold text-[#3D2B1F] mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-[#D4847C]" />
            最近训练
          </h2>
          <div className="bg-white rounded-2xl border border-[#EDE5DB] p-4 shadow-sm space-y-2">
            {records.slice(0, 10).map((record) => {
              const Icon = GAME_ICONS[record.gameId] || Gamepad2;
              const color = GAME_COLORS[record.gameId] || "#D4847C";
              const result = record.result as Record<string, unknown> | undefined;
              const score =
                typeof result?.percentile === "number"
                  ? result.percentile
                  : typeof result?.accuracy === "number"
                  ? Math.round(result.accuracy * 100)
                  : typeof result?.dPrime === "number"
                  ? Math.round(result.dPrime * 33.3)
                  : null;

              return (
                <div
                  key={record.id}
                  className="flex items-center gap-3 py-2 border-b border-[#F5F0EB] last:border-0"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: `${color}10`,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-[#3D2B1F]">
                      {GAME_NAMES[record.gameId] || record.gameId}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    {score !== null && (
                      <span
                        className="text-sm font-bold"
                        style={{ color }}
                      >
                        {Math.round(score)}分
                      </span>
                    )}
                    <p className="text-[10px] text-[#B5A99A]">
                      {formatDate(record.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------------

function OverviewCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#EDE5DB] p-4 shadow-sm">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
        style={{
          background: `${color}10`,
        }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p className="text-xs text-[#8B7E74] mb-0.5">{label}</p>
      <p className="text-sm font-bold text-[#3D2B1F] truncate">{value}</p>
    </div>
  );
}

function ActivityHeatmap({ records }: { records: GameRecord[] }) {
  // Build a map of date -> count
  const dayMap = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const r of records) {
    const d = new Date(r.timestamp);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().split("T")[0];
    dayMap.set(key, (dayMap.get(key) || 0) + 1);
  }

  // Generate last 91 days (13 weeks)
  const weeks: { days: { date: Date; count: number }[] }[] = [];
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 90);

  // Align to Sunday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  let currentWeek: { days: { date: Date; count: number }[] } = { days: [] };
  const iter = new Date(startDate);

  while (iter <= today) {
    const key = iter.toISOString().split("T")[0];
    const count = dayMap.get(key) || 0;
    currentWeek.days.push({ date: new Date(iter), count });

    if (iter.getDay() === 6) {
      weeks.push(currentWeek);
      currentWeek = { days: [] };
    }

    iter.setDate(iter.getDate() + 1);
  }

  if (currentWeek.days.length > 0) {
    weeks.push(currentWeek);
  }

  const maxCount = Math.max(1, ...Array.from(dayMap.values()));

  function intensity(count: number): string {
    if (count === 0) return "#F5F0EB";
    const ratio = count / maxCount;
    if (ratio <= 0.25) return "#D4847C22";
    if (ratio <= 0.5) return "#D4847C44";
    if (ratio <= 0.75) return "#D4847C77";
    return "#D4847C";
  }

  const dayLabels = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div>
      {/* Month labels */}
      <div className="flex gap-1 mb-1 ml-5">
        {weeks.map((week, wi) => {
          const firstDay = week.days[0];
          if (!firstDay) return null;
          const isFirstOfMonth = firstDay.date.getDate() <= 7;
          return (
            <div key={wi} className="flex-1 min-w-[14px]">
              {isFirstOfMonth && (
                <span className="text-[9px] text-[#B5A99A]">
                  {firstDay.date.getMonth() + 1}月
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {dayLabels.map((d, i) => (
            <div
              key={i}
              className="w-3 h-3 flex items-center justify-center text-[8px] text-[#B5A99A]"
            >
              {i % 2 === 0 ? d : ""}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.days.map((day, di) => (
                <div
                  key={di}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: intensity(day.count) }}
                  title={`${day.date.toLocaleDateString("zh-CN")} · ${day.count} 次训练`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[9px] text-[#B5A99A]">少</span>
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{
              backgroundColor:
                r === 0 ? "#F5F0EB" : `rgba(212, 132, 124, ${Math.max(0.15, r)})`,
            }}
          />
        ))}
        <span className="text-[9px] text-[#B5A99A]">多</span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Achievements
// ------------------------------------------------------------------

const ACHIEVEMENT_ICON_MAP: Record<AchievementIcon, React.ElementType> = {
  flame: Flame,
  zap: Zap,
  target: Target,
  brain: Brain,
  trophy: Trophy,
  star: Star,
  crown: Crown,
  medal: Medal,
  gem: Gem,
  award: Award,
};

const TIER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  bronze: { bg: "#CD7F3215", border: "#CD7F3233", text: "#CD7F32" },
  silver: { bg: "#C0C0C015", border: "#C0C0C033", text: "#8A8A8A" },
  gold: { bg: "#FFD70015", border: "#FFD70033", text: "#D4A832" },
  platinum: { bg: "#E5E4E215", border: "#E5E4E233", text: "#7B8794" },
};

function AchievementsGrid() {
  const [status, setStatus] = useState<ReturnType<typeof getAchievementsStatus>>([]);

  useEffect(() => {
    setStatus(getAchievementsStatus());
  }, []);

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {status.map(({ achievement, unlocked }) => {
        const Icon = ACHIEVEMENT_ICON_MAP[achievement.icon];
        const tierColor = TIER_COLORS[achievement.tier];
        return (
          <div
            key={achievement.id}
            className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
              unlocked
                ? "bg-white shadow-sm"
                : "bg-[#FAF7F4] border-[#F0E9E0] opacity-50"
            }`}
            style={unlocked ? { borderColor: tierColor.border } : undefined}
            title={`${achievement.title}: ${achievement.description}`}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: unlocked ? tierColor.bg : "#F5F0EB",
              }}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: unlocked ? tierColor.text : "#B5A99A" }}
              />
            </div>
            <span
              className="text-[10px] font-medium text-center leading-tight"
              style={{ color: unlocked ? "#3D2B1F" : "#B5A99A" }}
            >
              {achievement.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------
// Utilities
// ------------------------------------------------------------------

function formatRelativeDate(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 周前`;
  return `${Math.floor(days / 30)} 个月前`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
}
