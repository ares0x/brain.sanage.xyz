/**
 * Streak and Achievement System
 *
 * Tracks consecutive training days and unlockable badges.
 * All data stored in localStorage alongside game records.
 */

import type { GameRecord } from "./storage";

const STREAK_KEY = "bs_activity_streak_v1";
const ACHIEVEMENTS_KEY = "bs_achievements_v1";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastTrainingDate: string | null; // ISO date string YYYY-MM-DD
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  tier: "bronze" | "silver" | "gold" | "platinum";
  condition: (records: GameRecord[], streak: StreakData) => boolean;
}

export interface UnlockedAchievement extends Achievement {
  unlockedAt: number;
}

export type AchievementIcon =
  | "flame"
  | "zap"
  | "target"
  | "brain"
  | "trophy"
  | "star"
  | "crown"
  | "medal"
  | "gem"
  | "award";

// ------------------------------------------------------------------
// Achievement Definitions
// ------------------------------------------------------------------

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_training",
    title: "初次训练",
    description: "完成第一次认知训练",
    icon: "star",
    tier: "bronze",
    condition: (records) => records.length >= 1,
  },
  {
    id: "streak_3",
    title: "坚持者",
    description: "连续训练 3 天",
    icon: "flame",
    tier: "bronze",
    condition: (_, streak) => streak.currentStreak >= 3 || streak.longestStreak >= 3,
  },
  {
    id: "streak_7",
    title: "自律达人",
    description: "连续训练 7 天",
    icon: "flame",
    tier: "silver",
    condition: (_, streak) => streak.currentStreak >= 7 || streak.longestStreak >= 7,
  },
  {
    id: "streak_14",
    title: "习惯养成",
    description: "连续训练 14 天",
    icon: "flame",
    tier: "gold",
    condition: (_, streak) => streak.currentStreak >= 14 || streak.longestStreak >= 14,
  },
  {
    id: "streak_30",
    title: "超级用户",
    description: "连续训练 30 天",
    icon: "crown",
    tier: "platinum",
    condition: (_, streak) => streak.currentStreak >= 30 || streak.longestStreak >= 30,
  },
  {
    id: "sessions_10",
    title: "初试锋芒",
    description: "累计完成 10 次训练",
    icon: "zap",
    tier: "bronze",
    condition: (records) => records.length >= 10,
  },
  {
    id: "sessions_50",
    title: "渐入佳境",
    description: "累计完成 50 次训练",
    icon: "zap",
    tier: "silver",
    condition: (records) => records.length >= 50,
  },
  {
    id: "sessions_100",
    title: "训练老手",
    description: "累计完成 100 次训练",
    icon: "trophy",
    tier: "gold",
    condition: (records) => records.length >= 100,
  },
  {
    id: "all_games",
    title: "全能选手",
    description: "体验过所有游戏",
    icon: "brain",
    tier: "gold",
    condition: (records) => {
      const uniqueGames = new Set(records.map((r) => r.gameId));
      return uniqueGames.size >= 9;
    },
  },
  {
    id: "high_score_80",
    title: "高分突破",
    description: "任意游戏得分超过 80 分",
    icon: "target",
    tier: "silver",
    condition: (records) => {
      return records.some((r) => {
        const res = r.result as Record<string, unknown> | undefined;
        const score =
          typeof res?.percentile === "number"
            ? res.percentile
            : typeof res?.accuracy === "number"
            ? Math.round(res.accuracy * 100)
            : typeof res?.dPrime === "number"
            ? Math.round(res.dPrime * 33.3)
            : typeof res?.score === "number"
            ? res.score
            : null;
        return score !== null && score >= 80;
      });
    },
  },
  {
    id: "high_score_95",
    title: "顶尖水平",
    description: "任意游戏得分超过 95 分",
    icon: "gem",
    tier: "gold",
    condition: (records) => {
      return records.some((r) => {
        const res = r.result as Record<string, unknown> | undefined;
        const score =
          typeof res?.percentile === "number"
            ? res.percentile
            : typeof res?.accuracy === "number"
            ? Math.round(res.accuracy * 100)
            : typeof res?.dPrime === "number"
            ? Math.round(res.dPrime * 33.3)
            : typeof res?.score === "number"
            ? res.score
            : null;
        return score !== null && score >= 95;
      });
    },
  },
  {
    id: "diverse_training",
    title: "全面发展的",
    description: "一天内完成 3 种不同训练",
    icon: "medal",
    tier: "silver",
    condition: (records) => {
      const dayGroups = groupByDay(records);
      return Array.from(dayGroups.values()).some((dayRecords) => {
        const uniqueGames = new Set(dayRecords.map((r) => r.gameId));
        return uniqueGames.size >= 3;
      });
    },
  },
];

