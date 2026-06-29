import React from 'react';
import type { GameKpis } from '../types/game';
import { KpiBar } from '../components/KpiBar';

export interface EnergyStatusProps {
  energySaldo: number;
  importCost: number;
  storedEnergy: number;
  storageCapacity: number;
  isGracePeriod: boolean;
  netMonthlyDelta: number;
  revenueFromSales: number;
}

export interface KpiDashboardProps {
  budget: number;
  kpis: GameKpis;
  energyStatus: EnergyStatusProps;
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

const PlugIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18" />
    <path d="M7 6v4" />
    <path d="M17 6v4" />
    <path d="M11 14H7a2 2 0 0 0-2 2v4h12v-4a2 2 0 0 0-2-2h-4z" />
  </svg>
);

const BatteryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
    <path d="M22 11v2" />
  </svg>
);

const EnergyStatusRow: React.FC<EnergyStatusProps> = ({
  energySaldo,
  importCost,
  storedEnergy,
  storageCapacity,
  isGracePeriod,
  revenueFromSales
}) => {
  const hasDeficit = energySaldo < 0;
  const hasSurplus = energySaldo > 0;
  const saldoRounded = Math.round(energySaldo * 10) / 10;
  const importCostFormatted = importCost.toLocaleString('de-DE');
  const revenueFormatted = revenueFromSales.toLocaleString('de-DE');

  return (
    <div className="energy-status-row" data-testid="energy-status-row">
      <div className="energy-status-header">
        <EnergyIcon />
        <span className="energy-status-label">Energie-Saldo</span>
        {isGracePeriod && (
          <span className="energy-grace-badge" title="Importkosten starten ab Monat 1">Schonfrist</span>
        )}
      </div>

      <div className={`energy-saldo-value ${hasDeficit ? 'energy-deficit' : 'energy-ok'}`}>
        {hasDeficit ? (
          <>
            <span className="saldo-number">{saldoRounded} Einh.</span>
            <span className="saldo-detail">
              <PlugIcon />
              Import: {importCostFormatted} €/Monat
            </span>
            <span className="saldo-detail">
              💰 Stromverkauf: +{revenueFormatted} €
            </span>
          </>
        ) : hasSurplus ? (
          <>
            <span className="saldo-number">+{saldoRounded} Einh. Überschuss</span>
            {storageCapacity > 0 && (
              <span className="saldo-detail">
                <BatteryIcon />
                Gespeichert: {Math.round(storedEnergy * 10) / 10} / {storageCapacity} Einh.
              </span>
            )}
            {storageCapacity === 0 && (
              <span className="saldo-detail saldo-waste">⚠ Überschuss wird verschwendet</span>
            )}
            <span className="saldo-detail">
              💰 Stromverkauf: +{revenueFormatted} €
            </span>
          </>
        ) : (
          <>
            <span className="saldo-number">± 0 Einh. – ausgeglichen</span>
            <span className="saldo-detail">
              💰 Stromverkauf: +{revenueFormatted} €
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export const KpiDashboard: React.FC<KpiDashboardProps> = ({
  budget,
  kpis,
  energyStatus,
  deltas,
}) => {
  const formattedBudget = `${budget.toLocaleString('de-DE')} Euro`;
  const deltaVal = energyStatus.netMonthlyDelta;
  const deltaFormatted = `${deltaVal >= 0 ? '+' : ''}${deltaVal.toLocaleString('de-DE')} €/Monat`;
  const deltaClass = deltaVal >= 0 ? 'budget-delta-positive' : 'budget-delta-negative';

  return (
    <div className="kpi-dashboard">
      <div className="budget-display">
        <span>Budget</span>
        <strong className="budget-value" data-testid="budget-value">
          {formattedBudget}
          <span className={`budget-delta ${deltaClass}`}> ({deltaFormatted})</span>
        </strong>
      </div>

      <EnergyStatusRow {...energyStatus} />

      <div className="kpi-bars-container">
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
