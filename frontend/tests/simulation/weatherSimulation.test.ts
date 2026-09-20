import { describe, expect, it } from 'vitest';

import { createForecast, getWeatherProfileForMonth } from '../../src/simulation/weatherSimulation';

describe('weatherSimulation', () => {
  it('creates a deterministic three-month forecast', () => {
    const forecast = createForecast(4);

    expect(forecast).toHaveLength(3);
    expect(createForecast(4)).toEqual(forecast);
    expect(forecast.map((month) => month.monthIndex)).toEqual([4, 5, 6]);
    expect(forecast.map((month) => month.confidence)).toEqual(['high', 'medium', 'low']);
  });

  it('includes weather type and seasonal production factors', () => {
    const [month] = createForecast(6);

    expect(month.weatherType).toBe('sunny');
    expect(month.solarFactor).toBeGreaterThan(1);
    expect(month.windFactor).toBeLessThan(1);
  });

  it('makes solar stronger in summer than winter', () => {
    const january = getWeatherProfileForMonth(0);
    const july = getWeatherProfileForMonth(6);

    expect(july.solarFactor).toBeGreaterThan(january.solarFactor);
  });

  it('makes wind stronger in winter than peak summer', () => {
    const january = getWeatherProfileForMonth(0);
    const july = getWeatherProfileForMonth(6);

    expect(january.windFactor).toBeGreaterThan(july.windFactor);
  });

  it('uses the production sweet spot probabilities for seeded sessions', () => {
    const summerProfiles = Array.from({ length: 100 }, (_, index) =>
      getWeatherProfileForMonth(6, index + 1)
    );
    const winterProfiles = Array.from({ length: 100 }, (_, index) =>
      getWeatherProfileForMonth(0, index + 1)
    );

    expect(getWeatherProfileForMonth(6, 42)).toEqual(getWeatherProfileForMonth(6, 42));
    expect(summerProfiles.filter((profile) => profile.weatherType === 'sunny')).toHaveLength(70);
    expect(winterProfiles.filter((profile) => profile.weatherType === 'sunny')).toHaveLength(20);
    expect(new Set(summerProfiles.map((profile) => profile.weatherType)).size).toBeGreaterThan(1);
  });
});
