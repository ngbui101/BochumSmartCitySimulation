import React from 'react';
import type { PlayerAsset, ExistingAsset } from '../types/assets';
import { zoneRules } from '../data/zoneRules';
import { itemDefinitions } from '../data/itemDefinitions';
import { getPlayerAssetSellValue } from '../game/selectors';
import { AssetIconImage } from '../ui/gameAssetIcons';

export interface AssetDetailsPanelProps {
  selectedAsset?: PlayerAsset | ExistingAsset;
  onSell?: (id: string) => void;
}

const playerAssetLabels = {
  solar: 'Solaranlage',
  wind: 'Kleinwindanlage',
  storage: 'Energiespeicher',
} as const;

const panelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px',
  backgroundColor: 'transparent',
  border: '0',
  boxShadow: 'none',
};

const headerStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.08rem',
  fontWeight: 800,
  color: '#111827',
};

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  borderBottom: '1px solid #f3f4f6',
  paddingBottom: '8px',
};

const detailGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  fontSize: '0.84rem',
  borderBottom: '1px solid #f9fafb',
  paddingBottom: '4px',
};

const labelStyle: React.CSSProperties = {
  color: '#4b5563',
  fontWeight: 600,
};

const valueStyle: React.CSSProperties = {
  color: '#111827',
  fontWeight: 700,
  textAlign: 'right',
};

export const AssetDetailsPanel: React.FC<AssetDetailsPanelProps> = ({
  selectedAsset,
  onSell,
}) => {
  if (!selectedAsset) {
    return null;
  }

  const isPlayer = 'itemType' in selectedAsset;
  const zoneRule = zoneRules.find((z) => z.zoneId === selectedAsset.zoneId);
  const zoneLabel = zoneRule ? zoneRule.label : selectedAsset.zoneId;

  if (isPlayer) {
    const playerAsset = selectedAsset as PlayerAsset;
    const def = itemDefinitions.find((d) => d.itemType === playerAsset.itemType);
    const labelType = playerAssetLabels[playerAsset.itemType] ?? def?.label ?? playerAsset.itemType;
    const productionCap = def ? def.productionValue : 0;
    const storageCap = def ? def.storageValue : 0;
    const operatingCost = def ? def.operatingCost : 0;
    const sellValue = getPlayerAssetSellValue(playerAsset);
    const isConstruction = playerAsset.status === 'under_construction';

    return (
      <div className="asset-details-panel" style={panelStyle}>
        <div style={headerRowStyle}>
          <AssetIconImage
            itemType={playerAsset.itemType}
            status={playerAsset.status}
            isSelected
            size={50}
          />
          <h3 style={headerStyle} data-testid="asset-title">
            {labelType}
          </h3>
        </div>

        <div style={detailGroupStyle}>
          <div style={rowStyle}>
            <span style={labelStyle}>Typ:</span>
            <span style={valueStyle} data-testid="asset-type">{labelType}</span>
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>Zone:</span>
            <span style={valueStyle} data-testid="asset-zone">{zoneLabel}</span>
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>Status:</span>
            <span
              className={`status-badge ${isConstruction ? 'status-construction' : 'status-active'}`}
              style={{
                ...valueStyle,
                color: isConstruction ? '#d97706' : '#059669',
              }}
              data-testid="asset-status"
            >
              {isConstruction ? 'In Bau (under_construction)' : 'Aktiv (active)'}
            </span>
          </div>

          {productionCap > 0 && (
            <div style={rowStyle}>
              <span style={labelStyle}>Produktionskapazität:</span>
              <span style={valueStyle} data-testid="asset-production-capacity">
                {productionCap} MW
              </span>
            </div>
          )}

          {storageCap > 0 && (
            <div style={rowStyle}>
              <span style={labelStyle}>Speicherkapazität:</span>
              <span style={valueStyle} data-testid="asset-storage-capacity">
                {storageCap} MWh
              </span>
            </div>
          )}

          <div style={rowStyle}>
            <span style={labelStyle}>Betriebskosten:</span>
            <span style={valueStyle} data-testid="asset-operating-costs">
              {operatingCost.toLocaleString('de-DE')} €/Monat
            </span>
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>Verkaufswert:</span>
            <span style={valueStyle} data-testid="asset-sell-value">
              {sellValue.toLocaleString('de-DE')} €
            </span>
          </div>
        </div>

        <button onClick={() => onSell?.(selectedAsset.id)} className="sell-button">
          Verkaufen
        </button>
      </div>
    );
  }

  const existingAsset = selectedAsset as ExistingAsset;

  return (
    <div className="asset-details-panel" style={panelStyle}>
      <h3 style={headerStyle} data-testid="asset-title">
        {existingAsset.name}
      </h3>

      <div style={detailGroupStyle}>
        <div style={rowStyle}>
          <span style={labelStyle}>Typ:</span>
          <span style={valueStyle} data-testid="asset-type">{existingAsset.assetTypeLabel}</span>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>Zone:</span>
          <span style={valueStyle} data-testid="asset-zone">{zoneLabel}</span>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>Status:</span>
          <span
            className="status-badge status-existing"
            style={{ ...valueStyle, color: '#4b5563' }}
            data-testid="asset-status"
          >
            {existingAsset.statusLabel || 'Bestand'}
          </span>
        </div>

        <div style={{ ...rowStyle, flexDirection: 'column', gap: '4px', borderBottom: 'none' }}>
          <span style={labelStyle}>Beschreibung:</span>
          <span
            style={{
              ...valueStyle,
              textAlign: 'left',
              fontWeight: 500,
              color: '#374151',
              lineHeight: 1.4,
              backgroundColor: '#f9fafb',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #f3f4f6'
            }}
            data-testid="asset-role-description"
          >
            {existingAsset.roleDescription}
          </span>
        </div>
      </div>

      <div className="readonly-notice">
        Keine Änderung möglich (Bestandsanlage)
      </div>
    </div>
  );
};
