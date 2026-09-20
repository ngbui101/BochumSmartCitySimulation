import { describe, expect, it } from 'vitest';

import { IMPORT_COST_PER_UNIT, REVENUE_PER_UNIT } from '../../src/data/gameBalance';
import { itemDefinitions } from '../../src/data/itemDefinitions';
import { subsidyPrograms } from '../../src/data/subsidyPrograms';

describe('production sweet spot balance', () => {
  it('uses the values selected from the strategy sweep', () => {
    expect(IMPORT_COST_PER_UNIT).toBe(70_000);
    expect(REVENUE_PER_UNIT).toBe(38_000);
    expect(itemDefinitions.find((item) => item.itemType === 'wind')?.operatingCost).toBe(400_000);
    expect(subsidyPrograms.solar.adoptionPerLevel).toBe(0.1);
    expect(subsidyPrograms.storage.adoptionPerLevel).toBe(0.1);
  });
});
