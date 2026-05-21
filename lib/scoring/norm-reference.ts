/**
 * Human-readable norm reference text for each game.
 *
 * Shows what "typical" performance looks like based on published
 * cognitive psychology literature.  Never claims to know the user's
 * exact peer group — these are general population reference values.
 */

import type { GameId } from "@/lib/storage/types";

const NORM_REFERENCES: Record<GameId, string> = {
  "reaction-time": "参考标准：一般成年人平均反应时间约 280ms",
  "attention-span": "参考标准：一般成年人平均专注时长约 20秒",
  "digit-span": "参考标准：一般成年人平均记忆广度约 6位",
  "go-nogo": "参考标准：一般成年人平均正确率约 70%",
  "flanker": "参考标准：一般成年人平均正确率约 88%",
  "task-switching": "参考标准：一般成年人平均正确率约 88%",
  "stroop-test": "参考标准：一般成年人平均正确率约 90%",
  "schulte-grid": "参考标准：一般成年人平均正确率约 94%",
  "nback-memory": "参考标准：一般成年人平均 d' 值约 2.0",
  "breathing-478": "参考标准：一般成年人平均完成度约 85%",
  "focus-gaze": "参考标准：一般成年人平均完成度约 85%",
};

/**
 * Get a human-readable norm reference string for a game.
 *
 * @param gameId Game identifier
 * @returns Reference text or null if no norm is available
 */
export function getNormReferenceText(gameId: GameId): string | null {
  return NORM_REFERENCES[gameId] ?? null;
}
