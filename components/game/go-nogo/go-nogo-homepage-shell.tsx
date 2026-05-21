"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Shield, Target, Zap, AlertCircle, CheckCircle } from "lucide-react";
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
  recordResponse,
  recordMiss,
  advanceTrial,
  calculateResult,
} from "@/core/go-nogo/engine";
import type { GoNogoGameState, GoNogoResult, TrialType } from "@/core/go-nogo/types";
import { GO_NOGO_CONFIG } from "@/core/go-nogo/config";

export default function GoNogoHomepageShell() {
  const [state, setState] = useState<GoNogoGameState>(createInitialState);
  const [result, setResult] = useState<GoNogoResult | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [comparison, setComparison] = useState<PersonalComparison | null>(null);
  useGameAnalytics("go-nogo", state.phase);
  const timersRef = useRef<{ stimulus?: NodeJS.Timeout; feedback?: NodeJS.Timeout }>({});

  const clearTimers = useCallback(() => {
    if (timersRef.current.stimulus) {
      clearTimeout(timersRef.current.stimulus);
      timersRef.current.stimulus = undefined;
    }
    if (timersRef.current.feedback) {
      clearTimeout(timersRef.current.feedback);
      timersRef.current.feedback = undefined;
    }
  }, []);

  const scheduleStimulusTimeout = useCallback((currentState: GoNogoGameState) => {
    timersRef.current.stimulus = setTimeout(() => {
      setState((prev) => {
        // Only process if we're still on the same trial
        if (prev.phase !== "stimulus" || prev.currentTrial !== currentState.currentTrial) return prev;
        const next = recordMiss(prev);
        scheduleFeedback(next);
        return next;
      });
    }, GO_NOGO_CONFIG.stimulusDurationMs);
  }, []);

  const scheduleFeedback = useCallback((afterState: GoNogoGameState) => {
    if (afterState.phase === "ended") {
      const gameResult = calculateResult(afterState);
      setResult(gameResult);
      const g = getGradeForPercentile(gameResult.percentile);
      setGrade(g);
      const record = saveRecord({
        gameId: "go-nogo",
        timestamp: Date.now(),
        durationMs: afterState.startedAt ? Date.now() - afterState.startedAt : 0,
        result: gameResult,
      });
      const comp = getPersonalComparison("go-nogo", record);
      setComparison(comp);
      return;
    }

    timersRef.current.feedback = setTimeout(() => {
      timersRef.current.feedback = undefined;
      setState((prev) => {
        if (prev.phase !== "feedback") return prev;
        const next = advanceTrial(prev);
        if (next.phase === "ended") {
          const gameResult = calculateResult(next);
          setResult(gameResult);
          const g = getGradeForPercentile(gameResult.percentile);
          setGrade(g);
          const record = saveRecord({
            gameId: "go-nogo",
            timestamp: Date.now(),
            durationMs: next.startedAt ? Date.now() - next.startedAt : 0,
            result: gameResult,
          });
          const comp = getPersonalComparison("go-nogo", record);
          setComparison(comp);
        } else if (next.phase === "stimulus") {
          scheduleStimulusTimeout(next);
        }
        return next;
      });
    }, 400);
  }, [scheduleStimulusTimeout]);

  const handleStart = useCallback(() => {
    clearTimers();
    const s = startGame(createInitialState());
    setState(s);
    setResult(null);
    setGrade(null);
    setComparison(null);
    scheduleStimulusTimeout(s);
  }, [clearTimers, scheduleStimulusTimeout]);

  const handleResponse = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "stimulus") return prev;
      clearTimers();
      const next = recordResponse(prev);
      scheduleFeedback(next);
      return next;
    });
  }, [clearTimers, scheduleFeedback]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const currentTrialType: TrialType | null =
    state.phase === "stimulus" || state.phase === "feedback"
      ? state.trials[state.currentTrial]?.type ?? null
      : null;

  const currentOutcome =
    state.phase === "feedback"
      ? state.trials[state.currentTrial]?.outcome
      : null;

  const trialProgress = state.totalTrials > 0
    ? `${Math.min(state.currentTrial + (state.phase === "stimulus" ? 1 : 0), state.totalTrials)} / ${state.totalTrials}`
    : "";

  const isGoTrial = currentTrialType === "go";
  const isNoGoTrial = currentTrialType === "no-go";

  return (
    <GameShell
      title="冲动控制"
      subtitle="Go / No-Go · 抑制控制训练"
      icon={<Shield className="w-4 h-4" />}
      iconColor="#D4847C"
      headerAction={
        state.phase !== "idle" && state.phase !== "ended" ? (
          <span className="font-mono text-xs text-[#8B7E74] bg-white border border-[#EDE5DB] rounded-lg px-2.5 py-1">
            {trialProgress}
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
                看到<span className="text-[#4AAD7A] font-bold">绿色</span>请点击，看到<span className="text-[#C97B7B] font-bold">红色</span>请不要点击。
              </p>
              <p className="text-xs text-[#B5A99A]">
                共 {GO_NOGO_CONFIG.totalTrials} 轮，测试你的冲动控制能力。
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-[#8B7E74]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#4AAD7A]" />
                <span>按</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#C97B7B]" />
                <span>不按</span>
              </div>
            </div>

            <Button onClick={handleStart} className="btn-coral h-12 px-8 rounded-xl text-base">
              <Play className="w-4 h-4 mr-2" />
              开始测试
            </Button>
          </motion.div>
        )}

        {(state.phase === "stimulus" || state.phase === "feedback") && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Instruction hint */}
            <div className="text-center">
              <p className="text-xs text-[#B5A99A]">
                {isGoTrial ? "点击屏幕" : "不要点击"}
              </p>
            </div>

            {/* Stimulus area */}
            <motion.button
              onClick={handleResponse}
              whileTap={isGoTrial ? { scale: 0.95 } : undefined}
              className={`w-full rounded-2xl border-2 transition-all duration-150 flex items-center justify-center relative overflow-hidden ${
                isGoTrial
                  ? "bg-[#E8F5EE] border-[#4AAD7A] cursor-pointer"
                  : isNoGoTrial
                  ? "bg-[#FBEAEA] border-[#C97B7B]"
                  : "bg-[#FAF7F4] border-[#EDE5DB]"
              }`}
              style={{ height: "280px" }}
            >
              <AnimatePresence mode="wait">
                {state.phase === "stimulus" && (
                  <motion.div
                    key="stimulus"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center justify-center gap-4"
                  >
                    <div
                      className={`w-28 h-28 rounded-full flex items-center justify-center shadow-lg ${
                        isGoTrial
                          ? "bg-[#4AAD7A] shadow-[rgba(74,173,122,0.3)]"
                          : "bg-[#C97B7B] shadow-[rgba(201,123,123,0.3)]"
                      }`}
                    >
                      {isGoTrial ? (
                        <Zap className="w-12 h-12 text-white" />
                      ) : (
                        <Shield className="w-12 h-12 text-white" />
                      )}
                    </div>
                  </motion.div>
                )}

                {state.phase === "feedback" && currentOutcome && (
                  <motion.div
                    key="feedback"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center justify-center gap-3"
                  >
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center ${
                        currentOutcome === "hit" || currentOutcome === "correct_reject"
                          ? "bg-[#E8F5EE]"
                          : "bg-[#FBEAEA]"
                      }`}
                    >
                      {currentOutcome === "hit" || currentOutcome === "correct_reject" ? (
                        <CheckCircle className="w-10 h-10 text-[#4AAD7A]" />
                      ) : (
                        <AlertCircle className="w-10 h-10 text-[#C97B7B]" />
                      )}
                    </div>
                    <p
                      className={`text-lg font-bold ${
                        currentOutcome === "hit" || currentOutcome === "correct_reject"
                          ? "text-[#4AAD7A]"
                          : "text-[#C97B7B]"
                      }`}
                    >
                      {currentOutcome === "hit" && "正确"}
                      {currentOutcome === "miss" && "漏按"}
                      {currentOutcome === "correct_reject" && "正确"}
                      {currentOutcome === "false_alarm" && "误触"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mini progress */}
            <div className="flex gap-1 justify-center">
              {state.trials.slice(0, Math.min(state.currentTrial + 1, state.totalTrials)).map((t, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    t.outcome === "hit" || t.outcome === "correct_reject"
                      ? "bg-[#4AAD7A]"
                      : t.outcome === "miss" || t.outcome === "false_alarm"
                      ? "bg-[#C97B7B]"
                      : "bg-[#EDE5DB]"
                  }`}
                />
              ))}
            </div>
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
              <div className="text-xs text-[#B5A99A] mb-1">综合正确率</div>
              <div className="text-5xl font-mono font-bold text-[#3D2B1F] mb-1">
                {result.overallAccuracy}
                <span className="text-lg text-[#8B7E74] ml-1">%</span>
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
              <div className="text-[10px] text-[#B5A99A] mt-1.5">{getNormReferenceText("go-nogo")}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <ResultItem icon={<Zap className="w-3.5 h-3.5" />} label="Go 正确率" value={`${result.goAccuracy}%`} />
              <ResultItem icon={<Shield className="w-3.5 h-3.5" />} label="No-Go 正确率" value={`${result.noGoAccuracy}%`} />
              <ResultItem icon={<Target className="w-3.5 h-3.5" />} label="误触率" value={`${result.falseAlarmRate}%`} />
              <ResultItem label="平均反应" value={`${result.averageRtMs}ms`} />
            </div>

            <RealWorldMapping gameId="go-nogo" />

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
                  {getPersonalFeedback(comparison, "冲动控制")}
                </p>
              </motion.div>
            )}

            {result.dPrime !== null && (
              <div className="rounded-xl border border-[#EDE5DB] bg-[#FAF7F4] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#8B7E74]">敏感度 d&apos;</span>
                  <span className="text-sm font-bold text-[#3D2B1F]">{result.dPrime.toFixed(2)}</span>
                </div>
                <div className="relative h-3 bg-[#EDE5DB] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(5, (result.dPrime / 3) * 100))}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#D4847C] to-[#4AAD7A]"
                  />
                </div>
                <div className="text-center mt-2 text-xs text-[#8B7E74]">
                  {result.dPrime > 2.5
                    ? "抑制控制能力卓越"
                    : result.dPrime > 1.5
                    ? "抑制控制能力良好"
                    : "继续练习提升抑制控制"}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <ShareButton
                data={{
                  type: "game",
                  gameTitle: "冲动控制",
                  gameColor: "#D4847C",
                  score: result.overallAccuracy,
                  scoreLabel: "综合正确率 (%)",
                  tagline:
                    comparison?.isNewBest
                      ? `第${comparison.totalSessions}次练习 · 新纪录`
                      : comparison?.totalSessions && comparison.totalSessions > 1
                      ? `第${comparison.totalSessions}次练习`
                      : result.level,
                  gradeLabel: grade?.label || undefined,
                  gaugeProgress: result.percentile / 100,
                }}
                filename="go-nogo-result.png"
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