// ------------------------------------------------------------------
// Streak Logic
// ------------------------------------------------------------------

function getTodayString(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

function getYesterdayString(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function groupByDay(records: GameRecord[]): Map<string, GameRecord[]> {
  const map = new Map<string, GameRecord[]>();
  for (const r of records) {
    const d = new Date(r.timestamp);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().split("T")[0];
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return map;
}

function readStreak(): StreakData {
  if (typeof window === "undefined") {
    return { currentStreak: 0, longestStreak: 0, lastTrainingDate: null };
  }
  try {
    const raw = window.localStorage.getItem(STREAK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StreakData;
      return {
        currentStreak: parsed.currentStreak || 0,
        longestStreak: parsed.longestStreak || 0,
        lastTrainingDate: parsed.lastTrainingDate || null,
      };
    }
  } catch {
    // ignore
  }
  return { currentStreak: 0, longestStreak: 0, lastTrainingDate: null };
}

function writeStreak(streak: StreakData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}

/**
 * Calculate streak from records and update persisted state.
 * Call this whenever records change (e.g. after saving a new record).
 */
export function calculateStreak(records: GameRecord[]): StreakData {
  if (records.length === 0) {
    const empty = { currentStreak: 0, longestStreak: 0, lastTrainingDate: null };
    writeStreak(empty);
    return empty;
  }

  const dayGroups = groupByDay(records);
  const sortedDays = Array.from(dayGroups.keys()).sort();
  const today = getTodayString();
  const yesterday = getYesterdayString();

  // Determine current streak
  let currentStreak = 0;
  const lastDay = sortedDays[sortedDays.length - 1];

  if (lastDay === today || lastDay === yesterday) {
    // Count backwards from last training day
    const lastDate = new Date(lastDay + "T00:00:00");
    currentStreak = 1;

    for (let i = sortedDays.length - 2; i >= 0; i--) {
      const prevDate = new Date(sortedDays[i] + "T00:00:00");
      const diffDays = Math.round(
        (lastDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (diffDays === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak ever
  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1] + "T00:00:00");
    const curr = new Date(sortedDays[i] + "T00:00:00");
    const diff = Math.round((curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000));

    if (diff === 1) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  const streak: StreakData = {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    lastTrainingDate: lastDay,
  };

  writeStreak(streak);
  return streak;
}

/**
 * Get the current streak data (reads from localStorage).
 */
export function getStreak(): StreakData {
  return readStreak();
}

// ------------------------------------------------------------------
// Achievement Logic
// ------------------------------------------------------------------

function readUnlockedIds(): Map<string, number> {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = window.localStorage.getItem(ACHIEVEMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, number>;
      return new Map(Object.entries(parsed));
    }
  } catch {
    // ignore
  }
  return new Map();
}

function writeUnlockedIds(map: Map<string, number>): void {
  if (typeof window === "undefined") return;
  const obj: Record<string, number> = {};
  for (const [k, v] of map) {
    obj[k] = v;
  }
  window.localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(obj));
}

/**
 * Check all achievements against records and unlock any newly earned ones.
 * Returns the list of newly unlocked achievements.
 */
export function checkAchievements(records: GameRecord[]): UnlockedAchievement[] {
  const streak = getStreak();
  const unlockedMap = readUnlockedIds();
  const newlyUnlocked: UnlockedAchievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedMap.has(achievement.id)) continue;

    if (achievement.condition(records, streak)) {
      const now = Date.now();
      unlockedMap.set(achievement.id, now);
      newlyUnlocked.push({ ...achievement, unlockedAt: now });
    }
  }

  if (newlyUnlocked.length > 0) {
    writeUnlockedIds(unlockedMap);
  }

  return newlyUnlocked;
}

/**
 * Get all achievements with their unlock status.
 */
export function getAchievementsStatus(): {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt: number | null;
}[] {
  const unlockedMap = readUnlockedIds();

  return ACHIEVEMENTS.map((achievement) => ({
    achievement,
    unlocked: unlockedMap.has(achievement.id),
    unlockedAt: unlockedMap.get(achievement.id) || null,
  }));
}

/**
 * Get unlocked achievements count.
 */
export function getUnlockedCount(): { unlocked: number; total: number } {
  const unlockedMap = readUnlockedIds();
  return {
    unlocked: unlockedMap.size,
    total: ACHIEVEMENTS.length,
  };
}
