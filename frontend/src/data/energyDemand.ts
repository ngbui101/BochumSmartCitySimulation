import { DEMAND_GROWTH_CAP, GAME_DURATION_MONTHS } from './gameBalance';

/**
 * Monatlicher Strombedarf der Stadt Bochum in Energieeinheiten.
 * Saisonal variierend: Winter höher (Heizung, weniger Tageslicht), Sommer niedriger.
 * Index 0 = Januar, Index 11 = Dezember.
 */
const MONTHLY_ENERGY_DEMAND: readonly number[] = [
  95, // Jan – windy, Heizung
  90, // Feb – windy, Heizung
  80, // Mär – mixed, Übergang
  72, // Apr – mixed, Frühling
  65, // Mai – sunny, mild
  60, // Jun – sunny, Sommer
  60, // Jul – sunny, Sommer (Minimum)
  63, // Aug – sunny, leicht steigend
  70, // Sep – mixed, Herbst
  78, // Okt – cloudy, kühler
  88, // Nov – windy, Heizung
  100 // Dez – stormy, Heizung (Maximum)
];

function normalizeMonthOfYear(monthIndex: number): number {
  return ((monthIndex % 12) + 12) % 12;
}

/**
 * Gibt den Energiebedarf für einen gegebenen Monat-Index zurück.
 * Wird auf den Kalendermonat (0–11) normalisiert.
 */
export function getEnergyDemandForMonth(monthIndex: number): number {
  const baseDemand = MONTHLY_ENERGY_DEMAND[normalizeMonthOfYear(monthIndex)];
  const progress =
    Math.min(Math.max(monthIndex, 0), GAME_DURATION_MONTHS - 1) /
    (GAME_DURATION_MONTHS - 1);
  const growthFactor = 1 + (DEMAND_GROWTH_CAP - 1) * progress;

  return Math.round(baseDemand * growthFactor);
}
