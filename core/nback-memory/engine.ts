import type {
  NBackTrial,
  NBackResponse,
  NBackGameState,
  NBackResult,
  NBackStimulus,
} from "./types";
import { NBACK_CONFIG } from "./config";

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function pick<T>(arr: readonly T[]): T {
  return arr[randInt(arr.length)];
}

export function generateStimulus(
  type: "position" | "color" | "letter"
): NBackStimulus {
  switch (type) {
    case "position":
      return { position: randInt(NBACK_CONFIG.positions) };
    case "color":
      return { color: pick(NBACK_CONFIG.colors) };
    case "letter":
      return { letter: pick(NBACK_CONFIG.letters) };
    default:
      return { position: randInt(NBACK_CONFIG.positions) };
  }
}

export function stimuliEqual(
  a: NBackStimulus,
  b: NBackStimulus,
  type: "position" | "color" | "letter"
): boolean {
  switch (type) {
    case "position":
      return a.position === b.position;
    case "color":
      return a.color === b.color;
    case "letter":
      return a.letter === b.letter;
    default:
      return false;
  }
}

export function generateTrials(
  total: number,
  n: number,
  type: "position" | "color" | "letter"
): NBackTrial[] {
  const trials: NBackTrial[] = [];
  const maxMatches = Math.max(0, total - n);
  const matchCount = Math.min(
    Math.floor(total * NBACK_CONFIG.matchRatio),
    maxMatches
  );
  const matchIndices = new Set<number>();

  // Ensure first n trials are never matches (no prior stimulus to compare)
  while (matchIndices.size < matchCount) {
    const idx = randInt(total);
    if (idx >= n) {
      matchIndices.add(idx);
    }
  }

  for (let i = 0; i < total; i++) {
    const isMatch = matchIndices.has(i);
    let stimulus: NBackStimulus;

    if (isMatch && i >= n) {
      stimulus = { ...trials[i - n].stimulus };
    } else {
      // Build a pool of non-matching stimuli to guarantee no accidental match
      if (i >= n) {
        const prior = trials[i - n].stimulus;
        const pool = buildNonMatchingPool(type, prior);
        stimulus = pick(pool);
      } else {
        stimulus = generateStimulus(type);
      }
    }

    trials.push({ id: i, stimulus, isMatch });
  }

  return trials;
}

function buildNonMatchingPool(
  type: "position" | "color" | "letter",
  exclude: NBackStimulus
): NBackStimulus[] {
  const pool: NBackStimulus[] = [];
  switch (type) {
    case "position": {
      for (let p = 0; p < NBACK_CONFIG.positions; p++) {
        if (p !== exclude.position) pool.push({ position: p });
      }
      break;
    }
    case "color": {
      for (const c of NBACK_CONFIG.colors) {
        if (c !== exclude.color) pool.push({ color: c });
      }
      break;
    }
    case "letter": {
      for (const l of NBACK_CONFIG.letters) {
        if (l !== exclude.letter) pool.push({ letter: l });
      }
      break;
    }
  }
  return pool;
}

export function recordResponse(
  state: NBackGameState,
  userSaidMatch: boolean,
  timeout = false
): NBackGameState {
  if (
    state.phase !== "playing" ||
    state.currentIndex >= state.trials.length ||
    state.hasResponded
  ) {
    return state;
  }

  const trial = state.trials[state.currentIndex];
  const now = Date.now();
  const reactionTime =
    state.trialStartedAt !== null ? now - state.trialStartedAt : 0;

  const response: NBackResponse = {
    trialId: trial.id,
    isMatch: trial.isMatch,
    userSaidMatch,
    reactionTimeMs: timeout ? 0 : Math.max(0, reactionTime),
    timeout,
  };

  const nextIndex = state.currentIndex + 1;
  const isEnded = nextIndex >= state.trials.length;

  return {
    ...state,
    responses: [...state.responses, response],
    currentIndex: nextIndex,
    phase: isEnded ? "ended" : "playing",
    stimulusVisible: false,
    hasResponded: true,
    trialStartedAt: isEnded ? null : state.trialStartedAt,
  };
}

export function advanceToNextTrial(state: NBackGameState): NBackGameState {
  if (state.phase !== "playing") return state;
  return {
    ...state,
    stimulusVisible: true,
    hasResponded: false,
    trialStartedAt: Date.now(),
  };
}

