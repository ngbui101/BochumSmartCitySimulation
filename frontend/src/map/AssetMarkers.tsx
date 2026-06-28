import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import type { PlayerAsset, ExistingAsset } from '../types/assets';
import {
  SolarIcon,
  WindIcon,
  StorageIcon,
  ExistingIcon,
  ConstructionBadge,
  SelectedRing
} from '../ui/icons';

export interface AssetMarkersProps {
  playerAssets: PlayerAsset[];
  existingAssets: ExistingAsset[];
  selectedAssetId?: string;
  onSelectAsset: (id: string | undefined) => void;
}

// Function to render the React component structure for the asset marker
export const AssetMarkerIcon: React.FC<{
  asset: PlayerAsset | ExistingAsset;
  isSelected: boolean;
}> = ({ asset, isSelected }) => {
  const isPlayer = 'itemType' in asset;
  
  // Base styles for the outer container
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Base styles for the icon wrapper
  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    position: 'relative',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    transition: 'transform 0.15s ease',
  };

  let innerIcon: React.ReactNode;

  if (!isPlayer) {
    // Existing asset: render grey icon
    innerIcon = <ExistingIcon size={18} />;
    wrapperStyle.backgroundColor = '#6b7280'; // Tailwind gray-500
    wrapperStyle.border = '2.5px solid #4b5563'; // Tailwind gray-600
  } else {
    // Player asset
    const playerAsset = asset as PlayerAsset;
    
    if (playerAsset.itemType === 'solar') {
      innerIcon = <SolarIcon size={18} />;
      wrapperStyle.backgroundColor = '#eab308'; // Tailwind yellow-500
      wrapperStyle.border = '2.5px solid #ca8a04'; // Tailwind yellow-600
    } else if (playerAsset.itemType === 'wind') {
      innerIcon = <WindIcon size={18} />;
      wrapperStyle.backgroundColor = '#3b82f6'; // Tailwind blue-500
      wrapperStyle.border = '2.5px solid #2563eb'; // Tailwind blue-600
    } else {
      innerIcon = <StorageIcon size={18} />;
      wrapperStyle.backgroundColor = '#10b981'; // Tailwind emerald-500
      wrapperStyle.border = '2.5px solid #059669'; // Tailwind emerald-600
    }

    if (playerAsset.status === 'under_construction') {
      // Construction stripe pattern style (orange and yellow warning stripes)
      wrapperStyle.background = 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 6px, #fef08a 6px, #fef08a 12px)';
      wrapperStyle.color = '#78350f'; // Dark amber text color for icon visibility
      wrapperStyle.border = '2.5px dashed #d97706'; // Dashed amber border
    }
  }

  // Under construction overlay / badge
  const showConstruction = isPlayer && (asset as PlayerAsset).status === 'under_construction';

  return (
    <div style={containerStyle} className="asset-marker-container">
      {/* Selected ring overlay */}
      {isSelected && (
        <div
          className="selected-ring"
          style={{
            position: 'absolute',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3b82f6',
            pointerEvents: 'none',
          }}
        >
          <SelectedRing size={44} />
        </div>
      )}

      {/* Main icon wrapper */}
      <div style={wrapperStyle} className="asset-icon-wrapper">
        {innerIcon}
        
        {/* Construction overlay */}
        {showConstruction && (
          <div
            className="construction-badge-overlay"
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#d97706',
              color: '#ffffff',
              borderRadius: '50%',
              width: '15px',
              height: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ffffff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            <ConstructionBadge size={10} />
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
    
    // Create Leaflet divIcon using the string representation of our React component
    const htmlContent = renderToString(
      <AssetMarkerIcon asset={asset} isSelected={isSelected} />
    );

    const icon = L.divIcon({
      html: htmlContent,
      className: `custom-asset-marker-${asset.id}`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
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
        }}
      />
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
