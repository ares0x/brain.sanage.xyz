import type {
  GoNogoGameState,
  GoNogoResult,
  GoNogoTrial,
  TrialType,
  TrialOutcome,
} from "./types";
import { GO_NOGO_CONFIG } from "./config";

function generateTrials(count: number): GoNogoTrial[] {
  const goCount = Math.round(count * GO_NOGO_CONFIG.goRatio);
  const noGoCount = count - goCount;

  const types: TrialType[] = [
    ...Array.from({ length: goCount }, () => "go" as TrialType),
    ...Array.from({ length: noGoCount }, () => "no-go" as TrialType),
  ];

  // Fisher-Yates shuffle
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }

  // Ensure no more than 3 no-go in a row (to keep user engaged)
  for (let i = 0; i < types.length - 3; i++) {
    if (
      types[i] === "no-go" &&
      types[i + 1] === "no-go" &&
      types[i + 2] === "no-go" &&
      types[i + 3] === "no-go"
    ) {
      // Find a go trial to swap with
      for (let k = i + 4; k < types.length; k++) {
        if (types[k] === "go") {
          [types[i + 3], types[k]] = [types[k], types[i + 3]];
          break;
        }
      }
    }
  }

  return types.map((type) => ({
    type,
    outcome: null,
    rtMs: null,
  }));
}

function randomIti(): number {
  const { minItiMs, maxItiMs } = GO_NOGO_CONFIG;
  return Math.floor(minItiMs + Math.random() * (maxItiMs - minItiMs));
}

function calculatePercentile(accuracy: number): number {
  const table = GO_NOGO_CONFIG.percentileTable;
  for (const entry of table) {
    if (accuracy >= entry.accuracy) return entry.percentile;
  }
  return 1;
}

function calculateLevel(accuracy: number): string {
  const table = GO_NOGO_CONFIG.levelTable;
  for (const entry of table) {
    if (accuracy >= entry.minAccuracy) return entry.label;
  }
  return table[table.length - 1].label;
}

/**
 * Calculate d-prime using the log-linear correction (Hautus 1995)
 * to avoid infinite values when hit rate or false alarm rate is 0 or 1.
 */
