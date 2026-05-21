"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Play,
    RotateCcw,
    Zap,
    Timer,
    TrendingUp,
    AlertCircle,
} from "lucide-react";
import { GameShell } from "@/components/game/game-shell";
import { ResultItem } from "@/components/game/result-item";
import { RealWorldMapping } from "@/components/game/real-world-mapping";
import { CommunityCard } from "@/components/game/community-card";
import { useGameAnalytics } from "@/lib/analytics/use-game-analytics";
import { saveRecord } from "@/lib/storage";
import { ShareButton } from "@/components/share/share-dialog";
import { getGradeForPercentile } from "@/lib/scoring/grade";
import {
    getPersonalComparison,
    getPersonalFeedback,
} from "@/lib/scoring/personal-progress";
import { getNormReferenceText } from "@/lib/scoring/norm-reference";
import type { Grade } from "@/lib/scoring/grade";
import type { PersonalComparison } from "@/lib/scoring/personal-progress";
import {
    createInitialState,
    startGame,
    showGreen,
    recordClick,
    recordTooEarly,
    calculateResult,
} from "@/core/reaction-time/engine";
import type {
    ReactionTimeGameState,
    ReactionTimeResult,
} from "@/core/reaction-time/types";
import { REACTION_TIME_CONFIG } from "@/core/reaction-time/config";

