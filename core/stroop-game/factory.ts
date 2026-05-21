import type { StroopGameState } from "./types";
import { createInitialState, startGame } from "./engine";

export function createStroopGame(): {
  state: StroopGameState;
  start: () => StroopGameState;
  restart: () => StroopGameState;
} {
  let state = createInitialState();

  return {
    get state() {
      return state;
    },
    start() {
      state = startGame(state);
      return state;
    },
    restart() {
      state = createInitialState();
      state = startGame(state);
      return state;
    },
  };
}
