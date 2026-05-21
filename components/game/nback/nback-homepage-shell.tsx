"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, RotateCcw, MemoryStick, Target, X, Check } from "lucide-react";
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
  advanceToNextTrial,
  calculateResult,
  hideStimulus,
} from "@/core/nback-memory/engine";
import type { NBackGameState, NBackResult } from "@/core/nback-memory/types";
import { NBACK_CONFIG } from "@/core/nback-memory/config";

export default function NbackHomepageShell() {
  const [n, setN] = useState<number>(NBACK_CONFIG.defaultN);
  const [state, setState] = useState<NBackGameState>(createInitialState);
  const [result, setResult] = useState<NBackResult | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [comparison, setComparison] = useState<PersonalComparison | null>(null);
  useGameAnalytics("nback", state.phase);
  const timersRef = useRef<{ hide?: NodeJS.Timeout; auto?: NodeJS.Timeout }>({});

  const handleStart = useCallback(() => {
    const s = startGame(createInitialState(), n);
    setState(s);
    setResult(null);
    setGrade(null);
    setComparison(null);
  }, [n]);

  const handleResponse = useCallback(
    (userSaidMatch: boolean) => {
      clearTimeout(timersRef.current.hide);
      clearTimeout(timersRef.current.auto);

      setState((prev) => {
        if (prev.hasResponded || prev.phase !== "playing") return prev;
        return recordResponse(prev, userSaidMatch);
      });
    },
    []
  );

  // Side-effect handler for game end and trial progression
  useEffect(() => {
    if (state.phase === "ended" && !result) {
      const r = calculateResult(state.responses, state.n);
      setResult(r);
      const g = getGradeForMetric("nback-memory", "dPrime", r.dPrime);
      setGrade(g);
      const record = saveRecord({
        gameId: "nback-memory",
        timestamp: Date.now(),
        durationMs: state.startedAt ? Date.now() - state.startedAt : 0,
        result: r,
      });
      const comp = getPersonalComparison("nback-memory", record);
      setComparison(comp);
    } else if (state.phase === "playing" && state.hasResponded) {
      const delayTimer = setTimeout(() => {
        setState((p) => advanceToNextTrial(p));
      }, NBACK_CONFIG.postResponseDelayMs);
      return () => clearTimeout(delayTimer);
    }
  }, [state.phase, state.hasResponded, state.responses, state.n, state.startedAt, result]);

  // Timer effect for stimulus display and auto-advance
  useEffect(() => {
    if (state.phase !== "playing" || !state.trialStartedAt) return;
    if (state.hasResponded) return;

    timersRef.current.hide = setTimeout(() => {
      setState((prev) => {
        if (prev.hasResponded) return prev;
        return hideStimulus(prev);
      });
    }, NBACK_CONFIG.stimulusDurationMs);

    timersRef.current.auto = setTimeout(() => {
      setState((prev) => {
        if (prev.hasResponded || prev.phase !== "playing") return prev;
        return recordResponse(prev, false, true); // Mark as timeout
      });
    }, NBACK_CONFIG.interStimulusIntervalMs);

    return () => {
      clearTimeout(timersRef.current.hide);
      clearTimeout(timersRef.current.auto);
    };
  }, [state.phase, state.trialStartedAt, state.hasResponded]);

  // Keyboard navigation for Accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Skip if user is typing in a form input/select
      if (target.tagName === "INPUT" || target.tagName === "SELECT" || target.isContentEditable) {
        return;
      }

      if (state.phase === "playing" && !state.hasResponded) {
        if (e.key === "f" || e.key === "F" || e.key === "ArrowLeft") {
          e.preventDefault();
          handleResponse(false); // different
        } else if (e.key === "j" || e.key === "J" || e.key === "ArrowRight") {
          e.preventDefault();
          handleResponse(true); // same
        }
      } else if (e.key === " ") {
        e.preventDefault();
        if (state.phase === "idle" || state.phase === "ended") {
          handleStart();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.phase, state.hasResponded, handleResponse, handleStart]);


  const progress = state.trials.length > 0 ? (state.currentIndex / state.trials.length) * 100 : 0;
  const currentTrial = state.phase === "playing" && state.currentIndex < state.trials.length
    ? state.trials[state.currentIndex]
    : null;

  return (
    <GameShell
      title="工作记忆"
      subtitle="N-Back · 工作记忆容量评估"
      icon={<MemoryStick className="w-4 h-4" />}
      iconColor="#D4A832"
      headerAction={
        state.phase === "playing" ? (
          <Badge variant="outline" className="font-mono text-xs border-[#EDE5DB] text-[#8B7E74] bg-white">
            {state.currentIndex + 1} / {state.trials.length}
          </Badge>
        ) : undefined
      }
      progressBar={
        state.phase === "playing" ? (
          <div className="mb-4 sm:mb-5">
            <Progress value={progress} className="h-1.5 bg-[#F5EDE5] [&>div]:bg-gradient-to-r [&>div]:from-[#8FB8A8] [&>div]:to-[#A8D0C0]" />
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
                记住方块位置，判断当前是否与 <span className="text-[#D4847C] font-mono font-bold">N</span> 步前相同。
              </p>
              <p className="text-xs text-[#B5A99A]">刺激只显示 0.5 秒，前 {n} 轮无需作答。</p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-[#8B7E74]">N 值</span>
              <Select value={String(n)} onValueChange={(v) => setN(Number(v))}>
                <SelectTrigger className="w-24 bg-white border-[#EDE5DB] text-[#3D2B1F] rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#EDE5DB] rounded-xl">
                  {[1, 2, 3, 4].map((level) => (
                    <SelectItem key={level} value={String(level)} className="text-[#3D2B1F] focus:bg-[#F5EDE5] focus:text-[#3D2B1F] rounded-lg">
                      {level}-Back
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            className="space-y-4 sm:space-y-5"
          >
            <div className="text-center">
              <p className="text-sm text-[#8B7E74]">
                第 <span className="font-mono text-[#D4847C]">{state.currentIndex + 1}</span> 轮
                <span className="mx-2 text-[#DDD5CC]">|</span>
                对比 N=<span className="font-mono text-[#D4847C]">{state.n}</span> 步之前
              </p>
              {state.currentIndex < state.n && (
                <p className="text-xs text-[#B5A99A] mt-1">前 {state.n} 轮观察即可，无需作答</p>
              )}
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 p-4 sm:p-5 rounded-2xl border border-[#EDE5DB] bg-[#FAF7F4]">
                {Array.from({ length: 9 }, (_, i) => {
                  const isActive = state.stimulusVisible && currentTrial.stimulus.position === i;

                  return (
                    <motion.div
                      key={i}
                      animate={isActive ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className={`
                        w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 flex items-center justify-center transition-all duration-150
                        ${isActive
                          ? "bg-[#8FB8A8] border-[#A8D0C0] shadow-lg shadow-[rgba(143,184,168,0.2)]"
                          : "bg-white border-[#EDE5DB]"
                        }
                      `}
                    >
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#A8D0C0] shadow-inner"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 max-w-40">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={state.hasResponded}
                  className="w-full h-14 rounded-xl border-[#EDE5DB] bg-white text-[#8B7E74] hover:bg-[#FAF7F4] hover:text-[#5A4A3F] hover:border-[rgba(201,123,123,0.3)] text-base disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => handleResponse(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  不同
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 max-w-40">
                <Button
                  size="lg"
                  disabled={state.hasResponded}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#8FB8A8] to-[#7AA898] hover:from-[#7FAE9E] hover:to-[#6A9888] text-white shadow-md shadow-[rgba(143,184,168,0.2)] text-base disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => handleResponse(true)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  相同
                </Button>
              </motion.div>
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
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3D2B1F]">测试完成</h3>
              <p className="text-xs text-[#B5A99A] mt-1">N = {result.n}</p>
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
              <div className="text-[10px] text-[#B5A99A] mt-1.5">{getNormReferenceText("nback-memory")}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <ResultItem icon={<Target className="w-3.5 h-3.5" />} label="正确率" value={`${(result.accuracy * 100).toFixed(0)}%`} />
              <ResultItem icon={<MemoryStick className="w-3.5 h-3.5" />} label="d' 值" value={`${result.dPrime}`} />
              <ResultItem icon={<X className="w-3.5 h-3.5" />} label="漏报" value={`${result.misses}`} />
              <ResultItem icon={<Check className="w-3.5 h-3.5" />} label="误报" value={`${result.falseAlarms}`} />
            </div>

            <RealWorldMapping gameId="nback-memory" />

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
                    <div className="text-sm font-mono font-bold text-[#3D2B1F]">{result.dPrime.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#B5A99A]">最佳</div>
                    <div className="text-sm font-mono font-bold text-[#3D2B1F]">
                      {comparison.bestRecord
                        ? ((comparison.bestRecord.result as { dPrime?: number }).dPrime ?? 0).toFixed(2)
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
                  {getPersonalFeedback(comparison, "工作记忆")}
                </p>
              </motion.div>
            )}

            <div className="flex items-center justify-center gap-3 py-1">
              <span className="text-sm text-[#8B7E74]">难度 N</span>
              <Select value={String(n)} onValueChange={(v) => setN(Number(v))}>
                <SelectTrigger className="w-24 bg-white border-[#EDE5DB] text-[#3D2B1F] rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#EDE5DB] rounded-xl">
                  {Array.from({ length: NBACK_CONFIG.maxN - NBACK_CONFIG.minN + 1 }, (_, i) => i + NBACK_CONFIG.minN).map((level) => (
                    <SelectItem key={level} value={String(level)} className="text-[#3D2B1F] focus:bg-[#F5EDE5] focus:text-[#3D2B1F] rounded-lg">
                      {level}-Back
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <ShareButton
                data={{
                  type: "game",
                  gameTitle: "工作记忆",
                  gameColor: "#D4A832",
                  score: Math.round(result.accuracy * 100),
                  scoreLabel: "正确率 (%)",
                  tagline:
                    comparison?.isNewBest
                      ? `第${comparison.totalSessions}次练习 · 新纪录`
                      : comparison?.totalSessions && comparison.totalSessions > 1
                      ? `第${comparison.totalSessions}次练习`
                      : result.accuracy >= 0.9
                      ? "记忆达人"
                      : result.accuracy >= 0.7
                      ? "表现良好"
                      : "继续加油",
                  gradeLabel: grade?.label || undefined,
                  gaugeProgress: (toPercentile("nback-memory", "dPrime", result.dPrime) ?? 50) / 100,
                }}
                filename="nback-result.png"
              />
              <Button onClick={handleStart} className="flex-1 h-12 btn-coral rounded-xl text-base">
                <RotateCcw className="w-4 h-4 mr-2" />
                {n === result.n ? "再测一次" : `开始 ${n}-Back 测试`}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
