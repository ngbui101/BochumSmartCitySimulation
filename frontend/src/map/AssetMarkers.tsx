import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import type { PlayerAsset, ExistingAsset, PrivateAsset } from '../types/assets';
import { AssetDetailsPanel } from '../sidebar/AssetDetailsPanel';
import { AssetIconImage } from '../ui/gameAssetIcons';
import {
  ExistingIcon,
  ConstructionBadge,
  SelectedRing
} from '../ui/icons';

export interface AssetMarkersProps {
  playerAssets: PlayerAsset[];
  existingAssets: ExistingAsset[];
  privateAssets?: PrivateAsset[];
  selectedAssetId?: string;
  onSelectAsset: (id: string | undefined) => void;
  onSell?: (id: string) => void;
}

// Function to render the React component structure for the asset marker
export const AssetMarkerIcon: React.FC<{
  asset: PlayerAsset | ExistingAsset | PrivateAsset;
  isSelected: boolean;
}> = ({ asset, isSelected }) => {
  const isPrivate = 'ownership' in asset;
  const isPlayer = 'purchasePrice' in asset;
  const playerAsset = isPlayer ? (asset as PlayerAsset) : null;
  const privateAsset = isPrivate ? (asset as PrivateAsset) : null;
  const iconAsset = playerAsset ?? privateAsset;
  const markerSize = isPlayer ? (isSelected ? 58 : 48) : isPrivate ? (isSelected ? 52 : 44) : 34;
  const iconSize = isPlayer ? (isSelected ? 52 : 42) : isPrivate ? (isSelected ? 46 : 38) : 30;
  const itemClass = playerAsset
    ? `asset-marker--${playerAsset.itemType}`
    : privateAsset
      ? `asset-marker--private-${privateAsset.itemType}`
      : 'asset-marker--existing';
  const statusClass =
    playerAsset?.status === 'under_construction' ? 'asset-marker--construction' : '';
  const selectedClass = isSelected ? 'asset-marker--selected' : '';

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: `${markerSize}px`,
    height: `${markerSize}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${iconSize}px`,
    height: `${iconSize}px`,
    borderRadius: isPlayer || isPrivate ? '16px' : '50%',
    position: 'relative',
    color: '#ffffff',
    backgroundColor: isPlayer ? 'rgba(255, 253, 246, 0.95)' : isPrivate ? '#F2D6A7' : '#60736A',
    border: isPlayer ? '1px solid rgba(16, 35, 27, 0.12)' : isPrivate ? '2px solid #C69253' : '2.5px solid #60736A',
    boxShadow: isSelected
      ? '0 10px 24px rgba(31, 79, 58, 0.26)'
      : '0 8px 18px rgba(16, 35, 27, 0.18)',
    transition: 'transform 0.15s ease',
  };

  if (playerAsset?.status === 'under_construction') {
    wrapperStyle.backgroundColor = 'rgba(255, 251, 235, 0.95)';
    wrapperStyle.border = '1.5px solid #f59e0b';
  }

  const showConstruction = playerAsset?.status === 'under_construction';

  return (
    <div
      style={containerStyle}
      className={`asset-marker-container ${itemClass} ${statusClass} ${selectedClass}`}
    >
      {isSelected && (
        <div
          className="selected-ring"
          style={{
            position: 'absolute',
            width: `${markerSize + 8}px`,
            height: `${markerSize + 8}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3b82f6',
            pointerEvents: 'none',
          }}
        >
          <SelectedRing size={markerSize + 8} />
        </div>
      )}

      <div style={wrapperStyle} className="asset-icon-wrapper">
        {iconAsset ? (
          <AssetIconImage
            itemType={iconAsset.itemType}
            status={playerAsset?.status ?? 'active'}
            isSelected={isSelected}
            size={iconSize}
          />
        ) : (
          <ExistingIcon size={18} />
        )}

        {showConstruction && (
          <div
            className="construction-badge-overlay"
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: '#d97706',
              color: '#ffffff',
              borderRadius: '50%',
              width: '17px',
              height: '17px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ffffff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            <ConstructionBadge size={11} />
          </div>
        )}
      </div>
    </div>
  );
};

export const AssetMarkers: React.FC<AssetMarkersProps> = ({
  playerAssets,
  existingAssets,
  privateAssets = [],
  selectedAssetId,
  onSelectAsset,
  onSell,
}) => {
  // Styles for selection ring pulse
  const styleBlock = (
    <style>{`
      @keyframes selected-pulse {
        0% { transform: rotate(0deg) scale(0.95); opacity: 0.8; }
        50% { transform: rotate(180deg) scale(1.05); opacity: 1; }
        100% { transform: rotate(360deg) scale(0.95); opacity: 0.8; }
      }
      .selected-ring svg {
        animation: selected-pulse 2s linear infinite;
      }
    `}</style>
  );

  const renderMarker = (asset: PlayerAsset | ExistingAsset | PrivateAsset) => {
    const isSelected = asset.id === selectedAssetId;
    const markerSize = 'purchasePrice' in asset
      ? (isSelected ? 58 : 48)
      : 'ownership' in asset
        ? (isSelected ? 52 : 44)
        : 34;
    const markerAnchor = markerSize / 2;
    
    // Create Leaflet divIcon using the string representation of our React component
    const htmlContent = renderToString(
      <AssetMarkerIcon asset={asset} isSelected={isSelected} />
    );

    const icon = L.divIcon({
      html: htmlContent,
      className: `custom-asset-marker-${asset.id}`,
      iconSize: [markerSize, markerSize],
      iconAnchor: [markerAnchor, markerAnchor],
    });

    return (
      <Marker
        key={asset.id}
        position={[asset.position.lat, asset.position.lng]}
        icon={icon}
        eventHandlers={{
          click: (e) => {
            // Stop leaflet from propagating the click to map container
            e.originalEvent?.stopPropagation();
            onSelectAsset(asset.id);
          },
          popupclose: () => {
            onSelectAsset(undefined);
          }
        }}
      >
        <Popup>
          <div className="popup-asset-details" style={{ minWidth: '240px', maxWidth: '300px' }} data-testid="popup-asset-details">
            <AssetDetailsPanel selectedAsset={asset} onSell={onSell} />
          </div>
        </Popup>
      </Marker>
    );
  };

  return (
    <>
      {styleBlock}
      {existingAssets.map(renderMarker)}
      {privateAssets.map(renderMarker)}
      {playerAssets.map(renderMarker)}
    </>
  );
};
