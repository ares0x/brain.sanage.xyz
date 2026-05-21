/**
 * Streak tracking for daily training plans.
 *
 * Simple localStorage-based tracker: did the user complete their daily
 * training plan today / yesterday / etc.
 */

import type { StreakData, TrainingSummary } from "./types";

const STREAK_KEY = "bs_streak_v1";

function readStreak(): StreakData {
  const fallback: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    history: {},
  };

  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(STREAK_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Record<string, unknown>;

    // Validate shape: must have history object (protects against key collision with achievements streak)
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !parsed.history ||
      typeof parsed.history !== "object"
    ) {
      return fallback;
    }

    return {
      currentStreak: typeof parsed.currentStreak === "number" ? parsed.currentStreak : 0,
      longestStreak: typeof parsed.longestStreak === "number" ? parsed.longestStreak : 0,
      lastCompletedDate: typeof parsed.lastCompletedDate === "string" ? parsed.lastCompletedDate : null,
      history: parsed.history as Record<string, boolean>,
    };
  } catch {
    return fallback;
  }
}

function writeStreak(data: StreakData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function isConsecutive(prev: string, curr: string): boolean {
  const prevDate = new Date(prev);
  const currDate = new Date(curr);
  const diffDays =
    (currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000);
  return diffDays === 1;
}

/**
 * Record that today's plan was completed.
 */
export function recordCompletion(): StreakData {
  const data = readStreak();
  const today = todayStr();

  // Already recorded today — no-op
  if (data.history[today]) {
    return data;
  }

  data.history[today] = true;

  if (
    data.lastCompletedDate === null ||
    isConsecutive(data.lastCompletedDate, today)
  ) {
    data.currentStreak += 1;
  } else {
    data.currentStreak = 1;
  }

  data.lastCompletedDate = today;
  data.longestStreak = Math.max(data.longestStreak, data.currentStreak);

  writeStreak(data);
  return data;
}

/**
 * Get current streak data.
 */
export function getStreak(): StreakData {
  const data = readStreak();
  const today = todayStr();
  const yesterday = yesterdayStr();

  // If last completed was before yesterday, streak is broken
  if (
    data.lastCompletedDate &&
    data.lastCompletedDate !== today &&
    data.lastCompletedDate !== yesterday
  ) {
    data.currentStreak = 0;
  }

  return data;
}

/**
 * Build a 7-day summary for the weekly progress view.
 */
export function getWeeklyProgress(): {
  date: string;
  completed: boolean;
  count: number;
}[] {
  const data = readStreak();
  const result: { date: string; completed: boolean; count: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      completed: !!data.history[dateStr],
      count: data.history[dateStr] ? 1 : 0,
    });
  }

  return result;
}

/**
 * Full training summary for the UI.
 */
export function getTrainingSummary(): TrainingSummary {
  const { getTodayPlan } = require("./plan-generator");
  return {
    todayPlan: getTodayPlan(),
    streak: getStreak(),
    weeklyProgress: getWeeklyProgress(),
  };
}