export function hideStimulus(state: NBackGameState): NBackGameState {
  if (state.phase !== "playing") return state;
  return {
    ...state,
    stimulusVisible: false,
  };
}

export function calculateResult(responses: NBackResponse[], n: number): NBackResult {
  // Filter out the priming trials (the first n trials)
  const scoreableResponses = responses.filter((r) => r.trialId >= n);
  const total = scoreableResponses.length;
  if (total === 0) {
    return {
      n,
      totalTrials: 0,
      correctResponses: 0,
      misses: 0,
      falseAlarms: 0,
      accuracy: 0,
      dPrime: 0,
      averageReactionTimeMs: 0,
    };
  }

  let hits = 0;
  let misses = 0;
  let falseAlarms = 0;
  let correctRejections = 0;
  let totalReactionTime = 0;
  let reactionCount = 0;

  for (const r of scoreableResponses) {
    if (r.timeout) {
      if (r.isMatch) {
        misses++;
      }
      // If it is NOT a match, a timeout is an omission error.
      // We do not increment correctRejections nor falseAlarms because they timed out!
      continue;
    }

    const correct = r.isMatch === r.userSaidMatch;
    if (r.isMatch && r.userSaidMatch) hits++;
    if (r.isMatch && !r.userSaidMatch) misses++;
    if (!r.isMatch && r.userSaidMatch) falseAlarms++;
    if (!r.isMatch && !r.userSaidMatch) correctRejections++;

    // Only average reaction times for valid manual responses (non-timeouts)
    if (r.reactionTimeMs > 0) {
      totalReactionTime += r.reactionTimeMs;
      reactionCount++;
    }
  }

  const accuracy = (hits + correctRejections) / total;

  // Simplified d-prime approximation
  const hitRate = Math.max(0.01, Math.min(0.99, hits / (hits + misses || 1)));
  const faRate = Math.max(
    0.01,
    Math.min(0.99, falseAlarms / (falseAlarms + correctRejections || 1))
  );
  const dPrime = z(hitRate) - z(faRate);

  return {
    n,
    totalTrials: total,
    correctResponses: hits + correctRejections,
    misses,
    falseAlarms,
    accuracy,
    dPrime: Math.round(dPrime * 100) / 100,
    averageReactionTimeMs:
      reactionCount > 0
        ? Math.round(totalReactionTime / reactionCount)
        : 0,
  };
}

// Inverse normal CDF approximation for d-prime
function z(p: number): number {
  if (p <= 0) return -3.5;
  if (p >= 1) return 3.5;
  const a1 = -39.6968302866538;
  const a2 = 220.946098424521;
  const a3 = -275.928510446969;
  const a4 = 138.357751867269;
  const a5 = -30.6647980661472;
  const a6 = 2.50662827745924;
  const b1 = -54.4760987982241;
  const b2 = 161.585836858041;
  const b3 = -155.698979859887;
  const b4 = 66.8013118877197;
  const b5 = -13.2806815528857;
  const c1 = -0.00778489400243029;
  const c2 = -0.322396458441136;
  const c3 = -2.40075827716184;
  const c4 = -2.54973253934373;
  const c5 = 4.37466414146497;
  const c6 = 2.93816398269878;
  const d1 = 0.00778469570904146;
  const d2 = 0.32246712907004;
  const d3 = 2.445134137143;
  const d4 = 3.75440866190742;
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }
}

export function createInitialState(): NBackGameState {
  return {
    phase: "idle",
    n: NBACK_CONFIG.defaultN,
    trials: [],
    responses: [],
    currentIndex: 0,
    stimulusVisible: false,
    hasResponded: false,
    startedAt: null,
    trialStartedAt: null,
  };
}

export function startGame(
  state: NBackGameState,
  n: number = NBACK_CONFIG.defaultN
): NBackGameState {
  const now = Date.now();
  return {
    ...state,
    phase: "playing",
    n,
    trials: generateTrials(NBACK_CONFIG.totalTrials, n, "position"),
    responses: [],
    currentIndex: 0,
    stimulusVisible: true,
    hasResponded: false,
    startedAt: now,
    trialStartedAt: now,
  };
}
