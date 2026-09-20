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

function withStateDefaults(state: GameState): GameState {
  const subsidies = state.subsidies ?? {
    solar: { level: 0, privateCapacity: 0 },
    storage: { level: 0, privateCapacity: 0 }
  };

  return {
    ...state,
    existingAssets: [],
    privateAssets: state.privateAssets ?? [],
    subsidies: {
      solar: { ...subsidies.solar },
      storage: { ...subsidies.storage }
    },
    storedEnergy: state.storedEnergy ?? 0,
    monthlyHistory: state.monthlyHistory.map((snapshot) => ({
      ...snapshot,
      subsidyCosts: snapshot.subsidyCosts ?? 0,
      privateSolarProduction: snapshot.privateSolarProduction ?? 0,
      privateStorageDischarge: snapshot.privateStorageDischarge ?? 0
    }))
  };
}

export function loadGameState(): GameState | null {
  const storedValue = localStorage.getItem(GAME_STATE_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedValue) as unknown;
    return isStoredGameState(parsed) ? withStateDefaults(parsed.state) : null;
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
