export const QUICK_START_STORAGE_KEY = 'bochum-smart-city:mvp1:quick-start:v1';

let quickStartCompletedInMemory = false;

export function hasCompletedQuickStart(): boolean {
  try {
    const value = localStorage.getItem(QUICK_START_STORAGE_KEY);
    quickStartCompletedInMemory = value === 'completed';
    return quickStartCompletedInMemory;
  } catch {
    return quickStartCompletedInMemory;
  }
}

export function completeQuickStart(): void {
  quickStartCompletedInMemory = true;

  try {
    localStorage.setItem(QUICK_START_STORAGE_KEY, 'completed');
  } catch {
    // The in-memory flag keeps the guide from reopening during this session.
  }
}

export function clearQuickStart(): void {
  quickStartCompletedInMemory = false;

  try {
    localStorage.removeItem(QUICK_START_STORAGE_KEY);
  } catch {
    // Reset still works for the current session when storage is blocked.
  }
}
