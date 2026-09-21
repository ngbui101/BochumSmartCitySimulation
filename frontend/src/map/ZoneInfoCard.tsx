import React from 'react';
import type { ItemType } from '../types/assets';
import type { ZoneRule } from '../types/zones';
import { ZoneProfileMedia } from '../ui/ZoneProfileMedia';
import type { getZoneInfoPosition } from './zoneInfoPosition';

const itemTypeLabels: Record<ItemType, string> = {
  solar: 'Solar',
  wind: 'Wind',
  storage: 'Speicher'
};

const demandProfileLabels = {
  commercial_core: 'Gewerbezentrum',
  mixed: 'Gemischt',
  campus: 'Campus',
  residential: 'Wohnen',
  suburban: 'Vorstadt'
} as const;

const acceptanceSensitivityLabels = {
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch'
} as const;

type ZoneInfoCardProps = {
  zone: ZoneRule;
  position: ReturnType<typeof getZoneInfoPosition>;
  onClose: () => void;
};

export function ZoneInfoCard({ zone, position, onClose }: ZoneInfoCardProps) {
  return (
        <div
          className="zone-info-card"
          data-testid="zone-info-card"
          data-placement={position.placement}
          role="status"
          style={{
            position: 'absolute',
            left: `${position.left}px`,
            top: `${position.top}px`,
            zIndex: 1000,
            width: 'min(320px, calc(100% - 48px))',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <button
            type="button"
            className="zone-info-card__close"
            aria-label="Zone-Information schliessen"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
          >
            &times;
          </button>
          <ZoneProfileMedia
            zoneId={zone.zoneId}
            label={zone.label}
            className="zone-info-card__media"
          />
          <div className="zone-info-card__header">
            <strong>{zone.label}</strong>
            <span>{demandProfileLabels[zone.demandProfile]}</span>
          </div>
          <div className="zone-info-card__meta">
            <span>
              Akzeptanzsensibilitaet:{' '}
              {acceptanceSensitivityLabels[zone.acceptanceSensitivity]}
            </span>
            <span>
              Erlaubt:{' '}
              {zone.allowedItemTypes.map((itemType) => itemTypeLabels[itemType]).join(', ')}
            </span>
            <span>
              Kapazität: Solar {zone.capacity.solar}, Wind{' '}
              {zone.capacity.wind}, Speicher {zone.capacity.storage}
            </span>
          </div>
        </div>
  );
}
