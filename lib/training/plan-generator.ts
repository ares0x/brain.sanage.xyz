/**
 * Daily training plan generator.
 *
 * Recommends 2–3 games per day based on:
 * 1. Weak dimensions (lowest cognitive scores get priority)
 * 2. Recency (avoid games played today)
 * 3. Variety (avoid the same game on consecutive days)
 */

import { getRecords } from "@/lib/storage";
import { generateCognitiveReport } from "@/lib/cognitive-report";
import type { GameId } from "@/lib/storage/types";
import type { DailyPlan, PlanTask, CohortPersona } from "./types";
import { GAMES_META } from "@/config/games";
import { getRecommendedTrack } from "@/config/curriculums";

const ICON_NAME_MAP: Record<GameId, string> = {
  "reaction-time": "Gauge",
  "attention-span": "Target",
  flanker: "Target",
  "task-switching": "BrainCircuit",
  "stroop-test": "Brain",
  "schulte-grid": "Grid3X3",
  "nback-memory": "MemoryStick",
  "digit-span": "BrainCircuit",
  "breathing-478": "Wind",
  "go-nogo": "Shield",
  "focus-gaze": "Eye",
};

const DIMENSION_GAMES: Record<string, GameId[]> = {
  attention: ["attention-span", "flanker", "schulte-grid"],
  memory: ["nback-memory", "digit-span"],
  processingSpeed: ["reaction-time", "stroop-test"],
  executiveFunction: ["task-switching", "stroop-test", "go-nogo"],
  emotionalRegulation: ["breathing-478", "focus-gaze"],
};


function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function getLastNDays(n: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

/**
 * Generate or retrieve today's training plan.
 */
export function getTodayPlan(): DailyPlan {
  const stored = getStoredPlan();
  const today = todayStr();

  if (stored && stored.date === today) {
    // Sync completion status with actual game records
    return syncPlanWithRecords(stored);
  }

  return generatePlan(today);
}

/**
 * Mark a plan task as completed.
 */
export function completeTask(plan: DailyPlan, gameId: GameId, recordId?: string): DailyPlan {
  const updated: DailyPlan = {
    ...plan,
    tasks: plan.tasks.map((t) =>
      t.gameId === gameId ? { ...t, completed: true, recordId } : t
    ),
  };

  updated.allCompleted = updated.tasks.every((t) => t.completed);
  if (updated.allCompleted && !updated.completedAt) {
    updated.completedAt = Date.now();
  }

  storePlan(updated);
  return updated;
}

// ------------------------------------------------------------------
// Internal
// ------------------------------------------------------------------

const PLAN_KEY = "bs_daily_plan_v1";
export const PERSONA_KEY = "bs_onboarding_persona";

export function getStoredPersona(): CohortPersona | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PERSONA_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CohortPersona;
  } catch {
    return null;
  }
}

function getStoredPlan(): DailyPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PLAN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DailyPlan;
  } catch {
    return null;
  }
}

function storePlan(plan: DailyPlan): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
}

function syncPlanWithRecords(plan: DailyPlan): DailyPlan {
  const today = todayStr();
  const todayStart = new Date(today).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  const records = getRecords({ since: todayStart, until: todayEnd });
  const playedGameIds = new Set(records.map((r) => r.gameId));

  const synced: DailyPlan = {
    ...plan,
    tasks: plan.tasks.map((t) => {
      if (t.completed) return t;
      const matchingRecord = records.find((r) => r.gameId === t.gameId);
      if (matchingRecord) {
        return {
          ...t,
          completed: true,
          recordId: matchingRecord.id,
        };
      }
      return t;
    }),
  };

  synced.allCompleted = synced.tasks.every((t) => t.completed);
  if (synced.allCompleted && !synced.completedAt) {
    synced.completedAt = Date.now();
  }

  storePlan(synced);
  return synced;
}