export default function ReactionTimeHomepageShell() {
    const [state, setState] =
        useState<ReactionTimeGameState>(createInitialState);
    const [result, setResult] = useState<ReactionTimeResult | null>(null);
    const [grade, setGrade] = useState<Grade | null>(null);
    const [comparison, setComparison] = useState<PersonalComparison | null>(
        null,
    );
    useGameAnalytics("reaction-time", state.phase);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const handleStart = useCallback(() => {
        clearTimer();
        const s = startGame(createInitialState());
        setState(s);
        setResult(null);
        setGrade(null);
        setComparison(null);

        if (s.trials[0]) {
            timerRef.current = setTimeout(() => {
                setState((prev) => showGreen(prev));
            }, s.trials[0].delayMs);
        }
    }, [clearTimer]);

    const handleAreaClick = useCallback(() => {
        setState((prev) => {
            if (prev.phase === "ready") {
                const next = recordClick(prev);
                if (next.phase === "ended") {
                    const gameResult = calculateResult(next.trials);
                    setResult(gameResult);
                    const g = getGradeForPercentile(gameResult.percentile);
                    setGrade(g);
                    const record = saveRecord({
                        gameId: "reaction-time",
                        timestamp: Date.now(),
                        durationMs: prev.startedAt
                            ? Date.now() - prev.startedAt
                            : 0,
                        result: gameResult,
                    });
                    const comp = getPersonalComparison("reaction-time", record);
                    setComparison(comp);
                    return next;
                }
                const trial = next.trials[next.currentTrial];
                if (trial) {
                    timerRef.current = setTimeout(() => {
                        setState((p) => showGreen(p));
                    }, trial.delayMs);
                }
                return next;
            }
            if (prev.phase === "waiting") {
                const next = recordTooEarly(prev);
                if (next.phase === "ended") {
                    const gameResult = calculateResult(next.trials);
                    setResult(gameResult);
                    const g = getGradeForPercentile(gameResult.percentile);
                    setGrade(g);
                    const record = saveRecord({
                        gameId: "reaction-time",
                        timestamp: Date.now(),
                        durationMs: prev.startedAt
                            ? Date.now() - prev.startedAt
                            : 0,
                        result: gameResult,
                    });
                    const comp = getPersonalComparison("reaction-time", record);
                    setComparison(comp);
                    return next;
                }
                const trial = next.trials[next.currentTrial];
                if (trial) {
                    timerRef.current = setTimeout(() => {
                        setState((p) => showGreen(p));
                    }, trial.delayMs);
                }
                return next;
            }
            return prev;
        });
    }, []);

    useEffect(() => {
        return () => clearTimer();
    }, [clearTimer]);

    const trialProgress =
        state.totalTrials > 0
            ? `${Math.min(state.currentTrial + (state.phase === "waiting" || state.phase === "ready" ? 1 : 0), state.totalTrials)} / ${state.totalTrials}`
            : "";

    const getAreaContent = () => {
        switch (state.phase) {
            case "idle":
                return null;
            case "waiting":
                return (
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#D4A832]/15 flex items-center justify-center animate-pulse">
                            <Timer className="w-6 h-6 text-[#D4A832]" />
                        </div>
                        <p className="text-lg font-bold text-[#D4A832]">
                            等待绿色...
                        </p>
                        <p className="text-xs text-[#B5A99A]">
                            屏幕变绿后尽快点击
                        </p>
                    </div>
                );
            case "ready":
                return (
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg"
                        >
                            <Zap className="w-7 h-7 text-[#4AAD7A]" />
                        </motion.div>
                        <p className="text-xl font-extrabold text-white">
                            点击！
                        </p>
                    </div>
                );
            case "too_early":
                return (
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-lg font-bold text-white">点太早了</p>
                        <p className="text-xs text-white/70">
                            等屏幕变绿再点击
                        </p>
                    </div>
                );
            case "ended":
                return null;
        }
    };

    const getAreaStyle = () => {
        switch (state.phase) {
            case "idle":
                return "bg-[#FAF7F4] border-[#EDE5DB]";
            case "waiting":
                return "bg-[#FDF0D9] border-[#E8C496]";
            case "ready":
                return "bg-[#4AAD7A] border-[#4AAD7A] shadow-lg shadow-[rgba(74,173,122,0.3)]";
            case "too_early":
                return "bg-[#C97B7B] border-[#C97B7B]";
            case "ended":
                return "bg-[#FAF7F4] border-[#EDE5DB]";
        }
    };

    return (
        <GameShell
            title="反应速度测试"
            subtitle="处理速度评估"
            icon={<Zap className="w-4 h-4" />}
            iconColor="#D4A832"
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
                                屏幕变
                                <span className="text-[#4AAD7A] font-bold">
                                    绿
                                </span>
                                瞬间，尽快点击屏幕。
                            </p>
                            <p className="text-xs text-[#B5A99A]">
                                共 {REACTION_TIME_CONFIG.totalTrials}{" "}
                                轮，不要预判，等变绿再点。
                            </p>
                        </div>
                        <Button
                            onClick={handleStart}
                            className="btn-coral h-12 px-8 rounded-xl text-base"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            开始测试
                        </Button>
                    </motion.div>
                )}

                {(state.phase === "waiting" ||
                    state.phase === "ready" ||
                    state.phase === "too_early") && (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        <motion.button
                            onClick={handleAreaClick}
                            whileTap={{ scale: 0.97 }}
                            className={`w-full rounded-2xl border-2 transition-all duration-150 cursor-pointer ${getAreaStyle()}`}
                            style={{ height: "280px" }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={state.phase}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.1 }}
                                    className="w-full h-full flex items-center justify-center"
                                >
                                    {getAreaContent()}
                                </motion.div>
                            </AnimatePresence>
                        </motion.button>

                        {state.phase === "too_early" && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-xs text-[#C97B7B]"
                            >
                                下一轮即将开始，耐心等待...
                            </motion.p>
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
                                平均反应时间
                            </div>
                            <div className="text-5xl font-mono font-bold text-[#3D2B1F] mb-1">
                                {result.averageMs}
                                <span className="text-lg text-[#8B7E74] ml-1">
                                    ms
                                </span>
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
                                {getNormReferenceText("reaction-time")}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                            <ResultItem
                                icon={<Zap className="w-3.5 h-3.5" />}
                                label="最快"
                                value={`${result.fastestMs}ms`}
                            />
                            <ResultItem
                                icon={<TrendingUp className="w-3.5 h-3.5" />}
                                label="最慢"
                                value={`${result.slowestMs}ms`}
                            />
                            <ResultItem
                                label="有效轮次"
                                value={`${result.validTrials}/${result.tooEarlyCount > 0 ? `(${result.tooEarlyCount}次预判)` : "5"}`}
                            />
                            <ResultItem
                                label="反应年龄"
                                value={`${result.reactionAge}岁`}
                            />
                        </div>

                        <RealWorldMapping gameId="reaction-time" />

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
                                            {result.percentile}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-[#B5A99A]">
                                            最佳
                                        </div>
                                        <div className="text-sm font-mono font-bold text-[#3D2B1F]">
                                            {comparison.bestRecord
                                                ? ((
                                                      comparison.bestRecord
                                                          .result as {
                                                          percentile?: number;
                                                      }
                                                  ).percentile ?? "-")
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
                                        "反应速度测试",
                                    )}
                                </p>
                            </motion.div>
                        )}

                        <CommunityCard />

                        <div className="rounded-xl border border-[#EDE5DB] bg-[#FAF7F4] p-4">
                            <div className="flex items-center justify-between text-xs text-[#B5A99A] mb-2">
                                <span>慢</span>
                                <span>快</span>
                            </div>
                            <div className="relative h-3 bg-[#EDE5DB] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${Math.min(100, Math.max(5, ((500 - result.averageMs) / 350) * 100))}%`,
                                    }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#D4847C] to-[#4AAD7A]"
                                />
                            </div>
                            <div className="text-center mt-2 text-xs text-[#8B7E74]">
                                {result.averageMs < 220
                                    ? "⚡ 反应速度出色！"
                                    : result.averageMs < 300
                                      ? "👍 反应速度良好"
                                      : "🐢 还有提升空间，多练习试试"}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <ShareButton
                                data={{
                                    type: "game",
                                    gameTitle: "反应速度测试",
                                    gameColor: "#D4A832",
                                    score: result.averageMs,
                                    scoreLabel: "平均反应时间 (ms)",
                                    tagline: comparison?.isNewBest
                                        ? `第${comparison.totalSessions}次练习 · 新纪录`
                                        : comparison?.totalSessions &&
                                            comparison.totalSessions > 1
                                          ? `第${comparison.totalSessions}次练习`
                                          : result.averageMs < 220
                                            ? "闪电反应"
                                            : result.averageMs < 300
                                              ? "反应敏捷"
                                              : "稳中求进",
                                    gradeLabel: grade?.label || undefined,
                                    gaugeProgress: result.percentile / 100,
                                }}
                                filename="reaction-time-result.png"
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
