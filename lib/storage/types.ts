/**
 * Game ID enum — must match the URL slug / directory name conventions.
 */
export type GameId =
  | "reaction-time"
  | "nback-memory"
  | "stroop-test"
  | "flanker"
  | "attention-span"
  | "digit-span"
  | "schulte-grid"
  | "task-switching"
  | "breathing-478"
  | "go-nogo"
  | "focus-gaze";

/**
 * A single game session record stored in localStorage.
 *
 * The `result` field holds the raw game-specific result object (e.g.
 * ReactionTimeResult, NBackResult, etc.).  It is typed as `unknown` here so
 * the storage layer stays decoupled from the core game modules.
 */
export interface GameRecord {
  /** Stable UUID v4 */
  id: string;
  gameId: GameId;
  /** Unix timestamp (ms) when the session ended */
  timestamp: number;
  /** Session duration in milliseconds */
  durationMs: number;
  /** Game-specific result payload */
  result: unknown;
  /** Result schema version for forward-compatibility during DB migration */
  resultVersion: number;
  /** Optional user note (reserved for future use) */
  note?: string;
  /** Reserved for future cloud-sync */
  syncedAt?: number;
  userId?: string;
}

/**
 * Filter options for querying records.
 */
export interface RecordFilter {
  gameId?: GameId;
  /** Only return records after this timestamp */
  since?: number;
  /** Only return records before this timestamp */
  until?: number;
  /** Max number of records to return (most recent first) */
  limit?: number;
}

/**
 * Aggregated stats for a single game.
 */
export interface GameStats {
  gameId: GameId;
  totalSessions: number;
  bestScore: number | null;
  averageScore: number | null;
  lastPlayedAt: number | null;
}

/**
 * Score extractors — each game must register a function that turns its raw
 * result into a normalised number (higher = better).  This lets the storage
 * layer compute cross-game stats without knowing result internals.
 */
export type ScoreExtractor = (result: unknown) => number | null;
