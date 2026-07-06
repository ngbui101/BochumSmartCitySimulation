import React from 'react';
import { subsidyPrograms } from '../data/subsidyPrograms';
import type { SubsidyLevel, SubsidyProgram, SubsidyState } from '../types/game';

export interface SubsidyPanelProps {
  subsidies: SubsidyState;
  subsidyCosts: number;
  privateSolarProduction: number;
  privateStorageDischarge: number;
  onSetSubsidyLevel?: (program: SubsidyProgram, level: SubsidyLevel) => void;
}

const levelOptions: SubsidyLevel[] = [0, 1, 2, 3];

function formatEuro(value: number): string {
  return value.toLocaleString('de-DE');
}

function formatEnergy(value: number): string {
  return (Math.round(value * 10) / 10).toLocaleString('de-DE');
}

function getNextLevel(currentLevel: SubsidyLevel): SubsidyLevel {
  return ((currentLevel + 1) % 4) as SubsidyLevel;
}

export const SubsidyPanel: React.FC<SubsidyPanelProps> = ({
  subsidies,
  subsidyCosts,
  privateSolarProduction,
  privateStorageDischarge,
  onSetSubsidyLevel
}) => {
  const handleCycleLevel = (program: SubsidyProgram) => {
    onSetSubsidyLevel?.(program, getNextLevel(subsidies[program].level));
  };

  return (
    <section className="subsidy-panel" data-testid="subsidy-panel" aria-label="Foerderung">
      <div className="subsidy-panel__header">
        <h3>Foerderung</h3>
        <span>{formatEuro(subsidyCosts)} Euro/Monat</span>
      </div>

      <div className="subsidy-panel__programs">
        {(['solar', 'storage'] as SubsidyProgram[]).map((program) => {
          const programState = subsidies[program];
          const definition = subsidyPrograms[program];
          const nextLevel = getNextLevel(programState.level);

          return (
            <div className="subsidy-program" key={program}>
              <button
                type="button"
                className="subsidy-program__button"
                aria-label={`${definition.label} Stufe ${nextLevel}`}
                onClick={() => handleCycleLevel(program)}
              >
                <span>{definition.label}</span>
                <strong>Stufe {programState.level}</strong>
              </button>
              <div className="subsidy-program__levels" aria-hidden="true">
                {levelOptions.map((level) => (
                  <span
                    className={level <= programState.level ? 'subsidy-level subsidy-level--active' : 'subsidy-level'}
                    key={level}
                  />
                ))}
              </div>
              <span className="subsidy-program__meta">
                Privat: {formatEnergy(programState.privateCapacity)} Einh.
              </span>
            </div>
          );
        })}
      </div>

      <dl className="subsidy-panel__effects">
        <div>
          <dt>Private Solarhilfe</dt>
          <dd>{formatEnergy(privateSolarProduction)} Einh.</dd>
        </div>
        <div>
          <dt>Speicherentlastung</dt>
          <dd>{formatEnergy(privateStorageDischarge)} Einh.</dd>
        </div>
      </dl>
    </section>
  );
};
