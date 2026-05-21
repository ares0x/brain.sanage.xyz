"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, Clock, Target, BrainCircuit } from "lucide-react";
import { GameShell } from "@/components/game/game-shell";
import { ResultItem } from "@/components/game/result-item";
import { RealWorldMapping } from "@/components/game/real-world-mapping";
import { useGameAnalytics } from "@/lib/analytics/use-game-analytics";
import { saveRecord } from "@/lib/storage";
import { ShareButton } from "@/components/share/share-dialog";
import { getGradeForMetric } from "@/lib/scoring/grade";
import {
    getPersonalComparison,
    getPersonalFeedback,
} from "@/lib/scoring/personal-progress";
import { getNormReferenceText } from "@/lib/scoring/norm-reference";
import { toPercentile } from "@/lib/cognitive-report/norms";
import type { Grade } from "@/lib/scoring/grade";
import type { PersonalComparison } from "@/lib/scoring/personal-progress";
import {
    createInitialState,
    startGame,
    submitAnswer,
    calculateDetailedResult,
} from "@/core/stroop-game/engine";
import type {
    StroopGameState,
    StroopColor,
    StroopResult,
} from "@/core/stroop-game/types";
import { STROOP_COLORS } from "@/core/stroop-game/config";

function cnColorClass(color: StroopColor): string {
    const map: Record<StroopColor, string> = {
        red: "text-[#E05A5A]",
        green: "text-[#4AAD7A]",
        blue: "text-[#5A9DE0]",
        yellow: "text-[#D4A832]",
        purple: "text-[#A87AD4]",
    };
    return map[color] || "";
}

function cnColorBg(color: StroopColor): string {
    const map: Record<StroopColor, string> = {
        red: "bg-[#E05A5A] hover:bg-[#E05A5A]/90 active:bg-[#E05A5A]/80",
        green: "bg-[#4AAD7A] hover:bg-[#4AAD7A]/90 active:bg-[#4AAD7A]/80",
        blue: "bg-[#5A9DE0] hover:bg-[#5A9DE0]/90 active:bg-[#5A9DE0]/80",
        yellow: "bg-[#D4A832] hover:bg-[#D4A832]/90 active:bg-[#D4A832]/80",
        purple: "bg-[#A87AD4] hover:bg-[#A87AD4]/90 active:bg-[#A87AD4]/80",
    };
    return map[color] || "";
}

