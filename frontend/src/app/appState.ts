import { useCallback, useEffect, useState } from 'react';

import { createInitialGameState } from '../game/initialGameState';
import { loadGameState, saveGameState } from '../persistence/localStorageStore';
import type { GameAction, GameState } from '../types/game';

export type AppDispatch = (action: GameAction) => void;

export type AppStateContextValue = {
  state: GameState | null;
  dispatch: AppDispatch;
};

export function useAppState(): AppStateContextValue {
  const [state] = useState<GameState>(() => loadGameState() ?? createInitialGameState());
  const dispatch = useCallback<AppDispatch>(() => undefined, []);

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  return {
    state,
    dispatch
  };
}
