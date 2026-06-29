import React, { useState, useEffect, useRef } from 'react';

export interface KpiBarProps {
  label: string;
  value: number;
  delta?: number;
  unit?: string;
  icon?: React.ReactNode;
}

export const KpiBar: React.FC<KpiBarProps> = ({
  label,
  value,
  delta,
  unit = '',
  icon,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  const startAnimation = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setIsPlaying(true);
    setAnimationKey((prev) => prev + 1);
    timeoutRef.current = window.setTimeout(() => {
      setIsPlaying(false);
    }, 1500);
  };

  useEffect(() => {
    if (delta !== undefined && delta !== 0) {
      startAnimation();
    }
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [delta]);

  const handleMouseEnter = () => {
    if (delta !== undefined && delta !== 0) {
      startAnimation();
    }
  };

  const isImprove = delta !== undefined && delta > 0;
  const isWorsen = delta !== undefined && delta < 0;
  const activeClass = isPlaying
    ? isImprove
      ? 'delta-active-improve'
      : isWorsen
      ? 'delta-active-worsen'
      : ''
    : '';

  return (
    <div className={`kpi-bar-container ${activeClass}`} onMouseEnter={handleMouseEnter}>
      <div className="kpi-bar-header">
        <div className="kpi-bar-label-wrap">
          {icon && <span className="kpi-icon">{icon}</span>}
          <span className="kpi-label">{label}</span>
        </div>
        <div className="kpi-value-wrap">
          <span className="kpi-value">
            {value}
            {unit}
          </span>
          {isPlaying && delta !== undefined && delta !== 0 && (
            <span
              key={animationKey}
              className={`kpi-delta-indicator ${isImprove ? 'delta-improve' : 'delta-worsen'}`}
              data-testid="kpi-delta-indicator"
            >
              {isImprove ? `+${delta}` : delta}
              {unit}
            </span>
          )}
        </div>
      </div>
      <div className="kpi-progress-bg">
        <div
          className="kpi-progress-fill"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
};
