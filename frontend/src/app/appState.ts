import type { GameAction, GameState } from '../types/game';

export type AppDispatch = (action: GameAction) => void;

export type AppStateContextValue = {
  state: GameState | null;
  dispatch: AppDispatch;
};

export function useAppState(): AppStateContextValue {
  return {
    state: null,
    dispatch: () => undefined
  };
}
