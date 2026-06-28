import { useCallback, useEffect, useReducer } from 'react';

import { createInitialGameState } from '../game/initialGameState';
import { gameReducer } from '../game/reducer';
import { clearGameState, loadGameState, saveGameState } from '../persistence/localStorageStore';
import type { GameAction, GameState } from '../types/game';

export type AppDispatch = (action: GameAction) => void;

export type AppStateContextValue = {
  state: GameState;
  dispatch: AppDispatch;
  resetGame: () => void;
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

  const resetGame = useCallback(() => {
    clearGameState();
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return {
    state,
    dispatch,
    resetGame
  };
}
