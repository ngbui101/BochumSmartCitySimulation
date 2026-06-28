import type { GameState } from '../types/game';

export const GAME_STATE_STORAGE_KEY = 'bochum-smart-city:mvp1:v1';

const STORAGE_VERSION = 1;

type StoredGameState = {
  version: number;
  state: GameState;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStoredGameState(value: unknown): value is StoredGameState {
  if (!isObject(value) || value.version !== STORAGE_VERSION || !isObject(value.state)) {
    return false;
  }

  return (
    typeof value.state.gameId === 'string' &&
    typeof value.state.currentMonthIndex === 'number' &&
    typeof value.state.budget === 'number' &&
    isObject(value.state.kpis) &&
    Array.isArray(value.state.playerAssets) &&
    Array.isArray(value.state.existingAssets) &&
    Array.isArray(value.state.undoStack) &&
    Array.isArray(value.state.monthlyHistory) &&
    Array.isArray(value.state.forecast) &&
    (value.state.status === 'running' || value.state.status === 'finished')
  );
}

export function loadGameState(): GameState | null {
  const storedValue = localStorage.getItem(GAME_STATE_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedValue) as unknown;
    return isStoredGameState(parsed) ? parsed.state : null;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(
    GAME_STATE_STORAGE_KEY,
    JSON.stringify({
      version: STORAGE_VERSION,
      state
    })
  );
}

export function clearGameState(): void {
  localStorage.removeItem(GAME_STATE_STORAGE_KEY);
}
