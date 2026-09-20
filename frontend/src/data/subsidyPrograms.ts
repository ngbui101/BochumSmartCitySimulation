import type { SubsidyProgram } from '../types/game';

export const MAX_SUBSIDY_LEVEL = 3;

export const subsidyPrograms: Record<SubsidyProgram, {
  label: string;
  monthlyCostPerLevel: number;
  adoptionPerLevel: number;
  capacityPerAsset: number;
}> = {
  solar: {
    label: 'Solarförderung',
    monthlyCostPerLevel: 250_000,
    adoptionPerLevel: 0.1,
    capacityPerAsset: 7
  },
  storage: {
    label: 'Speicherförderung',
    monthlyCostPerLevel: 180_000,
    adoptionPerLevel: 0.1,
    capacityPerAsset: 10
  }
};

export function clampSubsidyLevel(level: number): 0 | 1 | 2 | 3 {
  return Math.max(0, Math.min(MAX_SUBSIDY_LEVEL, Math.round(level))) as 0 | 1 | 2 | 3;
}
