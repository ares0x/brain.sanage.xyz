"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, BrainCircuit, ArrowLeftRight } from "lucide-react";
import { GameShell } from "@/components/game/game-shell";
import { ResultItem } from "@/components/game/result-item";
import { RealWorldMapping } from "@/components/game/real-world-mapping";
import { useGameAnalytics } from "@/lib/analytics/use-game-analytics";
import { saveRecord } from "@/lib/storage";
import { ShareButton } from "@/components/share/share-dialog";
import { getGradeForPercentile } from "@/lib/scoring/grade";
import { getPersonalComparison, getPersonalFeedback } from "@/lib/scoring/personal-progress";
import { getNormReferenceText } from "@/lib/scoring/norm-reference";
import type { Grade } from "@/lib/scoring/grade";
import type { PersonalComparison } from "@/lib/scoring/personal-progress";
import {
  createInitialState,
  startGame,
  advanceShowIndex,
  submitDigit,
  nextSequence,
  calculateResult,
} from "@/core/digit-span/engine";
import type { DigitSpanGameState, DigitSpanResult, RecallMode } from "@/core/digit-span/types";
import { DIGIT_SPAN_CONFIG } from "@/core/digit-span/config";

export default function DigitSpanHomepageShell() {
  const [state, setState] = useState<DigitSpanGameState>(createInitialState);
  const [result, setResult] = useState<DigitSpanResult | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [comparison, setComparison] = useState<PersonalComparison | null>(null);
  const [mode, setMode] = useState<RecallMode>("forward");
  useGameAnalytics("digit-span", state.phase);
  const [showingDigit, setShowingDigit] = useState<number | null>(null);

  const handleStart = useCallback(() => {
    const s = startGame(createInitialState(), mode);
    setState(s);
    setResult(null);
    setGrade(null);
    setComparison(null);
    setShowingDigit(null);
  }, [mode]);

  useEffect(() => {
    if (state.phase !== "showing" || state.showingIndex >= state.currentSequence.length) return;

    setShowingDigit(state.currentSequence[state.showingIndex]);

    const showTimer = setTimeout(() => {
      setShowingDigit(null);
    }, DIGIT_SPAN_CONFIG.showDurationMs);

    const advanceTimer = setTimeout(() => {
      setState((prev) => advanceShowIndex(prev));
    }, DIGIT_SPAN_CONFIG.showDurationMs + DIGIT_SPAN_CONFIG.showIntervalMs);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(advanceTimer);
    };
  }, [state.phase, state.showingIndex, state.currentSequence]);

  useEffect(() => {
    if (state.phase !== "feedback") return;

    const timer = setTimeout(() => {
      setState((prev) => {
        const next = nextSequence(prev);
        if (next.phase === "ended") {
          const gameResult = calculateResult(next);
          setResult(gameResult);
          const g = getGradeForPercentile(gameResult.percentile);
          setGrade(g);
          const record = saveRecord({
            gameId: "digit-span",
            timestamp: Date.now(),
            durationMs: next.startedAt ? Date.now() - next.startedAt : 0,
            result: gameResult,
          });
          const comp = getPersonalComparison("digit-span", record);
          setComparison(comp);
        }
        return next;
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [state.phase]);

  const handleDigitClick = useCallback((digit: number) => {
    setState((prev) => {
      const next = submitDigit(prev, digit);
      if (next.phase === "ended") {
        const gameResult = calculateResult(next);
        setResult(gameResult);
        const g = getGradeForPercentile(gameResult.percentile);
        setGrade(g);
        const record = saveRecord({
          gameId: "digit-span",
          timestamp: Date.now(),
          durationMs: next.startedAt ? Date.now() - next.startedAt : 0,
          result: gameResult,
        });
        const comp = getPersonalComparison("digit-span", record);
        setComparison(comp);
      }
      return next;
    });
  }, []);

  const lastTrial = state.trials[state.trials.length - 1];
  const isCorrect = lastTrial?.isCorrect;

  return (
    <GameShell
      title="数字广度测试"
      subtitle="工作记忆容量评估"
      icon={<BrainCircuit className="w-4 h-4" />}
      iconColor="#A87AD4"
      headerAction={
        state.phase !== "idle" && state.phase !== "ended" ? (
          <span className="font-mono text-xs text-[#8B7E74] bg-white border border-[#EDE5DB] rounded-lg px-2.5 py-1">
            长度 {state.currentLength}
          </span>
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
            <div className="space-y-1.5">
              <p className="text-[#5A4A3F] text-sm">
                记住出现的<span className="text-[#D4847C] font-bold">数字序列</span>，然后按顺序复述。
              </p>
              <p className="text-xs text-[#B5A99A]">序列会越来越长，测测你的记忆容量上限。</p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-[#8B7E74]">模式</span>
              <div className="flex rounded-xl border border-[#EDE5DB] bg-[#FAF7F4] overflow-hidden">
                <button
                  onClick={() => setMode("forward")}
                  className={`px-4 py-2 text-sm transition-colors ${
                    mode === "forward"
                      ? "bg-white text-[#3D2B1F] font-medium shadow-sm"
                      : "text-[#8B7E74] hover:text-[#5A4A3F]"
                  }`}
                >
                  正向记忆
                </button>
                <button
                  onClick={() => setMode("backward")}
                  className={`px-4 py-2 text-sm transition-colors ${
                    mode === "backward"
                      ? "bg-white text-[#3D2B1F] font-medium shadow-sm"
                      : "text-[#8B7E74] hover:text-[#5A4A3F]"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <ArrowLeftRight className="w-3 h-3" />
                    逆向记忆
                  </span>
                </button>
              </div>
            </div>

            <Button onClick={handleStart} className="btn-coral h-12 px-8 rounded-xl text-base">
              <Play className="w-4 h-4 mr-2" />
              开始测试
            </Button>
          </motion.div>
        )}

        {state.phase === "showing" && (
          <motion.div
            key="showing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-6 py-8"
          >
            <p className="text-xs text-[#B5A99A]">请记住以下数字</p>
            <div className="flex items-center justify-center gap-3 h-20">
              {state.currentSequence.map((digit, i) => (
                <motion.div
                  key={i}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-mono font-bold transition-all duration-200 ${
                    i === state.showingIndex && showingDigit !== null
                      ? "bg-[#D4847C] text-white shadow-lg"
                      : i < state.showingIndex
                      ? "bg-[#F5EDE5] text-[#B5A99A]"
                      : "bg-[#FAF7F4] text-[#EDE5DB]"
                  }`}
                >
                  {digit}
                </motion.div>
              ))}
            </div>
            <div className="w-32 h-1 bg-[#EDE5DB] rounded-full mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-[#D4847C] rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: `${((state.showingIndex + 1) / state.currentSequence.length) * 100}%`,
                }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>
        )}

        {state.phase === "recalling" && (
          <motion.div
            key="recalling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div className="text-center">
              <p className="text-sm text-[#8B7E74] mb-1">
                {mode === "forward" ? "按顺序点击数字" : "按逆序点击数字"}
              </p>
              <div className="flex items-center justify-center gap-2">
                {state.userAnswer.map((d, i) => (
                  <span
                    key={i}
                    className="w-10 h-10 rounded-lg bg-[#D4847C] text-white flex items-center justify-center text-lg font-mono font-bold"
                  >
                    {d}
                  </span>
                ))}
                {Array.from({ length: state.currentSequence.length - state.userAnswer.length }).map((_, i) => (
                  <span
                    key={`empty-${i}`}
                    className="w-10 h-10 rounded-lg border-2 border-dashed border-[#DDD5CC] bg-[#FAF7F4]"
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <motion.button
                  key={digit}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleDigitClick(digit)}
                  className="w-full h-14 rounded-xl bg-white border border-[#EDE5DB] text-lg font-mono font-bold text-[#3D2B1F] shadow-sm hover:border-[rgba(212,132,124,0.4)] hover:shadow-md transition-all active:bg-[#FAF7F4]"
                >
                  {digit}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {state.phase === "feedback" && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                isCorrect ? "bg-[#E8F0EC]" : "bg-[#FBEAEA]"
              }`}
            >
              <span className={`text-2xl font-bold ${isCorrect ? "text-[#4AAD7A]" : "text-[#C97B7B]"}`}>
                {isCorrect ? "✓" : "✗"}
              </span>
            </motion.div>
            <p className={`text-lg font-bold ${isCorrect ? "text-[#4AAD7A]" : "text-[#C97B7B]"}`}>
              {isCorrect ? "正确！" : "错误"}
            </p>
            {lastTrial && (
              <div className="mt-2 text-sm text-[#8B7E74]">
                正确: {lastTrial.sequence.join("-")}
                {mode === "backward" && (
                  <span className="text-[#B5A99A]"> (逆序: {[...lastTrial.sequence].reverse().join("-")})</span>
                )}
              </div>
            )}
          </motion.div>
        )}

        {state.phase === "ended" && result && (
          <motion.div
            key="ended"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 py-2"
          >
            <div className="text-center mb-2">
              <div className="text-xs text-[#B5A99A] mb-1">
                {mode === "forward" ? "正向记忆广度" : "逆向记忆广度"}
              </div>
              <div className="text-5xl font-mono font-bold text-[#3D2B1F] mb-1">
                {mode === "forward" ? result.forwardSpan : result.backwardSpan}
                <span className="text-lg text-[#8B7E74] ml-1">位</span>
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
              <div className="text-[10px] text-[#B5A99A] mt-1.5">{getNormReferenceText("digit-span")}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <ResultItem label="总轮次" value={`${result.totalTrials}`} />
              <ResultItem label="正确轮次" value={`${result.correctTrials}`} />
              {mode === "backward" && result.forwardSpan > 0 && (
                <ResultItem label="正向广度" value={`${result.forwardSpan}位`} />
              )}
              <ResultItem label="评定等级" value={result.level} />
            </div>

            <RealWorldMapping gameId="digit-span" />

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
                    <div className="text-sm font-mono font-bold text-[#3D2B1F]">{result.percentile}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#B5A99A]">最佳</div>
                    <div className="text-sm font-mono font-bold text-[#3D2B1F]">
                      {comparison.bestRecord
                        ? (comparison.bestRecord.result as { percentile?: number }).percentile ?? "-"
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
                  {getPersonalFeedback(comparison, "数字广度测试")}
                </p>
              </motion.div>
            )}

            <div className="flex items-center justify-center gap-3 py-1">
              <span className="text-sm text-[#8B7E74]">模式</span>
              <div className="flex rounded-xl border border-[#EDE5DB] bg-[#FAF7F4] overflow-hidden">
                <button
                  onClick={() => setMode("forward")}
                  className={`px-4 py-2 text-sm transition-colors ${
                    mode === "forward"
                      ? "bg-white text-[#3D2B1F] font-medium shadow-sm"
                      : "text-[#8B7E74] hover:text-[#5A4A3F]"
                  }`}
                >
                  正向记忆
                </button>
                <button
                  onClick={() => setMode("backward")}
                  className={`px-4 py-2 text-sm transition-colors ${
                    mode === "backward"
                      ? "bg-white text-[#3D2B1F] font-medium shadow-sm"
                      : "text-[#8B7E74] hover:text-[#5A4A3F]"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <ArrowLeftRight className="w-3 h-3" />
                    逆向记忆
                  </span>
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <ShareButton
                data={{
                  type: "game",
                  gameTitle: "数字广度",
                  gameColor: "#A87AD4",
                  score: mode === "forward" ? result.forwardSpan : result.backwardSpan,
                  scoreLabel: "记忆广度 (位)",
                  tagline:
                    comparison?.isNewBest
                      ? `第${comparison.totalSessions}次练习 · 新纪录`
                      : comparison?.totalSessions && comparison.totalSessions > 1
                      ? `第${comparison.totalSessions}次练习`
                      : result.level,
                  gradeLabel: grade?.label || undefined,
                  gaugeProgress: result.percentile / 100,
                }}
                filename="digit-span-result.png"
              />
              <Button onClick={handleStart} className="flex-1 h-12 btn-coral rounded-xl text-base">
                <RotateCcw className="w-4 h-4 mr-2" />
                再测一次
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
