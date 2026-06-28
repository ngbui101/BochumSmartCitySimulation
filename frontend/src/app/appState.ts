import { useEffect, useReducer } from 'react';

import { createInitialGameState } from '../game/initialGameState';
import { gameReducer } from '../game/reducer';
import { loadGameState, saveGameState } from '../persistence/localStorageStore';
import type { GameAction, GameState } from '../types/game';

export type AppDispatch = (action: GameAction) => void;

export type AppStateContextValue = {
  state: GameState | null;
  dispatch: AppDispatch;
};

export function useAppState(): AppStateContextValue {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => loadGameState() ?? createInitialGameState()
  );

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  return {
    state,
    dispatch
  };
}
