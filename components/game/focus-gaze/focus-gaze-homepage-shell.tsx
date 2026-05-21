"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Eye, Sparkles } from "lucide-react";
import { GameShell } from "@/components/game/game-shell";
import { ResultItem } from "@/components/game/result-item";
import { RealWorldMapping } from "@/components/game/real-world-mapping";
import { ShareButton } from "@/components/share/share-dialog";
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
  beginGazing,
  recordDistraction,
  pauseGame,
  resumeGame,
  endGame,
  calculateResult,
} from "@/core/focus-gaze/engine";
import type { FocusGazeGameState, FocusGazeResult } from "@/core/focus-gaze/types";
import { FOCUS_GAZE_CONFIG } from "@/core/focus-gaze/config";

const DURATION_LABELS: Record<number, string> = {
  30: "30 秒",
  45: "45 秒",
  60: "60 秒",
};

export default function FocusGazeHomepageShell() {
  const [state, setState] = useState<FocusGazeGameState>(createInitialState);
  const [result, setResult] = useState<FocusGazeResult | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [comparison, setComparison] = useState<PersonalComparison | null>(null);
  const [durationSec, setDurationSec] = useState<number>(FOCUS_GAZE_CONFIG.defaultDurationSec);
  const [countdown, setCountdown] = useState(3);
  const [remainingMs, setRemainingMs] = useState(0);
  const [showDistractionWarning, setShowDistractionWarning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useGameAnalytics("focus-gaze", state.phase);

  // Countdown effect
  useEffect(() => {
    if (state.phase !== "countdown") return;
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setState((s) => beginGazing(s));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.phase]);

  // Gazing timer effect
  useEffect(() => {
    if (state.phase !== "gazing" || state.isPaused) return;

    setRemainingMs(state.durationMs);

    const interval = setInterval(() => {
      setState((s) => {
        if (s.phase !== "gazing" || !s.startedAt || s.isPaused) return s;
        const elapsed = Date.now() - s.startedAt - s.totalPausedMs;
        const rem = Math.max(s.durationMs - elapsed, 0);
        setRemainingMs(rem);

        if (rem <= 0) {
          const ended = endGame(s);
          const gameResult = calculateResult(ended);
          setResult(gameResult);
          const g = getGradeForMetric("focus-gaze", "completionRate", gameResult.completionRate);
          setGrade(g);
          const record = saveRecord({
            gameId: "focus-gaze",
            timestamp: Date.now(),
            durationMs: gameResult.actualGazeMs,
            result: gameResult,
          });
          const comp = getPersonalComparison("focus-gaze", record);
          setComparison(comp);
          return ended;
        }
        return s;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [state.phase, state.isPaused, state.startedAt]);

  // Page visibility change (pause when switching tabs/apps)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setState((s) => pauseGame(s));
      } else {
        setState((s) => resumeGame(s));
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Touch/move detection during gazing
  useEffect(() => {
    if (state.phase !== "gazing") return;

    const handleTouch = () => {
      setState((s) => recordDistraction(s));
      setShowDistractionWarning(true);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = setTimeout(() => setShowDistractionWarning(false), 1500);
    };

    window.addEventListener("touchstart", handleTouch, { passive: true });
    window.addEventListener("click", handleTouch);
    return () => {
      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("click", handleTouch);
    };
  }, [state.phase]);

  const handleStart = useCallback(() => {
    setState((prev) => startGame(prev, durationSec));
    setResult(null);
    setGrade(null);
    setComparison(null);
  }, [durationSec]);

  const handleEndEarly = useCallback(() => {
    setState((s) => {
      const ended = endGame(s);
      const gameResult = calculateResult(ended);
      setResult(gameResult);
      const g = getGradeForMetric("focus-gaze", "completionRate", gameResult.completionRate);
      setGrade(g);
      const record = saveRecord({
        gameId: "focus-gaze",
        timestamp: Date.now(),
        durationMs: gameResult.actualGazeMs,
        result: gameResult,
      });
      const comp = getPersonalComparison("focus-gaze", record);
      setComparison(comp);
      return ended;
    });
  }, []);

  const formatTime = (ms: number) => {
    const sec = Math.ceil(ms / 1000);
    return `${sec}`;
  };

  return (
    <GameShell
      title="凝视启动"
      subtitle="盯住一点，激活专注"
      icon={<Eye className="w-4 h-4" />}
      iconColor="#D4A832"
      headerAction={
        state.phase === "gazing" ? (
          <span className="font-mono text-xs text-[#8B7E74] bg-white border border-[#EDE5DB] rounded-lg px-2.5 py-1">
            {formatTime(remainingMs)}s
          </span>
        ) : undefined
      }
    >
      <div ref={containerRef} className="relative">
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
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#D4A832] to-[#B8922E] flex items-center justify-center shadow-md">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[#5A4A3F] text-sm">
                  盯住屏幕中央的焦点 <span className="text-[#D4A832] font-bold">30–60 秒</span>，激活蓝斑核。
                </p>
                <p className="text-xs text-[#B5A99A]">持续的视觉聚焦能诱导神经系统进入警觉状态。</p>
              </div>

              {/* Duration selector */}
              <div className="flex items-center justify-center gap-2">
                {FOCUS_GAZE_CONFIG.durationOptions.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setDurationSec(sec)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      durationSec === sec
                        ? "bg-[#3D2B1F] text-white border-[#3D2B1F]"
                        : "bg-white text-[#3D2B1F] border-[#EDE5DB] hover:border-[#DDD5CC]"
                    }`}
                  >
                    {DURATION_LABELS[sec]}
                  </button>
                ))}
              </div>

              {/* Instruction cards */}
              <div className="space-y-2 max-w-[280px] mx-auto text-left">
                {[
                  { step: "1", text: "将手机放在眼前约 30cm 处" },
                  { step: "2", text: "眼睛放松，自然注视中央焦点" },
                  { step: "3", text: "保持凝视，不要触摸屏幕" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FAF7F4] border border-[#EDE5DB]">
                    <div className="w-6 h-6 rounded-full bg-[#D4A832] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {item.step}
                    </div>
                    <span className="text-xs text-[#5A4A3F]">{item.text}</span>
                  </div>
                ))}
              </div>

              <Button onClick={handleStart} className="btn-coral h-12 px-8 rounded-xl text-base">
                <Play className="w-4 h-4 mr-2" />
                开始凝视
              </Button>
            </motion.div>
          )}

          {/* COUNTDOWN */}
          {state.phase === "countdown" && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 sm:py-16"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="text-6xl sm:text-7xl font-mono font-bold text-[#D4A832]"
              >
                {countdown}
              </motion.div>
              <p className="text-sm text-[#8B7E74] mt-4">准备凝视</p>
            </motion.div>
          )}

          {/* GAZING */}
          {state.phase === "gazing" && (
            <motion.div
              key="gazing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center justify-center py-10 sm:py-14"
              style={{ minHeight: 320 }}
            >
              {/* Dark immersive overlay inside card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 rounded-xl"
                style={{ background: "linear-gradient(180deg, #1a1512 0%, #231c17 100%)" }}
              />

              {/* Distraction warning */}
              <AnimatePresence>
                {showDistractionWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-4 left-0 right-0 z-20 flex justify-center"
                  >
                    <div className="px-4 py-2 rounded-full bg-[#E05A5A]/20 border border-[#E05A5A]/30 text-xs text-[#E05A5A] font-medium">
                      请保持凝视，不要触摸屏幕
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pause indicator */}
              <AnimatePresence>
                {state.isPaused && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/40"
                  >
                    <div className="text-center">
                      <p className="text-white text-sm font-medium">已暂停</p>
                      <p className="text-white/60 text-xs mt-1">切换回页面后继续</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Central focal point */}
              <div className="relative z-10 flex items-center justify-center" style={{ width: 200, height: 200 }}>
                {/* Outer rotating particles */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "#D4A832",
                      opacity: 0.3 + i * 0.08,
                    }}
                    animate={{
                      x: [0, Math.cos((i / 6) * Math.PI * 2) * 80, 0],
                      y: [0, Math.sin((i / 6) * Math.PI * 2) * 80, 0],
                    }}
                    transition={{
                      duration: 8 + i * 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.5,
                    }}
                  />
                ))}

                {/* Outer glow ring (pulsing) */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(212,168,50,0.15) 0%, transparent 70%)",
                  }}
                  animate={{
                    width: [140, 180, 140],
                    height: [140, 180, 140],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Middle ring */}
                <motion.div
                  className="absolute rounded-full border"
                  style={{
                    borderColor: "rgba(212,168,50,0.2)",
                  }}
                  animate={{
                    width: [100, 120, 100],
                    height: [100, 120, 100],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />

                {/* Core dot */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    background: "radial-gradient(circle, #F0D878 0%, #D4A832 50%, #B8922E 100%)",
                    boxShadow: "0 0 20px rgba(212,168,50,0.4), 0 0 60px rgba(212,168,50,0.15)",
                  }}
                  animate={{
                    width: [16, 20, 16],
                    height: [16, 20, 16],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Inner highlight */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 60%)",
                    width: 8,
                    height: 8,
                    marginTop: -2,
                    marginLeft: -2,
                  }}
                  animate={{
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* Timer */}
              <div className="relative z-10 mt-8 text-center">
                <motion.span
                  className="font-mono text-3xl font-bold text-[#E8DDD0]"
                  key={Math.ceil(remainingMs / 1000)}
                  initial={{ opacity: 0.5, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {formatTime(remainingMs)}
                </motion.span>
                <span className="text-sm text-[#8B7E74] ml-1">秒</span>
              </div>

              {/* End early button */}
              <button
                onClick={handleEndEarly}
                className="relative z-10 mt-6 text-xs text-[#8B7E74] hover:text-[#B5A99A] transition-colors"
              >
                提前结束
              </button>
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
                  className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#D4A832] to-[#B8922E] flex items-center justify-center mb-3 shadow-md"
                >
                  <Sparkles className="w-7 h-7 text-white" />
                </motion.div>
                <div className="text-xs text-[#B5A99A] mb-1">专注完成</div>
                <div className="text-4xl font-mono font-bold text-[#3D2B1F] mb-1">
                  {Math.round(result.actualGazeMs / 1000)}
                  <span className="text-lg text-[#8B7E74] ml-1">秒</span>
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
                <div className="text-[10px] text-[#B5A99A] mt-1.5">{getNormReferenceText("focus-gaze")}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                <ResultItem label="目标时长" value={`${result.durationMs / 1000}秒`} />
                <ResultItem label="实际凝视" value={`${Math.round(result.actualGazeMs / 1000)}秒`} />
                <ResultItem label="分心次数" value={`${result.distractionCount}次`} />
                <ResultItem label="完成度" value={`${Math.round(result.completionRate * 100)}%`} />
              </div>

              <RealWorldMapping gameId="focus-gaze" />

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
                      <div className="text-sm font-mono font-bold text-[#3D2B1F]">{Math.round(result.completionRate * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#B5A99A]">最佳</div>
                      <div className="text-sm font-mono font-bold text-[#3D2B1F]">
                        {comparison.bestRecord
                          ? Math.round((comparison.bestRecord.result as { completionRate?: number }).completionRate ?? 0 * 100) + "%"
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
                    {getPersonalFeedback(comparison, "凝视启动")}
                  </p>
                </motion.div>
              )}

              <div className="text-center text-sm text-[#8B7E74] leading-relaxed">
                凝视训练通过持续的视觉聚焦激活蓝斑核，提升去甲肾上腺素水平，帮助大脑进入专注状态。
                <br />
                适合在开始工作/学习前进行。
              </div>

              <div className="flex gap-2">
                <ShareButton
                  data={{
                    type: "game",
                    gameTitle: "凝视启动",
                    gameColor: "#D4A832",
                    score: Math.round(result.actualGazeMs / 1000),
                    scoreLabel: "专注秒数",
                    tagline:
                      comparison?.isNewBest
                        ? `第${comparison.totalSessions}次练习 · 新纪录`
                        : comparison?.totalSessions && comparison.totalSessions > 1
                        ? `第${comparison.totalSessions}次练习`
                        : result.level,
                    gradeLabel: grade?.label || undefined,
                    gaugeProgress: result.completionRate,
                  }}
                  filename="focus-gaze-result.png"
                />
                <Button onClick={handleStart} className="flex-1 h-12 btn-coral rounded-xl text-base">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  再来一次
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  );
}
