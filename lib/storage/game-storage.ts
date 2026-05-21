/**
 * Unified localStorage persistence layer for all game sessions.
 *
 * Design goals:
 * - Zero external dependencies
 * - Decoupled from game-specific result types (result is `unknown`)
 * - Versioned so future migrations are possible
 * - Works offline, privacy-first
 * - Reserves hooks for future cloud sync (syncedAt, userId)
 */

import type { GameId, GameRecord, RecordFilter, GameStats, ScoreExtractor } from "./types";

const STORAGE_KEY = "bs_records_v1";
const META_KEY = "bs_storage_meta_v1";
const MAX_RECORDS = 2000; // ~2-4 MB cap

interface StorageMeta {
  version: number;
  recordCount: number;
  lastWriteAt: number;
}

// ------------------------------------------------------------------
// Score extractors — each game registers how to derive a scalar score
// from its raw result object (higher = better).
// ------------------------------------------------------------------

const scoreExtractors = new Map<GameId, ScoreExtractor>();

export function registerScoreExtractor(gameId: GameId, extractor: ScoreExtractor): void {
  scoreExtractors.set(gameId, extractor);
}

function extractScore(record: GameRecord): number | null {
  const extractor = scoreExtractors.get(record.gameId);
  if (!extractor) return null;
  try {
    return extractor(record.result);
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// Low-level I/O
// ------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAll(): GameRecord[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GameRecord[];
    if (!Array.isArray(parsed)) return [];
    // Backfill resultVersion for records created before the field existed.
    // This ensures forward-compatibility during DB migration.
    return parsed.map((r) => ({
      ...r,
      resultVersion: r.resultVersion ?? 1,
    }));
  } catch {
    return [];
  }
}

function writeAll(records: GameRecord[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    const meta: StorageMeta = {
      version: 1,
      recordCount: records.length,
      lastWriteAt: Date.now(),
    };
    window.localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // localStorage quota exceeded — silently drop oldest records and retry
    if (records.length > 50) {
      const trimmed = records.slice(-Math.floor(records.length * 0.8));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
  }
}

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

/**
 * Save a new game session record.
 */
export function saveRecord(
  payload: Omit<GameRecord, "id" | "resultVersion">
): GameRecord {
  const record: GameRecord = {
    ...payload,
    id: generateId(),
    resultVersion: 1,
  };

  const all = readAll();
  all.push(record);

  // Enforce cap — drop oldest if over limit
  if (all.length > MAX_RECORDS) {
    all.splice(0, all.length - MAX_RECORDS);
  }

  writeAll(all);
  return record;
}

/**
 * Query records with optional filtering.  Always returns most-recent first.
 */
export function getRecords(filter?: RecordFilter): GameRecord[] {
  let records = readAll();

  if (filter?.gameId) {
    records = records.filter((r) => r.gameId === filter.gameId);
  }
  if (filter?.since) {
    records = records.filter((r) => r.timestamp >= filter.since!);
  }
  if (filter?.until) {
    records = records.filter((r) => r.timestamp <= filter.until!);
  }

  // Sort newest first
  records.sort((a, b) => b.timestamp - a.timestamp);

  // Deduplicate by ID — keep the first (most recent) occurrence.
  // Guards against double-saves from race conditions or corrupted imports.
  const seen = new Set<string>();
  records = records.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  if (filter?.limit && filter.limit > 0) {
    records = records.slice(0, filter.limit);
  }

  return records;
}

/**
 * Get a single record by its ID.
 */
export function getRecordById(id: string): GameRecord | undefined {
  return readAll().find((r) => r.id === id);
}

/**
 * Delete a single record.
 */
export function deleteRecord(id: string): void {
  const all = readAll().filter((r) => r.id !== id);
  writeAll(all);
}

/**
 * Get the best (highest-score) record for a game.
 */
export function getBestRecord(gameId: GameId): GameRecord | null {
  const records = getRecords({ gameId });
  if (records.length === 0) return null;

  let best: GameRecord | null = null;
  let bestScore = -Infinity;

  for (const r of records) {
    const score = extractScore(r);
    if (score !== null && score > bestScore) {
      bestScore = score;
      best = r;
    }
  }

  return best;
}

/**
 * Get average score for a game over a time window.
 */
export function getAverageScore(
  gameId: GameId,
  days?: number
): number | null {
  const since = days ? Date.now() - days * 24 * 60 * 60 * 1000 : undefined;
  const records = getRecords({ gameId, since });
  if (records.length === 0) return null;

  const scores = records
    .map((r) => extractScore(r))
    .filter((s): s is number => s !== null);

  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Get comprehensive stats for a single game.
 */
export function getGameStats(gameId: GameId): GameStats {
  const records = getRecords({ gameId });
  const scores = records
    .map((r) => extractScore(r))
    .filter((s): s is number => s !== null);

  return {
    gameId,
    totalSessions: records.length,
    bestScore: scores.length > 0 ? Math.max(...scores) : null,
    averageScore: scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null,
    lastPlayedAt: records.length > 0 ? records[0].timestamp : null,
  };
}

/**
 * Get stats for all games at once.
 */
export function getAllGameStats(): GameStats[] {
  const gameIds: GameId[] = [
    "reaction-time",
    "nback-memory",
    "stroop-test",
    "flanker",
    "attention-span",
    "digit-span",
    "schulte-grid",
    "task-switching",
    "breathing-478",
    "go-nogo",
    "focus-gaze",
  ];
  return gameIds.map(getGameStats);
}

/**
 * Export all data as a JSON string (for backup / migration).
 */
export function exportData(): string {
  const all = readAll();
  const meta = {
    exportVersion: 1,
    exportedAt: Date.now(),
    recordCount: all.length,
    records: all,
  };
  return JSON.stringify(meta, null, 2);
}

/**
 * Import data from a JSON string.  Merges with existing records
 * (deduplicates by id).
 */
export function importData(json: string): { imported: number; duplicates: number } {
  const parsed = JSON.parse(json) as {
    records?: GameRecord[];
  };
  const incoming = Array.isArray(parsed.records) ? parsed.records : [];
  const existing = readAll();
  const existingIds = new Set(existing.map((r) => r.id));

  let imported = 0;
  let duplicates = 0;

  for (const r of incoming) {
    if (existingIds.has(r.id)) {
      duplicates++;
      continue;
    }
    existing.push(r);
    existingIds.add(r.id);
    imported++;
  }

  // Re-sort and enforce cap
  existing.sort((a, b) => a.timestamp - b.timestamp);
  if (existing.length > MAX_RECORDS) {
    existing.splice(0, existing.length - MAX_RECORDS);
  }

  writeAll(existing);
  return { imported, duplicates };
}

/**
 * Clear all game records.  Destructive — use with care.
 */
export function clearAllData(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(META_KEY);
}

/**
 * Total number of records across all games.
 */
export function getTotalRecordCount(): number {
  return readAll().length;
}

/**
 * Get the timestamp of the most recent record (or null if none).
 */
export function getLastActivityTimestamp(): number | null {
  const all = readAll();
  if (all.length === 0) return null;
  return Math.max(...all.map((r) => r.timestamp));
}
