"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, RotateCcw, ArrowLeft, ArrowRight, Target, Zap } from "lucide-react";
import { GameShell } from "@/components/game/game-shell";
import { ResultItem } from "@/components/game/result-item";
import { RealWorldMapping } from "@/components/game/real-world-mapping";
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
  recordResponse,
  calculateResult,
} from "@/core/flanker/engine";
import type { FlankerGameState, FlankerResult } from "@/core/flanker/types";
import { FLANKER_CONFIG } from "@/core/flanker/config";

export default function FlankerHomepageShell() {
  const [state, setState] = useState<FlankerGameState>(createInitialState);
  const [result, setResult] = useState<FlankerResult | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [comparison, setComparison] = useState<PersonalComparison | null>(null);
  useGameAnalytics("flanker", state.phase);

  const handleStart = useCallback(() => {
    const s = startGame(createInitialState());
    setState(s);
    setResult(null);
    setGrade(null);
    setComparison(null);
  }, []);

  const handleResponse = useCallback((direction: "left" | "right") => {
    setState((prev) => {
      const next = recordResponse(prev, direction);
      if (next.phase === "ended") {
        const gameResult = calculateResult(next.responses);
        setResult(gameResult);
        const g = getGradeForMetric("flanker", "accuracy", gameResult.accuracy);
        setGrade(g);
        const record = saveRecord({
          gameId: "flanker",
          timestamp: Date.now(),
          durationMs: prev.startedAt ? Date.now() - prev.startedAt : 0,
          result: gameResult,
        });
        const comp = getPersonalComparison("flanker", record);
        setComparison(comp);
      }
      return next;
    });
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.phase !== "playing") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleResponse("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleResponse("right");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.phase, handleResponse]);

  const progress = state.trials.length > 0 ? (state.currentIndex / state.trials.length) * 100 : 0;
  const currentTrial =
    state.phase === "playing" && state.currentIndex < state.trials.length
      ? state.trials[state.currentIndex]
      : null;

  const lastResponse = state.responses[state.responses.length - 1];

  return (
    <GameShell
      title="抗干扰训练"
      subtitle="Flanker · 选择性注意与抑制控制"
      icon={<Target className="w-4 h-4" />}
      iconColor="#5A9DE0"
      headerAction={
        state.phase === "playing" ? (
          <span className="font-mono text-xs text-[#8B7E74] bg-white border border-[#EDE5DB] rounded-lg px-2.5 py-1">
            {state.currentIndex + 1} / {state.trials.length}
          </span>
        ) : undefined
      }
      progressBar={
        state.phase === "playing" ? (
          <div className="mb-4 sm:mb-5">
            <Progress value={progress} className="h-1.5 bg-[#F5EDE5] [&>div]:bg-[#5A9DE0]" />
          </div>
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
                判断<span className="text-[#5A9DE0] font-bold">中心箭头</span>的方向，忽略两侧干扰。
              </p>
              <p className="text-xs text-[#B5A99A]">冲突条件越慢，说明抑制控制能力越强。</p>
            </div>

            <div className="rounded-xl border border-[#EDE5DB] bg-[#FAF7F4] p-4 max-w-[280px] mx-auto">
              <div className="flex items-center justify-center gap-3 text-2xl font-mono font-bold text-[#3D2B1F]">
                <span className="text-[#B5A99A]">&gt;&gt;</span>
                <span className="text-[#5A9DE0]">&lt;</span>
                <span className="text-[#B5A99A]">&gt;&gt;</span>
              </div>
              <p className="text-xs text-[#8B7E74] mt-2">中心是 ←，请按左键</p>
            </div>

            <Button onClick={handleStart} className="btn-coral h-12 px-8 rounded-xl text-base">
              <Play className="w-4 h-4 mr-2" />
              开始测试
            </Button>
          </motion.div>
        )}

        {state.phase === "playing" && currentTrial && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Arrow display */}
            <div className="flex items-center justify-center">
              <motion.div
                key={currentTrial.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="text-center"
              >
                <div className="text-5xl sm:text-6xl font-mono font-bold text-[#3D2B1F] tracking-wider">
                  {currentTrial.arrows.split("").map((char, i) => (
                    <span
                      key={i}
                      className={
                        i === Math.floor(currentTrial.arrows.length / 2)
                          ? "text-[#5A9DE0]"
                          : "text-[#B5A99A]"
                      }
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[#B5A99A] mt-3">
                  中心箭头指向哪边？
                </p>
              </motion.div>
            </div>

            {/* Feedback */}
            {lastResponse && lastResponse.trialId === currentTrial.id - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${
                    lastResponse.correct
                      ? "bg-[#E8F0EC] text-[#4AAD7A]"
                      : "bg-[#FBEAEA] text-[#C97B7B]"
                  }`}
                >
                  {lastResponse.correct ? "✓" : "✗"}
                  {lastResponse.correct ? "正确" : "错误"}
                  <span className="font-mono">{lastResponse.reactionTimeMs}ms</span>
                </span>
              </motion.div>
            )}

            {/* Response buttons */}
            <div className="flex gap-3 sm:gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 max-w-40">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 rounded-xl border-[#EDE5DB] bg-white text-[#8B7E74] hover:bg-[#FAF7F4] hover:text-[#5A4A3F] hover:border-[rgba(90,157,224,0.3)] text-base"
                  onClick={() => handleResponse("left")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  向左
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 max-w-40">
                <Button
                  size="lg"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#5A9DE0] to-[#4A8DD0] hover:from-[#4A8DD0] hover:to-[#3A7DC0] text-white shadow-md shadow-[rgba(90,157,224,0.2)] text-base"
                  onClick={() => handleResponse("right")}
                >
                  向右
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>

            <p className="text-center text-[10px] text-[#B5A99A]">
              也可使用键盘 ← → 方向键
            </p>
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
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#D4847C] to-[#C97B7B] flex items-center justify-center mb-3 shadow-md">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3D2B1F]">测试完成</h3>
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
              <div className="text-[10px] text-[#B5A99A] mt-1.5">{getNormReferenceText("flanker")}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <ResultItem icon={<Zap className="w-3.5 h-3.5" />} label="一致条件 RT" value={`${result.congruentAvgMs}ms`} desc="箭头方向一致时的反应" />
              <ResultItem icon={<Zap className="w-3.5 h-3.5" />} label="冲突条件 RT" value={`${result.incongruentAvgMs}ms`} desc="箭头方向冲突时的反应" />
              <ResultItem icon={<Target className="w-3.5 h-3.5" />} label="冲突效应" value={`${result.conflictEffectMs}ms`} desc="冲突比一致慢的毫秒数，越小越好" />
              <ResultItem label="正确率" value={`${(result.accuracy * 100).toFixed(0)}%`} />
            </div>

            <RealWorldMapping gameId="flanker" />

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
                    <div className="text-sm font-mono font-bold text-[#3D2B1F]">{Math.round(result.accuracy * 100)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#B5A99A]">最佳</div>
                    <div className="text-sm font-mono font-bold text-[#3D2B1F]">
                      {comparison.bestRecord
                        ? Math.round((comparison.bestRecord.result as { accuracy?: number }).accuracy ?? 0 * 100)
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
                  {getPersonalFeedback(comparison, "抗干扰训练")}
                </p>
              </motion.div>
            )}

            <div className="rounded-xl border border-[#EDE5DB] bg-[#FAF7F4] p-4">
              <div className="flex items-center justify-between text-xs text-[#B5A99A] mb-2">
                <span>弱</span>
                <span>强</span>
              </div>
              <div className="relative h-3 bg-[#EDE5DB] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, Math.max(5, result.conflictEffectMs / 3))}%`,
                  }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#5A9DE0] to-[#D4847C]"
                />
              </div>
              <p className="text-center text-xs text-[#8B7E74] mt-2">
                {result.conflictEffectMs < 30
                  ? "冲突效应很小，抑制控制能力出色"
                  : result.conflictEffectMs < 80
                  ? "冲突效应适中，属于正常范围"
                  : "冲突效应较大，建议多练习抑制控制训练"}
              </p>
            </div>

            <div className="flex gap-2">
              <ShareButton
                data={{
                  type: "game",
                  gameTitle: "抗干扰训练",
                  gameColor: "#5A9DE0",
                  score: result.conflictEffectMs,
                  scoreLabel: "冲突效应 (ms)",
                  tagline:
                    comparison?.isNewBest
                      ? `第${comparison.totalSessions}次练习 · 新纪录`
                      : comparison?.totalSessions && comparison.totalSessions > 1
                      ? `第${comparison.totalSessions}次练习`
                      : result.conflictEffectMs < 30
                      ? "抑制控制出色"
                      : result.conflictEffectMs < 80
                      ? "表现良好"
                      : "继续练习",
                  gradeLabel: grade?.label || undefined,
                  gaugeProgress: (toPercentile("flanker", "accuracy", result.accuracy) ?? 50) / 100,
                }}
                filename="flanker-result.png"
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
