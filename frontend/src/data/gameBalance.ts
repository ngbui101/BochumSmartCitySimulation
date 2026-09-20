/** Shared economy values for the production sweet-spot balance profile. */
export const STARTING_BUDGET = 18_000_000;
export const IMPORT_COST_PER_UNIT = 70_000;
export const REVENUE_PER_UNIT = 38_000;
export const GAME_DURATION_MONTHS = 60;
export const DEMAND_GROWTH_CAP = 1.35;
export const ZONE_ASSET_LIMIT_BEFORE_PENALTY = 2;
export const ZONE_CONGESTION_PENALTY_PER_ASSET = 1;

export function getZoneCongestionPenalty(publicAssetCount: number): number {
  return Math.max(0, publicAssetCount - ZONE_ASSET_LIMIT_BEFORE_PENALTY) *
    ZONE_CONGESTION_PENALTY_PER_ASSET;
}
