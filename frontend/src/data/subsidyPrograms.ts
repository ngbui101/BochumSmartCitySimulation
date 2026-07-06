import type { SubsidyProgram } from '../types/game';

export const MAX_SUBSIDY_LEVEL = 3;

export const subsidyPrograms: Record<SubsidyProgram, {
  label: string;
  monthlyCostPerLevel: number;
  adoptionPerLevel: number;
}> = {
  solar: {
    label: 'Solarförderung',
    monthlyCostPerLevel: 250_000,
    adoptionPerLevel: 2
  },
  storage: {
    label: 'Speicherförderung',
    monthlyCostPerLevel: 180_000,
    adoptionPerLevel: 3
  }
};

export function clampSubsidyLevel(level: number): 0 | 1 | 2 | 3 {
  return Math.max(0, Math.min(MAX_SUBSIDY_LEVEL, Math.round(level))) as 0 | 1 | 2 | 3;
}
