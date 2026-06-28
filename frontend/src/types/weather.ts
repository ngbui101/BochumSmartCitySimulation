export type WeatherType = 'sunny' | 'mixed' | 'windy' | 'stormy' | 'cloudy';

export type ForecastConfidence = 'high' | 'medium' | 'low';

export type WeatherProfile = {
  monthOfYear: number;
  weatherType: WeatherType;
  solarFactor: number;
  windFactor: number;
  confidence: ForecastConfidence;
};

export type WeatherForecastMonth = {
  monthIndex: number;
  monthOfYear: number;
  weatherType: WeatherType;
  confidence: ForecastConfidence;
};
