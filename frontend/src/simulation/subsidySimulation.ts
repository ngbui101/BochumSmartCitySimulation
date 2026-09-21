import { subsidyPrograms } from '../data/subsidyPrograms';
import type { GameState } from '../types/game';
import { createPrivateAsset, PRIVATE_ASSET_THRESHOLD } from './privateAssets';
import { getSubsidies } from './monthlyBalance';

/** Spend this month's subsidy, retaining the remainder toward the next asset. */
export function calculateNextSubsidies(state: GameState): {
  subsidies: NonNullable<GameState['subsidies']>;
  privateAssets: NonNullable<GameState['privateAssets']>;
} {
  const subsidies = getSubsidies(state);
  const privateAssets = [...(state.privateAssets ?? [])];

  const nextProgramState = (program: 'solar' | 'storage') => {
    const programState = subsidies[program];
    const accumulatedSpend =
      (programState.spendAccumulator ?? 0) +
      programState.level * subsidyPrograms[program].monthlyCostPerLevel;
    const newAssetCount = Math.floor(accumulatedSpend / PRIVATE_ASSET_THRESHOLD);
    const nextPrivateAssets = Array.from({ length: newAssetCount }, (_, index) =>
      createPrivateAsset(program, state.currentMonthIndex + 1, index + 1, privateAssets.length)
    );

    privateAssets.push(...nextPrivateAssets);

    return {
      ...programState,
      privateCapacity:
        programState.privateCapacity + newAssetCount * subsidyPrograms[program].capacityPerAsset,
      spendAccumulator: accumulatedSpend - newAssetCount * PRIVATE_ASSET_THRESHOLD
    };
  };

  return {
    subsidies: {
      solar: nextProgramState('solar'),
      storage: nextProgramState('storage')
    },
    privateAssets
  };
}
