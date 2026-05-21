"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, RotateCcw, Wind, Leaf, Heart } from "lucide-react";
import { GameShell } from "@/components/game/game-shell";
import { RealWorldMapping } from "@/components/game/real-world-mapping";
import { useGameAnalytics } from "@/lib/analytics/use-game-analytics";
import { saveRecord } from "@/lib/storage";
import { getGradeForMetric } from "@/lib/scoring/grade";
import { getPersonalComparison, getPersonalFeedback } from "@/lib/scoring/personal-progress";
import { getNormReferenceText } from "@/lib/scoring/norm-reference";
import type { Grade } from "@/lib/scoring/grade";
import type { PersonalComparison } from "@/lib/scoring/personal-progress";
import {
  createInitialState,
  startGame,
  beginBreathing,
  nextSubPhase,
  calculateResult,
} from "@/core/breathing-478/engine";
import type { Breathing478GameState, Breathing478Result } from "@/core/breathing-478/types";
import { BREATHING_478_CONFIG } from "@/core/breathing-478/config";

export default function Breathing478HomepageShell() {
  const [state, setState] = useState<Breathing478GameState>(createInitialState);
  const [result, setResult] = useState<Breathing478Result | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [comparison, setComparison] = useState<PersonalComparison | null>(null);
  const [totalRounds, setTotalRounds] = useState<number>(BREATHING_478_CONFIG.defaultRounds);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  useGameAnalytics("breathing-478", state.phase);

  // Drive phase transitions based on subPhase changes
  useEffect(() => {
    if (!state.subPhase) return;

    const durations: Record<string, number> = {
      breathing_in: BREATHING_478_CONFIG.inhaleMs,
      hold: BREATHING_478_CONFIG.holdMs,
      breathing_out: BREATHING_478_CONFIG.exhaleMs,
    };

    const duration = durations[state.subPhase];
    if (!duration) return;

    const timer = setTimeout(() => {
      setState((prev) => {
        const next = nextSubPhase(prev);
        if (next.phase === "ended") {
          const gameResult = calculateResult(next);
          setResult(gameResult);
          const completionRate = gameResult.totalRounds > 0 ? gameResult.completedRounds / gameResult.totalRounds : 0;
          const g = getGradeForMetric("breathing-478", "completionRate", completionRate);
          setGrade(g);
          const record = saveRecord({
            gameId: "breathing-478",
            timestamp: Date.now(),
            durationMs: next.startedAt ? Date.now() - next.startedAt : 0,
            result: gameResult,
          });
          const comp = getPersonalComparison("breathing-478", record);
          setComparison(comp);
        }
        return next;
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [state.subPhase]);

  // Track elapsed time during breathing
  useEffect(() => {
    const isBreathing =
      state.phase === "breathing_in" ||
      state.phase === "hold" ||
      state.phase === "breathing_out";

    if (!isBreathing || !state.startedAt) return;

    const id = setInterval(() => {
      setElapsedMs(Date.now() - state.startedAt!);
    }, 100);

    return () => clearInterval(id);
  }, [state.phase, state.startedAt]);

  const handleStart = useCallback(() => {
    setState((prev) => startGame(prev, totalRounds));
    setResult(null);
    setGrade(null);
    setComparison(null);
    setElapsedMs(0);
  }, [totalRounds]);

  const handleBeginBreathing = useCallback(() => {
    setCountdown(3);
  }, []);

  // Countdown before breathing starts
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      setState((prev) => beginBreathing(prev));
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatTime = (ms: number) => {
    const sec = Math.floor(ms / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${sec}.${cs.toString().padStart(2, "0")}s`;
  };

  const subPhaseConfig = {
    breathing_in: {
      label: "吸气",
      desc: "用鼻子缓慢吸气",
      duration: BREATHING_478_CONFIG.inhaleMs,
      color: "#8FB8A8",
    },
    hold: {
      label: "屏息",
      desc: "保持呼吸，放松身体",
      duration: BREATHING_478_CONFIG.holdMs,
      color: "#D4A832",
    },
    breathing_out: {
      label: "呼气",
      desc: "用嘴缓慢呼气，发出「呼」声",
      duration: BREATHING_478_CONFIG.exhaleMs,
      color: "#D4847C",
    },
  };

  const currentConfig = state.subPhase ? subPhaseConfig[state.subPhase] : null;

  const RoundsSelector = () => (
    <div className="flex items-center justify-center gap-3">
      <span className="text-sm text-[#8B7E74]">练习轮次</span>
      <Select
        value={String(totalRounds)}
        onValueChange={(v) => setTotalRounds(Number(v))}
      >
        <SelectTrigger className="w-24 bg-white border-[#EDE5DB] text-[#3D2B1F] rounded-xl h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white border-[#EDE5DB] rounded-xl">
          {BREATHING_478_CONFIG.roundOptions.map((n) => (
            <SelectItem
              key={n}
              value={String(n)}
              className="text-[#3D2B1F] focus:bg-[#F5EDE5] focus:text-[#3D2B1F] rounded-lg"
            >
              {n} 轮
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <GameShell
      title="4-7-8 呼吸法"
      subtitle="放松身心，缓解焦虑"
      icon={<Wind className="w-4 h-4" />}
      iconColor="#6BA7A8"
      headerAction={
        state.phase !== "idle" && state.phase !== "ended" && state.phase !== "instruction" ? (
          <span className="font-mono text-xs text-[#8B7E74] bg-white border border-[#EDE5DB] rounded-lg px-2.5 py-1">
            {state.currentRound} / {state.totalRounds} 轮
          </span>
        ) : undefined
      }
    >
      <AnimatePresence mode="wait">
        {/* IDLE */}
        {state.phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-center space-y-5 py-5 sm:py-6"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#6BA7A8] to-[#5A9697] flex items-center justify-center shadow-md">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1.5">
              <p className="text-[#5A4A3F] text-sm">
                跟随指引进行 <span className="text-[#6BA7A8] font-bold">4-7-8 呼吸</span>，放松身心。
              </p>
              <p className="text-xs text-[#B5A99A]">一种由哈佛大学推荐的快速减压技巧。</p>
            </div>

            {/* Mini instruction cards */}
            <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
              {[
                { num: "4", label: "秒吸气", color: "#8FB8A8" },
                { num: "7", label: "秒屏息", color: "#D4A832" },
                { num: "8", label: "秒呼气", color: "#D4847C" },
              ].map((step) => (
                <div
                  key={step.num}
                  className="rounded-xl border border-[#EDE5DB] bg-[#FAF7F4] p-3 text-center"
                >
                  <div
                    className="text-xl font-mono font-bold"
                    style={{ color: step.color }}
                  >
                    {step.num}
                  </div>
                  <div className="text-[10px] text-[#8B7E74] mt-0.5">{step.label}</div>
                </div>
              ))}
            </div>

            <RoundsSelector />

            <Button onClick={handleStart} className="btn-coral h-12 px-8 rounded-xl text-base">
              <Play className="w-4 h-4 mr-2" />
              开始练习
            </Button>
          </motion.div>
        )}

        {/* INSTRUCTION */}
        {state.phase === "instruction" && countdown === null && (
          <motion.div
            key="instruction"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4 py-2"
          >
            <div className="rounded-xl border border-[#EDE5DB] bg-[#FAF7F4] p-4 space-y-3">
              <h3 className="text-sm font-bold text-[#3D2B1F] flex items-center gap-2">
                <Leaf className="w-4 h-4 text-[#6BA7A8]" />
                如何做 4-7-8 呼吸法
              </h3>
              <ol className="space-y-2.5 text-sm text-[#5A4A3F]">
                <li className="flex items-start gap-2.5">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                    style={{ background: "#8FB8A8" }}
                  >
                    1
                  </span>
                  <span>
                    <strong className="text-[#8FB8A8]">吸气 4 秒</strong>
                    <br />
                    <span className="text-xs text-[#8B7E74]">用鼻子深深吸气，感受腹部鼓起</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                    style={{ background: "#D4A832" }}
                  >
                    2
                  </span>
                  <span>
                    <strong className="text-[#D4A832]">屏息 7 秒</strong>
                    <br />
                    <span className="text-xs text-[#8B7E74]">轻轻闭上嘴，保持呼吸，身体放松</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                    style={{ background: "#D4847C" }}
                  >
                    3
                  </span>
                  <span>
                    <strong className="text-[#D4847C]">呼气 8 秒</strong>
                    <br />
                    <span className="text-xs text-[#8B7E74]">用嘴缓慢呼气，可以发出「呼」的声音</span>
                  </span>
                </li>
              </ol>
              <div className="pt-1 text-xs text-[#8B7E74] leading-relaxed border-t border-[#EDE5DB]">
                {totalRounds === 4
                  ? "建议连续做 4 个循环。呼气时间比吸气长，能更有效地激活副交感神经，带来放松感。"
                  : `本次练习共 ${totalRounds} 轮。每个循环约 19 秒，全程跟随视觉指引即可。`}
              </div>
            </div>

            <Button
              onClick={handleBeginBreathing}
              className="w-full h-12 rounded-xl text-base"
              style={{
                background: "linear-gradient(135deg, #6BA7A8, #5A9697)",
                color: "white",
              }}
            >
              <Wind className="w-4 h-4 mr-2" />
              开始呼吸
            </Button>
          </motion.div>
        )}

        {/* COUNTDOWN */}
        {countdown !== null && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 sm:py-12"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-[#8B7E74] mb-6"
            >
              准备开始
            </motion.p>
            <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
              {/* Soft outer ring that pulses with each tick */}
              <motion.div
                key={countdown}
                className="absolute rounded-full border-2"
                style={{ borderColor: "#6BA7A830" }}
                initial={{ width: 140, height: 140, opacity: 0.3 }}
                animate={{ width: 160, height: 160, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              {/* Main circle */}
              <motion.div
                key={`circle-${countdown}`}
                className="absolute rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(107,167,168,0.12), rgba(107,167,168,0.04))",
                  border: "2px solid rgba(107,167,168,0.25)",
                  width: 120,
                  height: 120,
                }}
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 14, stiffness: 200 }}
              >
                <motion.span
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ type: "spring", damping: 12, stiffness: 250 }}
                  className="text-5xl font-bold font-mono"
                  style={{ color: "#6BA7A8" }}
                >
                  {countdown}
                </motion.span>
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-[#B5A99A] mt-6"
            >
              找个舒适的姿势，放松肩膀
            </motion.p>
          </motion.div>
        )}

        {/* BREATHING (all sub-phases) */}
        {(state.phase === "breathing_in" ||
          state.phase === "hold" ||
          state.phase === "breathing_out") &&
          currentConfig && (
            <motion.div
              key={state.subPhase! + state.currentRound}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-4"
            >
              {/* Phase label */}
              <div className="text-center space-y-1">
                <motion.div
                  key={state.subPhase + "round"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-[#8B7E74]"
                >
                  第 {state.currentRound} 轮
                </motion.div>
                <motion.h3
                  key={state.subPhase + "label"}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-2xl font-bold"
                  style={{ color: currentConfig.color }}
                >
                  {currentConfig.label}
                </motion.h3>
                <p className="text-sm text-[#8B7E74]">{currentConfig.desc}</p>
              </div>

              {/* Breathing circle */}
              <div className="flex items-center justify-center">
                <motion.div
                  className="relative flex items-center justify-center"
                  style={{ width: 220, height: 220 }}
                >
                  {/* Outer ring */}
                  <motion.div
                    className="absolute rounded-full border-2"
                    style={{
                      borderColor: `${currentConfig.color}20`,
                    }}
                    animate={{
                      width: state.subPhase === "breathing_in"
                        ? [120, 200]
                        : state.subPhase === "hold"
                        ? 200
                        : [200, 120],
                      height: state.subPhase === "breathing_in"
                        ? [120, 200]
                        : state.subPhase === "hold"
                        ? 200
                        : [200, 120],
                    }}
                    transition={{
                      duration: currentConfig.duration / 1000,
                      ease: state.subPhase === "hold" ? "linear" : "easeInOut",
                    }}
                  />

                  {/* Main circle */}
                  <motion.div
                    className="rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${currentConfig.color}18, ${currentConfig.color}08)`,
                      border: `2px solid ${currentConfig.color}40`,
                    }}
                    animate={{
                      width: state.subPhase === "breathing_in"
                        ? [80, 160]
                        : state.subPhase === "hold"
                        ? 160
                        : [160, 80],
                      height: state.subPhase === "breathing_in"
                        ? [80, 160]
                        : state.subPhase === "hold"
                        ? 160
                        : [160, 80],
                    }}
                    transition={{
                      duration: currentConfig.duration / 1000,
                      ease: state.subPhase === "hold" ? "linear" : "easeInOut",
                    }}
                  >
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Wind
                        className="w-8 h-8"
                        style={{ color: currentConfig.color }}
                      />
                    </motion.div>
                  </motion.div>

                  {/* Inner dot */}
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      background: currentConfig.color,
                    }}
                    animate={{
                      width: state.subPhase === "breathing_in"
                        ? [8, 20]
                        : state.subPhase === "hold"
                        ? [20, 20]
                        : [20, 8],
                      height: state.subPhase === "breathing_in"
                        ? [8, 20]
                        : state.subPhase === "hold"
                        ? [20, 20]
                        : [20, 8],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: state.subPhase === "hold" ? 3 : currentConfig.duration / 1000,
                      repeat: state.subPhase === "hold" ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2">
                {(["breathing_in", "hold", "breathing_out"] as const).map((sp) => {
                  const isActive = state.subPhase === sp;
                  const isPast =
                    state.subPhase &&
                    (["breathing_in", "hold", "breathing_out"] as const).indexOf(sp) <
                      (["breathing_in", "hold", "breathing_out"] as const).indexOf(state.subPhase);
                  return (
                    <div
                      key={sp}
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: isActive ? 24 : 8,
                        background: isActive || isPast ? subPhaseConfig[sp].color : "#DDD5CC",
                        opacity: isPast ? 0.5 : 1,
                      }}
                    />
                  );
                })}
              </div>

              {/* Time elapsed */}
              <div className="text-center">
                <span className="font-mono text-xs text-[#B5A99A]">
                  {formatTime(elapsedMs)}
                </span>
              </div>
            </motion.div>
          )}

        {/* ENDED */}
        {state.phase === "ended" && result && (
          <motion.div
            key="ended"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 py-2"
          >
            <div className="text-center mb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#6BA7A8] to-[#5A9697] flex items-center justify-center mb-3 shadow-md"
              >
                <Heart className="w-7 h-7 text-white" />
              </motion.div>
              <div className="text-xs text-[#B5A99A] mb-1">练习完成</div>
              <div className="text-4xl font-mono font-bold text-[#3D2B1F] mb-1">
                {result.completedRounds}
                <span className="text-lg text-[#8B7E74] ml-1">轮</span>
              </div>
              {grade && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border"
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
              <div className="text-[10px] text-[#B5A99A] mt-1.5">{getNormReferenceText("breathing-478")}</div>
            </div>

            <div className="text-center text-sm text-[#8B7E74] leading-relaxed">
              4-7-8 呼吸法能激活副交感神经系统，帮助身体进入放松状态。
              <br />
              每天练习 2-3 次，可有效缓解焦虑、改善睡眠。
            </div>

            <RealWorldMapping gameId="breathing-478" />

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
                    <div className="text-sm font-mono font-bold text-[#3D2B1F]">{Math.round((result.completedRounds / result.totalRounds) * 100)}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#B5A99A]">最佳</div>
                    <div className="text-sm font-mono font-bold text-[#3D2B1F]">
                      {comparison.bestRecord
                        ? (() => {
                            const br = comparison.bestRecord!.result as { completedRounds?: number; totalRounds?: number };
                            return br.totalRounds && br.totalRounds > 0
                              ? Math.round((br.completedRounds ?? 0) / br.totalRounds * 100) + "%"
                              : "-";
                          })()
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
                  {getPersonalFeedback(comparison, "4-7-8 呼吸法")}
                </p>
              </motion.div>
            )}

            <div className="flex items-center justify-center gap-3 py-1">
              <span className="text-sm text-[#8B7E74]">练习轮次</span>
              <Select
                value={String(totalRounds)}
                onValueChange={(v) => setTotalRounds(Number(v))}
              >
                <SelectTrigger className="w-24 bg-white border-[#EDE5DB] text-[#3D2B1F] rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#EDE5DB] rounded-xl">
                  {BREATHING_478_CONFIG.roundOptions.map((n) => (
                    <SelectItem
                      key={n}
                      value={String(n)}
                      className="text-[#3D2B1F] focus:bg-[#F5EDE5] focus:text-[#3D2B1F] rounded-lg"
                    >
                      {n} 轮
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleStart} className="w-full h-12 btn-coral rounded-xl text-base">
              <RotateCcw className="w-4 h-4 mr-2" />
              {totalRounds === result.totalRounds ? "再练一次" : `开始 ${totalRounds} 轮练习`}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
