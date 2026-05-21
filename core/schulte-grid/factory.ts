import type { GridSize, SchulteGameState, SchulteGameMode, TimedDuration } from "./types";
import { createInitialState, startGame } from "./engine";

export function createSchulteGame(size?: GridSize, mode?: SchulteGameMode, timedDuration?: TimedDuration): {
  state: SchulteGameState;
  start: () => SchulteGameState;
  restart: () => SchulteGameState;
} {
  let state = createInitialState();

  return {
    get state() {
      return state;
    },
    start() {
      state = startGame(state, size, mode, timedDuration);
      return state;
    },
    restart() {
      state = createInitialState();
      state = startGame(state, size, mode, timedDuration);
      return state;
    },
  };
}
