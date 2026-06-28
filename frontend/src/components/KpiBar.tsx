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

  // Root class applies delta-active-improve / delta-active-worsen when playing
  const activeClass = isPlaying
    ? isImprove
      ? 'delta-active-improve'
      : isWorsen
      ? 'delta-active-worsen'
      : ''
    : '';

  return (
    <div
      className={`kpi-bar-container ${activeClass}`}
      onMouseEnter={handleMouseEnter}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '8px 12px',
        backgroundColor: '#ffffff',
        border: '1px solid #d7e2da',
        borderRadius: '8px',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon && (
            <span style={{ display: 'flex', alignItems: 'center', color: '#3d6f5a' }}>
              {icon}
            </span>
          )}
          <span
            className="kpi-label"
            style={{
              fontWeight: 600,
              fontSize: '0.8rem',
              color: '#374151',
              transition: 'color 0.2s ease',
            }}
          >
            {label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
          <span
            className="kpi-value"
            style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#111827',
              transition: 'color 0.2s ease',
            }}
          >
            {value}
            {unit}
          </span>
          {isPlaying && delta !== undefined && delta !== 0 && (
            <span
              key={animationKey}
              className={`kpi-delta-indicator ${isImprove ? 'delta-improve' : 'delta-worsen'}`}
              data-testid="kpi-delta-indicator"
              style={{
                position: 'absolute',
                right: 0,
                top: '-20px',
                fontWeight: 700,
                fontSize: '0.875rem',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {isImprove ? `+${delta}` : delta}
              {unit}
            </span>
          )}
        </div>
      </div>
      <div
        className="kpi-progress-bg"
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          className="kpi-progress-fill"
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            height: '100%',
            backgroundColor: '#3d6f5a',
            borderRadius: '4px',
            transition: 'width 0.3s ease, background-color 0.2s ease',
          }}
        />
      </div>
    </div>
  );
};
