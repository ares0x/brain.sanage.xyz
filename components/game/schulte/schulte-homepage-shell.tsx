"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, RotateCcw, Grid3X3, Clock, Crosshair, MousePointer, Zap, Target } from "lucide-react";
import { GameShell } from "@/components/game/game-shell";
import { ResultItem } from "@/components/game/result-item";
import { RealWorldMapping } from "@/components/game/real-world-mapping";
import { CommunityCard } from "@/components/game/community-card";
import { useGameAnalytics } from "@/lib/analytics/use-game-analytics";
import { saveRecord } from "@/lib/storage";
import { ShareButton } from "@/components/share/share-dialog";
import { getGradeForMetric } from "@/lib/scoring/grade";
import { getPersonalComparison, getPersonalFeedback } from "@/lib/scoring/personal-progress";
import { getNormReferenceText } from "@/lib/scoring/norm-reference";
import { toPercentile } from "@/lib/cognitive-report/norms";
import type { Grade } from "@/lib/scoring/grade";
import type { PersonalComparison } from "@/lib/scoring/personal-progress";
import {
  createInitialState,
  startGame,
  validateClick,
  calculateResult,
  endGame,
} from "@/core/schulte-grid/engine";
import type { GridSize, SchulteGameState, SchulteResult, SchulteGameMode, TimedDuration } from "@/core/schulte-grid/types";
import { SCHULTE_CONFIG } from "@/core/schulte-grid/config";
import { cn } from "@/lib/utils";

const MODE_META: Record<SchulteGameMode, { label: string; desc: string }> = {
  classic: { label: "经典模式", desc: "按顺序点击，计时完成" },
  timed: { label: "限时挑战", desc: "限时内尽可能多点" },
};

const TIMED_DURATION_META: Record<TimedDuration, { label: string }> = {
  30: { label: "30 秒" },
  60: { label: "60 秒" },
};

