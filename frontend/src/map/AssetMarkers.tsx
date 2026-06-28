import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import type { PlayerAsset, ExistingAsset } from '../types/assets';
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
  selectedAssetId?: string;
  onSelectAsset: (id: string | undefined) => void;
  onSell?: (id: string) => void;
}

// Function to render the React component structure for the asset marker
export const AssetMarkerIcon: React.FC<{
  asset: PlayerAsset | ExistingAsset;
  isSelected: boolean;
}> = ({ asset, isSelected }) => {
  const isPlayer = 'itemType' in asset;
  const playerAsset = isPlayer ? (asset as PlayerAsset) : null;
  const markerSize = isPlayer ? (isSelected ? 64 : 56) : 36;
  const iconSize = isPlayer ? (isSelected ? 60 : 52) : 32;

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
    borderRadius: isPlayer ? '14px' : '50%',
    position: 'relative',
    color: '#ffffff',
    backgroundColor: isPlayer ? 'rgba(255, 255, 255, 0.88)' : '#6b7280',
    border: isPlayer ? '1px solid rgba(23, 33, 27, 0.12)' : '2.5px solid #4b5563',
    boxShadow: isSelected
      ? '0 6px 18px rgba(61, 111, 90, 0.34)'
      : '0 4px 10px rgba(0,0,0,0.18)',
    transition: 'transform 0.15s ease',
  };

  if (playerAsset?.status === 'under_construction') {
    wrapperStyle.backgroundColor = 'rgba(255, 251, 235, 0.95)';
    wrapperStyle.border = '1.5px solid #f59e0b';
  }

  const showConstruction = playerAsset?.status === 'under_construction';

  return (
    <div style={containerStyle} className="asset-marker-container">
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
        {playerAsset ? (
          <AssetIconImage
            itemType={playerAsset.itemType}
            status={playerAsset.status}
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

  const renderMarker = (asset: PlayerAsset | ExistingAsset) => {
    const isSelected = asset.id === selectedAssetId;
    const markerSize = 'itemType' in asset ? (isSelected ? 64 : 56) : 36;
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
      {playerAssets.map(renderMarker)}
    </>
  );
};
