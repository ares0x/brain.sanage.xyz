import type { NBackGameState } from "./types";
import { createInitialState, startGame } from "./engine";

export function createNBackGame(n?: number): {
  state: NBackGameState;
  start: () => NBackGameState;
  restart: () => NBackGameState;
} {
  let state = createInitialState();

  return {
    get state() {
      return state;
    },
    start() {
      state = startGame(state, n);
      return state;
    },
    restart() {
      state = createInitialState();
      state = startGame(state, n);
      return state;
    },
  };
}
