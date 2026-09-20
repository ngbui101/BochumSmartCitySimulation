import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearQuickStart,
  hasCompletedQuickStart,
  QUICK_START_STORAGE_KEY,
  completeQuickStart
} from '../../src/persistence/quickStartStore';

describe('quickStartStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    clearQuickStart();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stores completion separately from the game state', () => {
    expect(hasCompletedQuickStart()).toBe(false);

    completeQuickStart();

    expect(hasCompletedQuickStart()).toBe(true);
    expect(localStorage.getItem(QUICK_START_STORAGE_KEY)).toBe('completed');
  });

  it('clears completion so a new round can show the guide again', () => {
    completeQuickStart();

    clearQuickStart();

    expect(hasCompletedQuickStart()).toBe(false);
    expect(localStorage.getItem(QUICK_START_STORAGE_KEY)).toBeNull();
  });

  it('keeps completion in memory when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    completeQuickStart();

    expect(hasCompletedQuickStart()).toBe(true);
  });
});
