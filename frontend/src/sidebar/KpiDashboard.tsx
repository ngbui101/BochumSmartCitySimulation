import React from 'react';
import type { GameKpis } from '../types/game';
import { KpiBar } from '../components/KpiBar';

export interface KpiDashboardProps {
  budget: number;
  kpis: GameKpis;
  deltas?: {
    energyAutarky?: number;
    citizenSatisfaction?: number;
    supplySecurity?: number;
  };
}

const EnergyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const SmileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const KpiDashboard: React.FC<KpiDashboardProps> = ({
  budget,
  kpis,
  deltas,
}) => {
  const formattedBudget = `${budget.toLocaleString('de-DE')} Euro`;

  return (
    <div
      className="kpi-dashboard"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        className="budget-display"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          padding: '12px',
          backgroundColor: '#ffffff',
          border: '1px solid #d7e2da',
          borderRadius: '8px',
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            color: '#526259',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Budget
        </span>
        <span
          className="budget-value"
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#17211b',
          }}
          data-testid="budget-value"
        >
          {formattedBudget}
        </span>
      </div>

      <div
        className="kpi-bars-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <KpiBar
          label="Energieautarkie"
          value={kpis.energyAutarky}
          delta={deltas?.energyAutarky}
          unit="%"
          icon={<EnergyIcon />}
        />
        <KpiBar
          label="Bürgerzufriedenheit"
          value={kpis.citizenSatisfaction}
          delta={deltas?.citizenSatisfaction}
          unit="%"
          icon={<SmileIcon />}
        />
        <KpiBar
          label="Versorgungssicherheit"
          value={kpis.supplySecurity}
          delta={deltas?.supplySecurity}
          unit="%"
          icon={<ShieldIcon />}
        />
      </div>
    </div>
  );
};
