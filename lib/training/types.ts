import type { GameId } from "@/lib/storage/types";
import type { CohortRole, ImprovementGoal } from "@/config/curriculums";

export interface CohortPersona {
  role: CohortRole;
  goal: ImprovementGoal;
  createdAt: number;
}

export interface PlanTask {
  gameId: GameId;
  gameTitle: string;
  gameIcon: string; // lucide icon name
  gameColor: string;
  reason: string;
  estimatedMinutes: number;
  completed: boolean;
  recordId?: string;
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  tasks: PlanTask[];
  allCompleted: boolean;
  completedAt?: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  /** Map of date string -> was the daily plan completed */
  history: Record<string, boolean>;
}

export interface TrainingSummary {
  todayPlan: DailyPlan | null;
  streak: StreakData;
  weeklyProgress: { date: string; completed: boolean; count: number }[];
}

