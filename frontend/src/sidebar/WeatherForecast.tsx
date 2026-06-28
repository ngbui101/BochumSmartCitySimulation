import React from 'react';
import type { WeatherForecastMonth, WeatherType, ForecastConfidence } from '../types/weather';

export interface WeatherForecastProps {
  forecast: WeatherForecastMonth[];
}

const SunnyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-testid="icon-sunny">
    <circle cx="12" cy="12" r="4" fill="#f59e0b" fillOpacity="0.2" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MixedIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-testid="icon-mixed">
    <path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41" stroke="#f59e0b" />
    <path d="M18.8 14.8A4 4 0 0 0 16 8h-1A6 6 0 1 0 5 13.6" />
    <path d="M16 12a4 4 0 0 0-4-4h-1a6 6 0 1 0 0 12h5a4 4 0 0 0 4-4z" fill="#cbd5e1" fillOpacity="0.2" />
  </svg>
);

const CloudyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-testid="icon-cloudy">
    <path d="M18.8 14.8A4 4 0 0 0 16 8h-1A6 6 0 1 0 5 13.6" />
    <path d="M16 12a4 4 0 0 0-4-4h-1a6 6 0 1 0 0 12h5a4 4 0 0 0 4-4z" fill="#cbd5e1" fillOpacity="0.2" />
  </svg>
);

const WindyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-testid="icon-windy">
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2M12.59 19.59A2 2 0 1 0 14 16H2M20 12a2 2 0 1 1-2 2H2" />
  </svg>
);

const StormyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-testid="icon-stormy">
    <path d="M18.8 14.8A4 4 0 0 0 16 8h-1a6 6 0 1 0-7.3 10.6" />
    <path d="M13 10L10 16h3l-1 6" stroke="#f59e0b" fill="#f59e0b" />
  </svg>
);

const weatherIcons: Record<WeatherType, React.ReactNode> = {
  sunny: <SunnyIcon />,
  mixed: <MixedIcon />,
  cloudy: <CloudyIcon />,
  windy: <WindyIcon />,
  stormy: <StormyIcon />,
};

const weatherLabels: Record<WeatherType, string> = {
  sunny: 'Sonnig',
  mixed: 'Wechselhaft',
  cloudy: 'Bewölkt',
  windy: 'Windig',
  stormy: 'Stürmisch',
};

const confidenceLabels: Record<ForecastConfidence, string> = {
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Niedrig',
};

const germanMonths = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

export const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecast }) => {
  // Ensure we display exactly the first 3 items from the forecast
  const displayedForecast = forecast.slice(0, 3);

  return (
    <div
      className="weather-forecast"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: '0.875rem',
          fontWeight: 700,
          color: '#3d6f5a',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Wetterprognose
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}
      >
        {displayedForecast.map((item, index) => {
          const monthName = germanMonths[item.monthOfYear] || `Monat ${item.monthIndex + 1}`;
          
          return (
            <div
              key={`${item.monthIndex}-${index}`}
              className="weather-card"
              data-testid="weather-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #d7e2da',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <span
                className="weather-month"
                data-testid="weather-month"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#374151',
                }}
              >
                {monthName}
              </span>
              <div style={{ display: 'flex', height: '24px', alignItems: 'center' }}>
                {weatherIcons[item.weatherType]}
              </div>
              <span
                className="weather-type"
                data-testid="weather-type"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#4b5563',
                }}
              >
                {weatherLabels[item.weatherType] || item.weatherType}
              </span>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  fontSize: '0.65rem',
                  color: '#6b7280',
                  marginTop: 'auto',
                }}
              >
                <span>Sicherheit</span>
                <span
                  className="weather-confidence"
                  data-testid="weather-confidence"
                  style={{
                    fontWeight: 700,
                    color: item.confidence === 'high' ? '#059669' : item.confidence === 'medium' ? '#d97706' : '#dc2626',
                  }}
                >
                  {confidenceLabels[item.confidence] || item.confidence}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
