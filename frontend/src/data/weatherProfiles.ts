import type { WeatherProfile } from '../types/weather';

export const weatherProfiles: WeatherProfile[] = [
  { monthOfYear: 0, weatherType: 'windy', solarFactor: 0.55, windFactor: 1.25, confidence: 'high' },
  { monthOfYear: 1, weatherType: 'windy', solarFactor: 0.65, windFactor: 1.2, confidence: 'high' },
  { monthOfYear: 2, weatherType: 'mixed', solarFactor: 0.85, windFactor: 1.05, confidence: 'high' },
  { monthOfYear: 3, weatherType: 'mixed', solarFactor: 1.0, windFactor: 0.95, confidence: 'high' },
  { monthOfYear: 4, weatherType: 'sunny', solarFactor: 1.2, windFactor: 0.85, confidence: 'high' },
  { monthOfYear: 5, weatherType: 'sunny', solarFactor: 1.35, windFactor: 0.75, confidence: 'high' },
  { monthOfYear: 6, weatherType: 'sunny', solarFactor: 1.4, windFactor: 0.7, confidence: 'high' },
  { monthOfYear: 7, weatherType: 'sunny', solarFactor: 1.3, windFactor: 0.75, confidence: 'high' },
  { monthOfYear: 8, weatherType: 'mixed', solarFactor: 1.05, windFactor: 0.95, confidence: 'high' },
  { monthOfYear: 9, weatherType: 'cloudy', solarFactor: 0.8, windFactor: 1.1, confidence: 'high' },
  { monthOfYear: 10, weatherType: 'windy', solarFactor: 0.6, windFactor: 1.25, confidence: 'high' },
  { monthOfYear: 11, weatherType: 'stormy', solarFactor: 0.5, windFactor: 1.35, confidence: 'high' }
];