export default function StroopHomepageShell() {
    const [state, setState] = useState<StroopGameState>(createInitialState);
    const [result, setResult] = useState<StroopResult | null>(null);
    const [grade, setGrade] = useState<Grade | null>(null);
    const [comparison, setComparison] = useState<PersonalComparison | null>(
        null,
    );
    useGameAnalytics("stroop-test", state.phase);

    const handleStart = useCallback(() => {
        const s = startGame(createInitialState());
        setState(s);
        setResult(null);
        setGrade(null);
        setComparison(null);
    }, []);

    const handleAnswer = useCallback((color: StroopColor) => {
        setState((prev) => {
            const next = submitAnswer(prev, color);
            if (next.phase === "ended") {
                const gameResult = calculateDetailedResult(
                    next.questions,
                    next.answers,
                );
                setResult(gameResult);
                const g = getGradeForMetric(
                    "stroop-test",
                    "accuracy",
                    gameResult.accuracy,
                );
                setGrade(g);
                const record = saveRecord({
                    gameId: "stroop-test",
                    timestamp: Date.now(),
                    durationMs: prev.startedAt
                        ? Date.now() - prev.startedAt
                        : 0,
                    result: gameResult,
                });
                const comp = getPersonalComparison("stroop-test", record);
                setComparison(comp);
            }
            return next;
        });
    }, []);



    const currentQuestion =
        state.phase === "playing" && state.currentIndex < state.questions.length
            ? state.questions[state.currentIndex]
            : null;

    const progress =
        state.questions.length > 0
            ? (state.currentIndex / state.questions.length) * 100
            : 0;

    return (
        <GameShell
            title="专注拉回 - Stroop"
            subtitle="Stroop · 认知抑制训练"
            icon={<BrainCircuit className="w-4 h-4" />}
            iconColor="#E05A5A"
            headerAction={
                state.phase === "playing" ? (
                    <Badge
                        variant="outline"
                        className="font-mono text-xs border-[#EDE5DB] text-[#8B7E74] bg-white"
                    >
                        {state.currentIndex + 1} / {state.questions.length}
                    </Badge>
                ) : undefined
            }
            progressBar={
                state.phase === "playing" ? (
                    <div className="mb-4 sm:mb-5">
                        <Progress
                            value={progress}
                            className="h-1.5 bg-[#F5EDE5] [&>div]:bg-gradient-to-r [&>div]:from-[#D4847C] [&>div]:to-[#E8A8A0]"
                        />
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
                                请说出文字显示的
                                <span className="text-[#D4847C] font-medium">
                                    颜色
                                </span>
                                ，而不是文字本身的含义。
                            </p>
                            <p className="text-xs text-[#B5A99A]">
                                共 20 题，越快越准得分越高。
                            </p>
                        </div>
                        <Button
                            onClick={handleStart}
                            className="btn-coral h-12 sm:h-14 px-8 rounded-xl text-base"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            开始测试
                        </Button>
                    </motion.div>
                )}

                {state.phase === "playing" && currentQuestion && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-5 sm:space-y-6"
                    >
                        <div className="flex items-center justify-center py-6 sm:py-8">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={state.currentIndex}
                                    initial={{ opacity: 0, scale: 0.85, y: 8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                                    transition={{ duration: 0.18 }}
                                    className={`text-6xl sm:text-7xl font-extrabold select-none font-sans ${cnColorClass(
                                        currentQuestion.ink,
                                    )}`}
                                >
                                    {
                                        STROOP_COLORS.find(
                                            (c) =>
                                                c.key === currentQuestion.word,
                                        )?.label
                                    }
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                            {STROOP_COLORS.map((c) => (
                                <motion.div
                                    key={c.key}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.96 }}
                                >
                                    <Button
                                        className={`w-full h-14 sm:h-[3.25rem] text-white font-semibold text-base rounded-xl shadow-md ${cnColorBg(c.key)}`}
                                        onClick={() => handleAnswer(c.key)}
                                    >
                                        {c.label}
                                    </Button>
                                </motion.div>
                            ))}
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
                            <h3 className="font-serif text-lg font-bold text-[#3D2B1F]">
                                测试完成
                            </h3>
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
                                    <span
                                        className="text-sm font-bold"
                                        style={{ color: grade.color }}
                                    >
                                        {grade.label}
                                    </span>
                                    <span className="text-[10px] text-[#B5A99A]">
                                        基于文献参考标准
                                    </span>
                                </motion.div>
                            )}
                            <div className="text-[10px] text-[#B5A99A] mt-1.5">
                                {getNormReferenceText("stroop-test")}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                            <ResultItem
                                icon={<Target className="w-3.5 h-3.5" />}
                                label="正确率"
                                value={`${(result.accuracy * 100).toFixed(0)}%`}
                            />
                            <ResultItem
                                icon={<Clock className="w-3.5 h-3.5" />}
                                label="平均反应"
                                value={`${result.averageReactionTimeMs}ms`}
                            />
                            <ResultItem
                                label="一致题正确率"
                                value={`${(result.congruentAccuracy * 100).toFixed(0)}%`}
                            />
                            <ResultItem
                                label="冲突题正确率"
                                value={`${(result.incongruentAccuracy * 100).toFixed(0)}%`}
                            />
                        </div>

                        <RealWorldMapping gameId="stroop-test" />

                        {comparison && (
                            <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="rounded-xl border border-[#EDE5DB] bg-[#FAF7F4] p-3.5 space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-[#8B7E74]">
                                        第 {comparison.totalSessions} 次练习
                                    </span>
                                    {comparison.isNewBest && (
                                        <span className="text-[10px] font-bold text-[#D4A832] bg-[#D4A83212] px-2 py-0.5 rounded-full">
                                            新纪录
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <div className="text-[10px] text-[#B5A99A]">
                                            本次
                                        </div>
                                        <div className="text-sm font-mono font-bold text-[#3D2B1F]">
                                            {Math.round(result.accuracy * 100)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-[#B5A99A]">
                                            最佳
                                        </div>
                                        <div className="text-sm font-mono font-bold text-[#3D2B1F]">
                                            {comparison.bestRecord
                                                ? Math.round(
                                                      (
                                                          comparison.bestRecord
                                                              .result as {
                                                              accuracy?: number;
                                                          }
                                                      ).accuracy ?? 0 * 100,
                                                  )
                                                : "-"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-[#B5A99A]">
                                            近5次平均
                                        </div>
                                        <div className="text-sm font-mono font-bold text-[#3D2B1F]">
                                            {comparison.recentAverage ?? "-"}
                                        </div>
                                    </div>
                                </div>
                                {comparison.trend !== "first" &&
                                    comparison.trendDeltaPercent !== null && (
                                        <div className="text-center">
                                            <span
                                                className={`text-xs font-medium ${
                                                    comparison.trend === "up"
                                                        ? "text-[#4AAD7A]"
                                                        : comparison.trend ===
                                                            "down"
                                                          ? "text-[#D4847C]"
                                                          : "text-[#8B7E74]"
                                                }`}
                                            >
                                                {comparison.trend === "up"
                                                    ? "↑"
                                                    : comparison.trend ===
                                                        "down"
                                                      ? "↓"
                                                      : "→"}{" "}
                                                {Math.abs(
                                                    comparison.trendDeltaPercent,
                                                )}
                                                % 比上次
                                            </span>
                                        </div>
                                    )}
                                <p className="text-xs text-[#8B7E74] text-center leading-relaxed">
                                    {getPersonalFeedback(
                                        comparison,
                                        "专注拉回",
                                    )}
                                </p>
                            </motion.div>
                        )}

                        <div className="flex gap-2">
                            <ShareButton
                                data={{
                                    type: "game",
                                    gameTitle: "专注拉回",
                                    gameColor: "#E05A5A",
                                    score: Math.round(result.accuracy * 100),
                                    scoreLabel: "正确率 (%)",
                                    tagline: comparison?.isNewBest
                                        ? `第${comparison.totalSessions}次练习 · 新纪录`
                                        : comparison?.totalSessions &&
                                            comparison.totalSessions > 1
                                          ? `第${comparison.totalSessions}次练习`
                                          : result.accuracy >= 0.9
                                            ? "认知抑制出色"
                                            : result.accuracy >= 0.7
                                              ? "表现良好"
                                              : "继续加油",
                                    gradeLabel: grade?.label || undefined,
                                    gaugeProgress:
                                        (toPercentile(
                                            "stroop-test",
                                            "accuracy",
                                            result.accuracy,
                                        ) ?? 50) / 100,
                                }}
                                filename="stroop-result.png"
                            />
                            <Button
                                onClick={handleStart}
                                className="flex-1 h-12 btn-coral rounded-xl text-base"
                            >
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