export default function SchulteHomepageShell() {
  const [size, setSize] = useState<GridSize>(SCHULTE_CONFIG.defaultSize);
  const [mode, setMode] = useState<SchulteGameMode>(SCHULTE_CONFIG.defaultMode);
  const [timedDuration, setTimedDuration] = useState<TimedDuration>(SCHULTE_CONFIG.defaultTimedDuration);
  const [state, setState] = useState<SchulteGameState>(createInitialState);
  const [result, setResult] = useState<SchulteResult | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [comparison, setComparison] = useState<PersonalComparison | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [countdownMs, setCountdownMs] = useState(0);
  useGameAnalytics("schulte-grid", state.phase);

  const handleStart = useCallback(() => {
    const s = startGame(createInitialState(), size, mode, timedDuration);
    setState(s);
    setResult(null);
    setGrade(null);
    setComparison(null);
    setElapsedMs(0);
    if (mode === "timed") {
      setCountdownMs(timedDuration * 1000);
    }
  }, [size, mode, timedDuration]);

  const handleEndGame = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "playing") return prev;
      const ended = endGame(prev);
      const gameResult = calculateResult(ended);
      setResult(gameResult);
      const gradeMetric = gameResult.mode === "timed" ? "completedCount" : "accuracy";
      const gradeValue = gameResult.mode === "timed" ? gameResult.completedCount : gameResult.accuracy;
      const g = getGradeForMetric("schulte-grid", gradeMetric, gradeValue);
      setGrade(g);
      const record = saveRecord({
        gameId: "schulte-grid",
        timestamp: Date.now(),
        durationMs: ended.startedAt ? Date.now() - ended.startedAt : 0,
        result: gameResult,
      });
      const comp = getPersonalComparison("schulte-grid", record);
      setComparison(comp);
      return ended;
    });
  }, []);

  const handleCellClick = useCallback(
    (value: number) => {
      setState((prev) => {
        const { isCorrect, nextState } = validateClick(prev, value);
        if (nextState.phase === "ended") {
          const gameResult = calculateResult(nextState);
          setResult(gameResult);
          const gradeMetric = gameResult.mode === "timed" ? "completedCount" : "accuracy";
          const gradeValue = gameResult.mode === "timed" ? gameResult.completedCount : gameResult.accuracy;
          const g = getGradeForMetric("schulte-grid", gradeMetric, gradeValue);
          setGrade(g);
          const record = saveRecord({
            gameId: "schulte-grid",
            timestamp: Date.now(),
            durationMs: nextState.startedAt ? Date.now() - nextState.startedAt : 0,
            result: gameResult,
          });
          const comp = getPersonalComparison("schulte-grid", record);
          setComparison(comp);
        }
        return nextState;
      });
    },
    []
  );

  // Classic mode: elapsed timer
  useEffect(() => {
    if (state.phase !== "playing" || !state.startedAt || state.mode !== "classic") return;
    const id = setInterval(() => {
      setElapsedMs(Date.now() - state.startedAt!);
    }, 100);
    return () => clearInterval(id);
  }, [state.phase, state.startedAt, state.mode]);

  // Timed mode: countdown timer
  useEffect(() => {
    if (state.phase !== "playing" || !state.startedAt || state.mode !== "timed" || !state.timedDurationMs) return;
    const id = setInterval(() => {
      const remaining = state.timedDurationMs! - (Date.now() - state.startedAt!);
      if (remaining <= 0) {
        setCountdownMs(0);
        clearInterval(id);
        handleEndGame();
      } else {
        setCountdownMs(remaining);
      }
    }, 100);
    return () => clearInterval(id);
  }, [state.phase, state.startedAt, state.mode, state.timedDurationMs, handleEndGame]);

  const gridColsClass = {
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    7: "grid-cols-7",
  };

  const cellSizeClass = {
    3: "w-[72px] h-[72px] sm:w-20 sm:h-20 text-xl sm:text-2xl",
    4: "w-[56px] h-[56px] sm:w-[4.5rem] sm:h-[4.5rem] text-lg sm:text-xl",
    5: "w-[48px] h-[48px] sm:w-14 sm:h-14 text-base sm:text-lg",
    6: "w-[44px] h-[44px] sm:w-12 sm:h-12 text-sm sm:text-base",
    7: "w-[40px] h-[40px] sm:w-11 sm:h-11 text-xs sm:text-sm",
  };

  const formatTime = (ms: number) => {
    const sec = Math.floor(ms / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${sec}.${cs.toString().padStart(2, "0")}s`;
  };

  const formatCountdown = (ms: number) => {
    const sec = Math.floor(ms / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${sec}.${cs.toString().padStart(2, "0")}`;
  };

  return (
    <GameShell
      title="舒尔特方格"
      subtitle="注意力广度训练"
      icon={<Grid3X3 className="w-4 h-4" />}
      iconColor="#8FB8A8"
      headerAction={
        state.phase === "playing" && state.startedAt ? (
          <Badge variant="outline" className={cn(
            "font-mono text-xs border-[#EDE5DB] bg-white",
            state.mode === "timed" && countdownMs <= 5000 ? "text-[#D4847C]" : "text-[#D4847C]"
          )}>
            <Clock className="w-3 h-3 mr-1" />
            {state.mode === "classic"
              ? formatTime(elapsedMs)
              : formatCountdown(countdownMs)
            }
          </Badge>
        ) : undefined
      }
    >
      <AnimatePresence mode="wait">
        {state.phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-center space-y-5 py-5 sm:py-6"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#D4847C] to-[#C97B7B] flex items-center justify-center shadow-md">
              <Play className="w-6 h-6 text-white ml-0.5" />
            </div>

            {/* Mode Selector */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-[#B5A99A] uppercase tracking-wider">选择模式</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setMode("classic")}
                  className={cn(
                    "flex-1 max-w-[140px] px-3 py-2.5 rounded-xl text-xs font-medium transition-all border",
                    mode === "classic"
                      ? "bg-[#3D2B1F] text-white border-[#3D2B1F] shadow-sm"
                      : "bg-[#FAF7F4] text-[#3D2B1F] border-[#EDE5DB] hover:border-[#DDD5CC]"
                  )}
                >
                  <div className="font-bold">{MODE_META.classic.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">{MODE_META.classic.desc}</div>
                </button>
                <button
                  onClick={() => setMode("timed")}
                  className={cn(
                    "flex-1 max-w-[140px] px-3 py-2.5 rounded-xl text-xs font-medium transition-all border",
                    mode === "timed"
                      ? "bg-[#3D2B1F] text-white border-[#3D2B1F] shadow-sm"
                      : "bg-[#FAF7F4] text-[#3D2B1F] border-[#EDE5DB] hover:border-[#DDD5CC]"
                  )}
                >
                  <div className="font-bold">{MODE_META.timed.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">{MODE_META.timed.desc}</div>
                </button>
              </div>

              {/* Timed duration selector */}
              <AnimatePresence>
                {mode === "timed" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <span className="text-xs text-[#8B7E74]">限时</span>
                      <div className="flex gap-1.5">
                        {(SCHULTE_CONFIG.timedDurations as TimedDuration[]).map((d) => (
                          <button
                            key={d}
                            onClick={() => setTimedDuration(d)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                              timedDuration === d
                                ? "bg-[#D4847C] text-white border-[#D4847C]"
                                : "bg-white text-[#3D2B1F] border-[#EDE5DB] hover:border-[#DDD5CC]"
                            )}
                          >
                            {TIMED_DURATION_META[d].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-[#8B7E74]">网格大小</span>
              <Select value={String(size)} onValueChange={(v) => setSize(Number(v) as GridSize)}>
                <SelectTrigger className="w-24 bg-white border-[#EDE5DB] text-[#3D2B1F] rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#EDE5DB] rounded-xl">
                  {SCHULTE_CONFIG.sizes.map((s) => (
                    <SelectItem key={s} value={String(s)} className="text-[#3D2B1F] focus:bg-[#F5EDE5] focus:text-[#3D2B1F] rounded-lg">
                      {s} × {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <p className="text-[#5A4A3F] text-sm">
                {mode === "classic"
                  ? <>按顺序点击数字 <span className="text-[#D4847C] font-mono font-bold">1 → {size * size}</span>，越快越好。</>
                  : <><span className="text-[#D4847C] font-mono font-bold">{timedDuration} 秒</span> 内按顺序点击尽可能多的数字。</>
                }
              </p>
              <p className="text-xs text-[#B5A99A]">点击错误会记录误操作。</p>
            </div>

            <Button onClick={handleStart} className="btn-coral h-12 px-8 rounded-xl text-base">
              <Play className="w-4 h-4 mr-2" />
              {mode === "classic" ? "开始测试" : `开始 ${timedDuration} 秒挑战`}
            </Button>
          </motion.div>
        )}

        {state.phase === "playing" && state.grid && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 sm:space-y-5"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-sm text-[#8B7E74]">
                下一个: <span className="font-mono font-bold text-[#D4847C] text-base sm:text-lg">{state.nextExpected}</span>
              </span>
              <span className="text-xs text-[#B5A99A]">
                {mode === "classic"
                  ? `${state.clicks.length} / ${size * size}`
                  : `${state.clicks.filter((c, i) => c.value === i + 1).length} 完成`
                }
              </span>
            </div>

            <div className="flex justify-center">
              <div className={`grid ${gridColsClass[state.grid!.size]} gap-1.5 sm:gap-2 p-2 sm:p-4 rounded-2xl border border-[#EDE5DB] bg-[#FAF7F4] overflow-x-auto`}>
                {state.grid!.flatCells.map((cell) => {
                  const clicked = state.clicks.some((c) => c.value === cell.value);
                  const isCorrect = clicked && cell.value < state.nextExpected;

                  return (
                    <motion.button
                      key={cell.value}
                      onClick={() => handleCellClick(cell.value)}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.92 }}
                      className={`
                        ${cellSizeClass[state.grid!.size]}
                        rounded-xl border font-mono font-bold
                        flex items-center justify-center transition-all duration-150
                        ${isCorrect
                          ? "bg-[rgba(143,184,168,0.18)] border-[rgba(143,184,168,0.35)] text-[#5A8A7A]"
                          : "bg-white border-[#EDE5DB] text-[#3D2B1F] shadow-sm hover:border-[rgba(212,132,124,0.3)] hover:shadow-md"
                        }
                      `}
                    >
                      {cell.value}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {state.phase === "ended" && result && (
          <motion.div
            key="ended"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-5 py-2"
          >
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#D4847C] to-[#C97B7B] flex items-center justify-center mb-3 shadow-md">
                <Crosshair className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3D2B1F]">
                {result.mode === "timed"
                  ? result.completedCount === result.totalNumbers
                    ? "挑战完成"
                    : "时间到"
                  : "测试完成"}
              </h3>
              {result.mode === "timed" && (
                <div className="mt-1">
                  {result.completedCount === result.totalNumbers ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#4AAD7A] bg-[#4AAD7A12] px-2 py-0.5 rounded-full">
                      <Target className="w-3 h-3" />
                      全部完成
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#D4847C] bg-[#D4847C12] px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      完成 {result.completedCount}/{result.totalNumbers}
                    </span>
                  )}
                </div>
              )}
              {grade && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mt-2"
                  style={{
                    background: `${grade.color}12`,
                    borderColor: `${grade.color}30`,
                  }}
                >
                  <span className="text-sm font-bold" style={{ color: grade.color }}>
                    {grade.label}
                  </span>
                  <span className="text-[10px] text-[#B5A99A]">基于文献参考标准</span>
                </motion.div>
              )}
              <div className="text-[10px] text-[#B5A99A] mt-1.5">
                {result.mode === "timed"
                  ? `参考标准：一般成年人 ${result.timeLimitMs / 1000} 秒内平均完成约 10 个数字`
                  : getNormReferenceText("schulte-grid")}
              </div>
            </div>

            {result.mode === "classic" ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                <ResultItem icon={<Clock className="w-3.5 h-3.5" />} label="用时" value={formatTime(result.totalTimeMs)} />
                <ResultItem icon={<Crosshair className="w-3.5 h-3.5" />} label="正确点击" value={`${result.correctClicks}`} />
                <ResultItem icon={<MousePointer className="w-3.5 h-3.5" />} label="错误点击" value={`${result.incorrectClicks}`} />
                <ResultItem label="每数平均" value={formatTime(result.avgTimePerNumberMs)} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                <ResultItem icon={<Target className="w-3.5 h-3.5" />} label="完成数量" value={`${result.completedCount}`} />
                <ResultItem icon={<Zap className="w-3.5 h-3.5" />} label="每秒点击" value={`${result.clicksPerSecond}`} />
                <ResultItem icon={<Crosshair className="w-3.5 h-3.5" />} label="正确率" value={`${(result.accuracy * 100).toFixed(0)}%`} />
                <ResultItem
                  icon={<Clock className="w-3.5 h-3.5" />}
                  label={result.completedCount === result.totalNumbers ? "实际用时" : "限时"}
                  value={result.completedCount === result.totalNumbers ? formatTime(result.totalTimeMs) : `${result.timeLimitMs / 1000}s`}
                />
              </div>
            )}

            <RealWorldMapping gameId="schulte-grid" />

            {comparison && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-[#EDE5DB] bg-[#FAF7F4] p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8B7E74]">第 {comparison.totalSessions} 次练习</span>
                  {comparison.isNewBest && (
                    <span className="text-[10px] font-bold text-[#D4A832] bg-[#D4A83212] px-2 py-0.5 rounded-full">
                      新纪录
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-[#B5A99A]">本次</div>
                    <div className="text-sm font-mono font-bold text-[#3D2B1F]">
                      {result.mode === "timed" ? result.completedCount : Math.round(result.accuracy * 100)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#B5A99A]">最佳</div>
                    <div className="text-sm font-mono font-bold text-[#3D2B1F]">
                      {comparison.bestRecord
                        ? result.mode === "timed"
                          ? (comparison.bestRecord.result as { completedCount?: number }).completedCount ?? "-"
                          : Math.round(((comparison.bestRecord.result as { accuracy?: number }).accuracy ?? 0) * 100)
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#B5A99A]">近5次平均</div>
                    <div className="text-sm font-mono font-bold text-[#3D2B1F]">
                      {comparison.recentAverage ?? "-"}
                    </div>
                  </div>
                </div>
                {comparison.trend !== "first" && comparison.trendDeltaPercent !== null && (
                  <div className="text-center">
                    <span
                      className={`text-xs font-medium ${
                        comparison.trend === "up"
                          ? "text-[#4AAD7A]"
                          : comparison.trend === "down"
                          ? "text-[#D4847C]"
                          : "text-[#8B7E74]"
                      }`}
                    >
                      {comparison.trend === "up" ? "↑" : comparison.trend === "down" ? "↓" : "→"}
                      {" "}
                      {Math.abs(comparison.trendDeltaPercent)}% 比上次
                    </span>
                  </div>
                )}
                <p className="text-xs text-[#8B7E74] text-center leading-relaxed">
                  {getPersonalFeedback(comparison, "舒尔特方格")}
                </p>
              </motion.div>
            )}

            <CommunityCard />

            <div className="flex items-center justify-center gap-3 py-1">
              <span className="text-sm text-[#8B7E74]">网格大小</span>
              <Select value={String(size)} onValueChange={(v) => setSize(Number(v) as GridSize)}>
                <SelectTrigger className="w-24 bg-white border-[#EDE5DB] text-[#3D2B1F] rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#EDE5DB] rounded-xl">
                  {SCHULTE_CONFIG.sizes.map((s) => (
                    <SelectItem key={s} value={String(s)} className="text-[#3D2B1F] focus:bg-[#F5EDE5] focus:text-[#3D2B1F] rounded-lg">
                      {s} × {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <ShareButton
                data={{
                  type: "game",
                  gameTitle: "舒尔特方格",
                  gameColor: "#8FB8A8",
                  score: result.mode === "classic"
                    ? Math.round(result.avgTimePerNumberMs)
                    : result.completedCount,
                  scoreLabel: result.mode === "classic" ? "每数平均 (ms)" : "完成数量",
                  tagline:
                    comparison?.isNewBest
                      ? `第${comparison.totalSessions}次练习 · 新纪录`
                      : comparison?.totalSessions && comparison.totalSessions > 1
                      ? `第${comparison.totalSessions}次练习`
                      : result.mode === "timed" && result.completedCount >= 15
                      ? "限时挑战表现出色"
                      : result.mode === "timed"
                      ? "继续挑战"
                      : result.avgTimePerNumberMs < 500
                      ? "注意力广度出色"
                      : result.avgTimePerNumberMs < 1000
                      ? "表现良好"
                      : "继续练习",
                  gradeLabel: grade?.label || undefined,
                  gaugeProgress: result.mode === "timed"
                    ? (toPercentile("schulte-grid", "completedCount", result.completedCount) ?? 50) / 100
                    : (toPercentile("schulte-grid", "accuracy", result.accuracy) ?? 50) / 100,
                }}
                filename="schulte-result.png"
              />
              <Button onClick={handleStart} className="flex-1 h-12 btn-coral rounded-xl text-base">
                <RotateCcw className="w-4 h-4 mr-2" />
                {size === state.grid?.size ? "再测一次" : `开始 ${size}×${size} 测试`}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