function calculateDPrime(hitRate: number, faRate: number): number | null {
  const n = GO_NOGO_CONFIG.totalTrials;
  // Adjust rates with log-linear correction
  const adjHit = (hitRate * n + 0.5) / (n + 1);
  const adjFa = (faRate * n + 0.5) / (n + 1);

  // Z-score approximation (inverse normal CDF)
  function zScore(p: number): number {
    // Rational approximation for standard normal quantile
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

    const c1 = -7.78489400243029e-3;
    const c2 = -0.322396458441136;
    const c3 = -2.40075827716184;
    const c4 = -2.54973253934373;
    const c5 = 4.37466414146497;
    const c6 = 2.93816398269878;

    const d1 = 7.78469570904146e-3;
    const d2 = 0.32246712907004;
    const d3 = 2.445134137143;
    const d4 = 3.75440866190742;

    const pLow = 0.02425;
    const pHigh = 1 - pLow;

    let q: number;
    let r: number;

    if (p < pLow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
        ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    } else if (p <= pHigh) {
      q = p - 0.5;
      r = q * q;
      return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
        (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
        ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }
  }

  return zScore(adjHit) - zScore(adjFa);
}

export function calculateResult(state: GoNogoGameState): GoNogoResult {
  const goTrials = state.trials.filter((t) => t.type === "go");
  const noGoTrials = state.trials.filter((t) => t.type === "no-go");

  const goHits = goTrials.filter((t) => t.outcome === "hit").length;
  const goMisses = goTrials.filter((t) => t.outcome === "miss").length;
  const noGoCorrect = noGoTrials.filter(
    (t) => t.outcome === "correct_reject"
  ).length;
  const noGoFalse = noGoTrials.filter(
    (t) => t.outcome === "false_alarm"
  ).length;

  const goAccuracy =
    goTrials.length > 0
      ? Math.round((goHits / goTrials.length) * 100)
      : 0;
  const noGoAccuracy =
    noGoTrials.length > 0
      ? Math.round((noGoCorrect / noGoTrials.length) * 100)
      : 0;

  const totalCorrect = goHits + noGoCorrect;
  const overallAccuracy =
    state.trials.length > 0
      ? Math.round((totalCorrect / state.trials.length) * 100)
      : 0;

  const hitTimes = goTrials
    .filter((t) => t.outcome === "hit" && t.rtMs !== null)
    .map((t) => t.rtMs!);
  const averageRtMs =
    hitTimes.length > 0
      ? Math.round(hitTimes.reduce((s, t) => s + t, 0) / hitTimes.length)
      : 0;

  const hitRate = goTrials.length > 0 ? goHits / goTrials.length : 0;
  const faRate = noGoTrials.length > 0 ? noGoFalse / noGoTrials.length : 0;

  return {
    goAccuracy,
    noGoAccuracy,
    overallAccuracy,
    averageRtMs,
    falseAlarmRate: Math.round(faRate * 100),
    hitRate: Math.round(hitRate * 100),
    dPrime: calculateDPrime(hitRate, faRate),
    totalTrials: state.trials.length,
    level: calculateLevel(overallAccuracy),
    percentile: calculatePercentile(overallAccuracy),
  };
}

export function createInitialState(): GoNogoGameState {
  return {
    phase: "idle",
    totalTrials: GO_NOGO_CONFIG.totalTrials,
    currentTrial: 0,
    trials: [],
    stimulusShownAt: null,
    startedAt: null,
  };
}

export function startGame(state: GoNogoGameState): GoNogoGameState {
  const trials = generateTrials(state.totalTrials);
  return {
    ...state,
    phase: "stimulus",
    currentTrial: 0,
    trials,
    stimulusShownAt: Date.now(),
    startedAt: Date.now(),
  };
}

export function showStimulus(state: GoNogoGameState): GoNogoGameState {
  if (state.phase !== "feedback") return state;
  return {
    ...state,
    phase: "stimulus",
    stimulusShownAt: Date.now(),
  };
}

export function recordResponse(state: GoNogoGameState): GoNogoGameState {
  if (
    state.phase !== "stimulus" ||
    state.stimulusShownAt === null ||
    state.currentTrial >= state.trials.length
  ) {
    return state;
  }

  const now = Date.now();
  const rtMs = now - state.stimulusShownAt;

  const trial = state.trials[state.currentTrial];
  const outcome: TrialOutcome = trial.type === "go" ? "hit" : "false_alarm";

  const updatedTrials = state.trials.map((t, i) =>
    i === state.currentTrial ? { ...t, outcome, rtMs } : t
  );

  return {
    ...state,
    phase: "feedback",
    trials: updatedTrials,
  };
}

export function recordMiss(state: GoNogoGameState): GoNogoGameState {
  if (
    state.phase !== "stimulus" ||
    state.currentTrial >= state.trials.length
  ) {
    return state;
  }

  const trial = state.trials[state.currentTrial];
  const outcome: TrialOutcome = trial.type === "go" ? "miss" : "correct_reject";

  const updatedTrials = state.trials.map((t, i) =>
    i === state.currentTrial ? { ...t, outcome, rtMs: null } : t
  );

  return {
    ...state,
    phase: "feedback",
    trials: updatedTrials,
  };
}

export function advanceTrial(state: GoNogoGameState): GoNogoGameState {
  if (state.phase !== "feedback") return state;

  const nextTrial = state.currentTrial + 1;
  const isEnded = nextTrial >= state.totalTrials;

  if (isEnded) {
    return {
      ...state,
      phase: "ended",
    };
  }

  return {
    ...state,
    phase: "stimulus",
    currentTrial: nextTrial,
    stimulusShownAt: Date.now(),
  };
}

export { GO_NOGO_CONFIG };
