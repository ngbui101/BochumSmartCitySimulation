import React from 'react';
import type { PlayerAsset, ExistingAsset } from '../types/assets';
import { zoneRules } from '../data/zoneRules';
import { itemDefinitions } from '../data/itemDefinitions';
import { getPlayerAssetSellValue } from '../game/selectors';

export interface AssetDetailsPanelProps {
  selectedAsset?: PlayerAsset | ExistingAsset;
  onSell?: (id: string) => void;
}

export const AssetDetailsPanel: React.FC<AssetDetailsPanelProps> = ({
  selectedAsset,
  onSell,
}) => {
  if (!selectedAsset) {
    return null;
  }

  // Determine if it's a player asset or existing asset
  const isPlayer = 'itemType' in selectedAsset;

  // Resolve Zone Label
  const zoneRule = zoneRules.find((z) => z.zoneId === selectedAsset.zoneId);
  const zoneLabel = zoneRule ? zoneRule.label : selectedAsset.zoneId;

  // Resolve Asset type labels and info
  let labelType = '';
  let statusText = '';
  let statusClass = '';

  if (isPlayer) {
    const playerAsset = selectedAsset as PlayerAsset;
    
    // Resolve Item type label with umlaut support for Windmühle
    if (playerAsset.itemType === 'solar') {
      labelType = 'Solaranlage';
    } else if (playerAsset.itemType === 'wind') {
      labelType = 'Windmühle';
    } else if (playerAsset.itemType === 'storage') {
      labelType = 'Energiespeicher';
    } else {
      const def = itemDefinitions.find((d) => d.itemType === playerAsset.itemType);
      labelType = def ? def.label : playerAsset.itemType;
    }

    // Resolve friendly status description and keep raw text for easy test asserting
    if (playerAsset.status === 'under_construction') {
      statusText = 'In Bau (under_construction)';
      statusClass = 'status-construction';
    } else {
      statusText = 'Aktiv (active)';
      statusClass = 'status-active';
    }
  } else {
    const existingAsset = selectedAsset as ExistingAsset;
    labelType = existingAsset.assetTypeLabel;
    statusText = existingAsset.statusLabel || 'Bestand';
    statusClass = 'status-existing';
  }

  const handleSellClick = () => {
    if (onSell) {
      onSell(selectedAsset.id);
    }
  };

  // Main container styles
  const panelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd8d0',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  };

  const headerStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#111827',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '8px',
  };

  const detailGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    borderBottom: '1px solid #f9fafb',
    paddingBottom: '4px',
  };

  const labelStyle: React.CSSProperties = {
    color: '#4b5563',
    fontWeight: 500,
  };

  const valueStyle: React.CSSProperties = {
    color: '#111827',
    fontWeight: 600,
  };

  if (isPlayer) {
    const playerAsset = selectedAsset as PlayerAsset;
    const def = itemDefinitions.find((d) => d.itemType === playerAsset.itemType);
    
    const productionCap = def ? def.productionValue : 0;
    const storageCap = def ? def.storageValue : 0;
    const operatingCost = def ? def.operatingCost : 0;
    const sellValue = getPlayerAssetSellValue(playerAsset);

    return (
      <div className="asset-details-panel" style={panelStyle}>
        <h3 style={headerStyle} data-testid="asset-title">
          {labelType}
        </h3>
        
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
              className={`status-badge ${statusClass}`}
              style={{
                ...valueStyle,
                color: playerAsset.status === 'under_construction' ? '#d97706' : '#059669',
              }}
              data-testid="asset-status"
            >
              {statusText}
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

        <button
          onClick={handleSellClick}
          className="sell-button"
          style={{
            marginTop: '8px',
            padding: '10px 16px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            width: '100%',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
        >
          Verkaufen
        </button>
      </div>
    );
  } else {
    const existingAsset = selectedAsset as ExistingAsset;
    
    return (
      <div className="asset-details-panel" style={panelStyle}>
        <h3 style={headerStyle} data-testid="asset-title">
          {existingAsset.name}
        </h3>
        
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
              className={`status-badge ${statusClass}`}
              style={{ ...valueStyle, color: '#4b5563' }}
              data-testid="asset-status"
            >
              {statusText}
            </span>
          </div>

          <div style={{ ...rowStyle, flexDirection: 'column', gap: '4px', borderBottom: 'none' }}>
            <span style={labelStyle}>Beschreibung:</span>
            <span 
              style={{ 
                ...valueStyle, 
                fontWeight: 400, 
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

        <div
          className="readonly-notice"
          style={{
            marginTop: '8px',
            padding: '10px 12px',
            backgroundColor: '#f3f4f6',
            color: '#4b5563',
            borderRadius: '6px',
            fontSize: '0.8rem',
            textAlign: 'center',
            fontWeight: 500,
            border: '1px solid #e5e7eb',
          }}
        >
          Keine Änderung möglich (Bestandsanlage)
        </div>
      </div>
    );
  }
};
