"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Target, Clock, Award, AlertCircle } from "lucide-react";
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
  endGame,
  updateElapsed,
  calculateResult,
  getCurrentSpeed,
} from "@/core/attention-span/engine";
import type { AttentionGameState, AttentionResult } from "@/core/attention-span/types";
import { ATTENTION_CONFIG } from "@/core/attention-span/config";

export default function AttentionSpanHomepageShell() {
  const [state, setState] = useState<AttentionGameState>(createInitialState);
  const [result, setResult] = useState<AttentionResult | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [comparison, setComparison] = useState<PersonalComparison | null>(null);
  const [dotPos, setDotPos] = useState({ x: 0.5, y: 0.5 });
  useGameAnalytics("attention-span", state.phase);
  const [fingerPos, setFingerPos] = useState<{ x: number; y: number } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const trackingStartTimeRef = useRef<number>(0);

  // Performance Optimization Refs to avoid closure and batching lag
  const dotPosRef = useRef({ x: 0.5, y: 0.5 });
  const fingerPosRef = useRef<{ x: number; y: number } | null>(null);
  const isTrackingRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  const handleStart = useCallback(() => {
    cleanup();
    const s = startGame(createInitialState());
    setState(s);
    setResult(null);
    setGrade(null);
    setComparison(null);
    
    // Sync React states and refs
    setDotPos({ x: 0.5, y: 0.5 });
    dotPosRef.current = { x: 0.5, y: 0.5 };
    setFingerPos(null);
    fingerPosRef.current = null;
    setIsTracking(false);
    isTrackingRef.current = false;
    
    startedAtRef.current = s.startedAt;
    lastTimeRef.current = Date.now();
    
    const angle = Math.random() * Math.PI * 2;
    velocityRef.current = {
      vx: Math.cos(angle) * ATTENTION_CONFIG.baseSpeed,
      vy: Math.sin(angle) * ATTENTION_CONFIG.baseSpeed,
    };
  }, [cleanup]);

  // Separate Side-Effect Handler: Handle result generation, grading and local storage saving cleanly upon game end
  useEffect(() => {
    if (state.phase === "ended" && !result) {
      const gameResult = calculateResult(state);
      setResult(gameResult);
      const g = getGradeForPercentile(gameResult.percentile);
      setGrade(g);
      const record = saveRecord({
        gameId: "attention-span",
        timestamp: Date.now(),
        durationMs: state.startedAt ? Date.now() - state.startedAt : 0,
        result: gameResult,
      });
      const comp = getPersonalComparison("attention-span", record);
      setComparison(comp);
    }
  }, [state.phase, state.startedAt, state.endedAt, state.elapsedMs, result]);

  // Highly optimized animation/tracking game loop running at 60fps without re-binding or frame drops
  useEffect(() => {
    if (state.phase !== "playing") return;

    const animate = () => {
      const now = Date.now();
      const deltaMs = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const startedAt = startedAtRef.current ?? now;
      const elapsedMs = now - startedAt;

      if (elapsedMs >= ATTENTION_CONFIG.maxDurationMs) {
        setState((prev) => endGame(prev));
        return;
      }

      setState((prev) => updateElapsed(prev, elapsedMs));

      const speed = getCurrentSpeed(elapsedMs);
      const speedRatio = speed / ATTENTION_CONFIG.baseSpeed;

      // Physics boundary and position update
      let nx = dotPosRef.current.x + velocityRef.current.vx * speedRatio * (deltaMs / 1000);
      let ny = dotPosRef.current.y + velocityRef.current.vy * speedRatio * (deltaMs / 1000);
      const r = ATTENTION_CONFIG.dotRadius;

      if (nx < r || nx > 1 - r) {
        velocityRef.current.vx *= -1;
        nx = Math.max(r, Math.min(1 - r, nx));
      }
      if (ny < r || ny > 1 - r) {
        velocityRef.current.vy *= -1;
        ny = Math.max(r, Math.min(1 - r, ny));
      }

      const nextDotPos = { x: nx, y: ny };
      dotPosRef.current = nextDotPos;
      setDotPos(nextDotPos);

      // Realtime hit collision check using pointer and dot refs
      const tracking = isTrackingRef.current;
      const finger = fingerPosRef.current;

      if (tracking && finger) {
        const dx = finger.x - nextDotPos.x;
        const dy = finger.y - nextDotPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const hitRadius = ATTENTION_CONFIG.dotRadius + ATTENTION_CONFIG.fingerTolerance;

        if (distance > hitRadius) {
          setState((prev) => endGame(prev));
          isTrackingRef.current = false;
          setIsTracking(false);
          fingerPosRef.current = null;
          setFingerPos(null);
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = Date.now();
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cleanup();
  }, [state.phase, cleanup]);

  // Keyboard accessibility helper for starting/restarting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "SELECT" || target.isContentEditable) {
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        if (state.phase === "idle" || state.phase === "ended") {
          handleStart();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.phase, handleStart]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (state.phase !== "playing") return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Retrieve dot position from ref instantly (no React state stale values)
      const curDotPos = dotPosRef.current;
      const dx = x - curDotPos.x;
      const dy = y - curDotPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const hitRadius = ATTENTION_CONFIG.dotRadius + ATTENTION_CONFIG.fingerTolerance;

      if (distance <= hitRadius) {
        fingerPosRef.current = { x, y };
        setFingerPos({ x, y });
        isTrackingRef.current = true;
        setIsTracking(true);
        trackingStartTimeRef.current = Date.now();
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }
    },
    [state.phase]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isTrackingRef.current || state.phase !== "playing") return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      fingerPosRef.current = { x, y };
      setFingerPos({ x, y });
    },
    [state.phase]
  );

  const handlePointerUp = useCallback(() => {
    if (!isTrackingRef.current || state.phase !== "playing") return;
    const trackingDuration = Date.now() - trackingStartTimeRef.current;
    
    // Tiny quick taps (< 300ms) are not counted as losing, they just stop tracking
    if (trackingDuration < 300) {
      isTrackingRef.current = false;
      setIsTracking(false);
      fingerPosRef.current = null;
      setFingerPos(null);
      return;
    }
    
    isTrackingRef.current = false;
    setIsTracking(false);
    fingerPosRef.current = null;
    setFingerPos(null);
    
    setState((prev) => endGame(prev));
  }, [state.phase]);

  const formatTime = (ms: number) => {
    const sec = Math.floor(ms / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${sec}.${cs.toString().padStart(2, "0")}s`;
  };

  return (
    <GameShell
      title="专注力追踪"
      subtitle="持续注意稳定性评估"
      icon={<Target className="w-4 h-4" />}
      iconColor="#8FB8A8"
      headerAction={
        state.phase === "playing" ? (
          <span className="font-mono text-xs text-[#8B7E74] bg-white border border-[#EDE5DB] rounded-lg px-2.5 py-1">
            {formatTime(state.elapsedMs)}
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
                用手指<span className="text-[#D4847C] font-bold">按住圆点</span>，跟随它移动，不要松手。
              </p>
              <p className="text-xs text-[#B5A99A]">圆点会越来越快，坚持越久专注力越强。</p>
            </div>
            <Button onClick={handleStart} className="btn-coral h-12 px-8 rounded-xl text-base">
              <Play className="w-4 h-4 mr-2" />
              开始测试
            </Button>
          </motion.div>
        )}

        {state.phase === "playing" && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between text-xs text-[#B5A99A] px-1">
              <span>按住圆点，跟随移动</span>
              <span>{isTracking ? "✓ 追踪中" : "点击圆点开始"}</span>
            </div>

            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`relative w-full rounded-2xl border-2 overflow-hidden select-none ${
                isTracking
                  ? "bg-[#E8F0EC] border-[#8FB8A8]"
                  : "bg-[#FAF7F4] border-[#EDE5DB]"
              }`}
              style={{ height: "280px", touchAction: "none", cursor: isTracking ? "none" : "crosshair" }}
            >
              <div className="absolute inset-4 rounded-full border border-dashed border-[#DDD5CC]" />

              <motion.div
                className="absolute rounded-full bg-[#D4847C] shadow-md"
                style={{
                  left: `${dotPos.x * 100}%`,
                  top: `${dotPos.y * 100}%`,
                  width: `${ATTENTION_CONFIG.dotRadius * 2 * 100}%`,
                  height: `${ATTENTION_CONFIG.dotRadius * 2 * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
                animate={{
                  scale: isTracking ? [1, 1.15, 1] : 1,
                }}
                transition={{
                  duration: 0.6,
                  repeat: isTracking ? Infinity : 0,
                }}
              >
                <div className="absolute inset-1 rounded-full bg-white/30" />
              </motion.div>

              {isTracking && fingerPos && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute rounded-full"
                  style={{
                    left: `${fingerPos.x * 100}%`,
                    top: `${fingerPos.y * 100}%`,
                    width: `${ATTENTION_CONFIG.fingerTolerance * 2 * 100}%`,
                    height: `${ATTENTION_CONFIG.fingerTolerance * 2 * 100}%`,
                    transform: "translate(-50%, -50%)",
                    border: "2.5px solid rgba(143, 184, 168, 0.7)",
                    backgroundColor: "rgba(143, 184, 168, 0.15)",
                  }}
                />
              )}
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
              <div className="text-xs text-[#B5A99A] mb-1">持续专注时长</div>
              <div className="text-5xl font-mono font-bold text-[#3D2B1F] mb-1">
                {result.durationSeconds}
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
              <div className="text-[10px] text-[#B5A99A] mt-1.5">{getNormReferenceText("attention-span")}</div>
            </div>

            <div className="text-center text-sm text-[#8B7E74]">{result.description}</div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <ResultItem icon={<Clock className="w-3.5 h-3.5" />} label="坚持时长" value={`${result.durationSeconds}s`} />
              <ResultItem icon={<Award className="w-3.5 h-3.5" />} label="评定等级" value={result.level} />
            </div>

            <RealWorldMapping gameId="attention-span" />

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
                  {getPersonalFeedback(comparison, "专注力追踪")}
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
                  animate={{ width: `${result.percentile}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#D4847C] to-[#8FB8A8]"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <ShareButton
                data={{
                  type: "game",
                  gameTitle: "专注力追踪",
                  gameColor: "#8FB8A8",
                  score: result.durationSeconds,
                  scoreLabel: "持续专注时长 (秒)",
                  tagline:
                    comparison?.isNewBest
                      ? `第${comparison.totalSessions}次练习 · 新纪录`
                      : comparison?.totalSessions && comparison.totalSessions > 1
                      ? `第${comparison.totalSessions}次练习`
                      : result.durationSeconds >= 45
                      ? "专注大师"
                      : result.durationSeconds >= 30
                      ? "高度专注"
                      : result.durationSeconds >= 20
                      ? "良好专注"
                      : result.durationSeconds >= 10
                      ? "需要练习"
                      : "入门阶段",
                  gradeLabel: grade?.label || undefined,
                  gaugeProgress: result.percentile / 100,
                }}
                filename="attention-span-result.png"
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
