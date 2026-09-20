import { weatherProfiles } from '../data/weatherProfiles';
import type { ForecastConfidence, WeatherForecastMonth, WeatherProfile, WeatherType } from '../types/weather';

type WeatherWeights = Record<WeatherType, number>;

const seasonalWeatherWeights: Record<'winter' | 'spring' | 'summer' | 'autumn', WeatherWeights> = {
  winter: { sunny: 0.2, mixed: 0.1, cloudy: 0.2, windy: 0.3, stormy: 0.2 },
  spring: { sunny: 0.35, mixed: 0.35, cloudy: 0.15, windy: 0.1, stormy: 0.05 },
  summer: { sunny: 0.7, mixed: 0.15, cloudy: 0.08, windy: 0.05, stormy: 0.02 },
  autumn: { sunny: 0.3, mixed: 0.25, cloudy: 0.25, windy: 0.15, stormy: 0.05 }
};

const weatherAdjustments: Record<WeatherType, { solar: number; wind: number }> = {
  sunny: { solar: 1.18, wind: 0.78 },
  mixed: { solar: 1, wind: 0.98 },
  cloudy: { solar: 0.82, wind: 1 },
  windy: { solar: 0.68, wind: 1.2 },
  stormy: { solar: 0.58, wind: 1.32 }
};

const weatherTypes: WeatherType[] = ['sunny', 'mixed', 'cloudy', 'windy', 'stormy'];

function getSeason(monthOfYear: number): keyof typeof seasonalWeatherWeights {
  if ([11, 0, 1].includes(monthOfYear)) return 'winter';
  if ([2, 3, 4].includes(monthOfYear)) return 'spring';
  if ([5, 6, 7].includes(monthOfYear)) return 'summer';
  return 'autumn';
}

function seededPercentage(seed: number, monthOfYear: number): number {
  const normalizedSeed = ((Math.trunc(seed) % 100) + 100) % 100;
  return (normalizedSeed + monthOfYear * 37) % 100;
}

function selectRandomWeatherType(monthOfYear: number, seed: number): WeatherType {
  const weights = seasonalWeatherWeights[getSeason(monthOfYear)];
  const target = seededPercentage(seed, monthOfYear) / 100;
  let cumulative = 0;

  for (const weatherType of weatherTypes) {
    cumulative += weights[weatherType];
    if (target < cumulative) return weatherType;
  }

  return 'mixed';
}

function createSeededWeatherProfile(monthIndex: number, seed: number): WeatherProfile {
  const monthOfYear = normalizeMonthOfYear(monthIndex);
  const baseProfile = weatherProfiles[monthOfYear];
  const weatherType = selectRandomWeatherType(monthOfYear, seed);
  const baseAdjustment = weatherAdjustments[baseProfile.weatherType];
  const adjustment = weatherAdjustments[weatherType];

  return {
    monthOfYear,
    weatherType,
    solarFactor: Math.round(baseProfile.solarFactor * (adjustment.solar / baseAdjustment.solar) * 100) / 100,
    windFactor: Math.round(baseProfile.windFactor * (adjustment.wind / baseAdjustment.wind) * 100) / 100,
    confidence: 'high'
  };
}

export function createRandomWeatherSeed(): number {
  const cryptoObject = globalThis.crypto;

  if (cryptoObject?.getRandomValues) {
    const values = new Uint32Array(1);
    cryptoObject.getRandomValues(values);
    return Math.max(1, values[0] ?? 1);
  }

  return Math.max(1, Math.floor(Math.random() * 2_147_483_647));
}

export function deriveWeatherSeed(gameId: string): number {
  let hash = 2_166_136_261;

  for (const character of gameId) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }

  return Math.max(1, hash >>> 0);
}

function normalizeMonthOfYear(monthIndex: number): number {
  return ((monthIndex % 12) + 12) % 12;
}

function confidenceForOffset(offset: number): ForecastConfidence {
  if (offset === 0) {
    return 'high';
  }

  if (offset === 1) {
    return 'medium';
  }

  return 'low';
}

export function getWeatherProfileForMonth(monthIndex: number, weatherSeed?: number): WeatherProfile {
  if (weatherSeed === undefined || weatherSeed === 0) {
    return weatherProfiles[normalizeMonthOfYear(monthIndex)];
  }

  return createSeededWeatherProfile(monthIndex, weatherSeed);
}

export function createForecast(currentMonthIndex: number, weatherSeed?: number): WeatherForecastMonth[] {
  return [0, 1, 2].map((offset) => {
    const monthIndex = currentMonthIndex + offset;
    const monthOfYear = normalizeMonthOfYear(monthIndex);
    const profile = getWeatherProfileForMonth(monthIndex, weatherSeed);

    return {
      monthIndex,
      monthOfYear,
      weatherType: profile.weatherType,
      confidence: confidenceForOffset(offset),
      solarFactor: profile.solarFactor,
      windFactor: profile.windFactor
    };
  });
}
