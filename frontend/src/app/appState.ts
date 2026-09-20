import { useCallback, useEffect, useReducer, useState } from 'react';

import { createInitialGameState } from '../game/initialGameState';
import { gameReducer } from '../game/reducer';
import {
  clearGameState,
  getStorageStatus,
  loadGameState,
  saveGameState
} from '../persistence/localStorageStore';
import { clearQuickStart } from '../persistence/quickStartStore';
import type { StorageStatus } from '../persistence/localStorageStore';
import type { GameAction, GameState } from '../types/game';

export type AppDispatch = (action: GameAction) => void;

export type AppStateContextValue = {
  state: GameState;
  dispatch: AppDispatch;
  resetGame: () => void;
  storageStatus: StorageStatus;
};

export function useAppState(): AppStateContextValue {
  const [storageStatus, setStorageStatus] = useState<StorageStatus>(() => getStorageStatus());
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => loadGameState() ?? createInitialGameState()
  );

  useEffect(() => {
    setStorageStatus(saveGameState(state) ? 'available' : 'unavailable');
  }, [state]);

  const resetGame = useCallback(() => {
    setStorageStatus(clearGameState() ? 'available' : 'unavailable');
    clearQuickStart();
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return {
    state,
    dispatch,
    resetGame,
    storageStatus
  };
}
