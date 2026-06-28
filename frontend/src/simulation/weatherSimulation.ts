import { weatherProfiles } from '../data/weatherProfiles';
import type { ForecastConfidence, WeatherForecastMonth, WeatherProfile } from '../types/weather';

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

export function getWeatherProfileForMonth(monthIndex: number): WeatherProfile {
  return weatherProfiles[normalizeMonthOfYear(monthIndex)];
}

export function createForecast(currentMonthIndex: number): WeatherForecastMonth[] {
  return [0, 1, 2].map((offset) => {
    const monthIndex = currentMonthIndex + offset;
    const monthOfYear = normalizeMonthOfYear(monthIndex);
    const profile = getWeatherProfileForMonth(monthIndex);

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