function generatePlan(date: string): DailyPlan {
  const records = getRecords();
  const report = generateCognitiveReport(records);

  // If the user has an onboarding persona and has NO game records, use the curriculum track!
  const persona = getStoredPersona();
  if (records.length === 0 && persona) {
    const track = getRecommendedTrack(persona.role, persona.goal);
    const selected: PlanTask[] = [];
    for (const item of track.games) {
      const meta = GAMES_META[item.gameId];
      if (!meta) continue;
      selected.push({
        gameId: item.gameId,
        gameTitle: meta.title,
        gameIcon: ICON_NAME_MAP[item.gameId] || "Zap",
        gameColor: meta.color,
        reason: item.reason,
        estimatedMinutes: meta.minutes,
        completed: false,
      });
    }

    if (selected.length > 0) {
      const plan: DailyPlan = {
        date,
        tasks: selected,
        allCompleted: selected.every((t) => t.completed),
      };
      storePlan(plan);
      return plan;
    }
  }

  // Determine weak dimensions (prioritise those with data)
  const weakDimensions = report
    ? [...report.dimensions].sort((a, b) => a.score - b.score)
    : [];

  // Games played today
  const todayStart = new Date(date).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;
  const todayRecords = getRecords({ since: todayStart, until: todayEnd });
  const playedToday = new Set(todayRecords.map((r) => r.gameId));

  // Games played in the last 2 days (for variety)
  const last2Days = getLastNDays(2);
  const recentRecords = records.filter((r) => {
    const d = new Date(r.timestamp).toISOString().split("T")[0];
    return last2Days.includes(d);
  });
  const recentGames = new Set(recentRecords.map((r) => r.gameId));

  // Select games
  const selected: PlanTask[] = [];
  const selectedIds = new Set<GameId>();

  // Strategy 1: Pick from weakest dimension
  for (const dim of weakDimensions) {
    if (selected.length >= 3) break;
    const candidates = DIMENSION_GAMES[dim.dimension] || [];
    for (const gameId of candidates) {
      if (selected.length >= 3) break;
      if (selectedIds.has(gameId)) continue;
      if (playedToday.has(gameId)) continue;

      const meta = GAMES_META[gameId];
      if (!meta) continue;

      selected.push({
        gameId,
        gameTitle: meta.title,
        gameIcon: ICON_NAME_MAP[gameId] || "Zap",
        gameColor: meta.color,
        reason: `强化${dim.label} · 当前 ${dim.score} 分`,
        estimatedMinutes: meta.minutes,
        completed: false,
      });
      selectedIds.add(gameId);
    }
  }

  // Strategy 2: If we have < 2 games, add variety picks
  if (selected.length < 2) {
    const allGameIds = Object.keys(GAMES_META) as GameId[];
    for (const gameId of allGameIds) {
      if (selected.length >= 2) break;
      if (selectedIds.has(gameId)) continue;
      if (playedToday.has(gameId)) continue;
      if (recentGames.has(gameId)) continue;

      const meta = GAMES_META[gameId];
      if (!meta) continue;

      selected.push({
        gameId,
        gameTitle: meta.title,
        gameIcon: ICON_NAME_MAP[gameId] || "Zap",
        gameColor: meta.color,
        reason: "综合认知训练",
        estimatedMinutes: meta.minutes,
        completed: false,
      });
      selectedIds.add(gameId);
    }
  }

  // Strategy 3: Fallback to any available game
  if (selected.length === 0) {
    const allGameIds = Object.keys(GAMES_META) as GameId[];
    const fallback = allGameIds.find((g) => !playedToday.has(g)) || allGameIds[0];
    if (fallback) {
      const meta = GAMES_META[fallback];
      selected.push({
        gameId: fallback,
        gameTitle: meta.title,
        gameIcon: ICON_NAME_MAP[fallback] || "Zap",
        gameColor: meta.color,
        reason: "基础认知训练",
        estimatedMinutes: meta.minutes,
        completed: false,
      });
    }
  }

  const plan: DailyPlan = {
    date,
    tasks: selected,
    allCompleted: selected.every((t) => t.completed),
  };

  storePlan(plan);
  return plan;
}
