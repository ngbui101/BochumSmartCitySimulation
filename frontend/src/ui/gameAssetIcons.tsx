import React from 'react';
import type { AssetStatus, ItemType } from '../types/assets';

type AssetIconVariant = 'default' | 'build' | 'selected';

type AssetIconConfig = {
  label: string;
  alt: Record<AssetIconVariant, string>;
  src: Record<AssetIconVariant, string>;
};

export const assetIconConfig: Record<ItemType, AssetIconConfig> = {
  solar: {
    label: 'Solaranlage',
    alt: {
      default: 'Solaranlage',
      build: 'Solaranlage im Bau',
      selected: 'Ausgewählte Solaranlage'
    },
    src: {
      default: '/icons/Solaranlage.png',
      build: '/icons/Solaranlage_build.png',
      selected: '/icons/Solaranlage_selected.png'
    }
  },
  wind: {
    label: 'Kleinwindanlage',
    alt: {
      default: 'Kleinwindanlage',
      build: 'Kleinwindanlage im Bau',
      selected: 'Ausgewählte Kleinwindanlage'
    },
    src: {
      default: '/icons/Windkraftanlage.png',
      build: '/icons/Windkraftanlage_build.png',
      selected: '/icons/Windkraftanlage_selected.png'
    }
  },
  storage: {
    label: 'Energiespeicher',
    alt: {
      default: 'Energiespeicher',
      build: 'Energiespeicher im Bau',
      selected: 'Ausgewählter Energiespeicher'
    },
    src: {
      default: '/icons/Energiespeicher.png',
      build: '/icons/Energiespeicher_build.png',
      selected: '/icons/Energiespeicher_selected.png'
    }
  }
};

export function getAssetIconVariant(
  status: AssetStatus = 'active',
  isSelected = false
): AssetIconVariant {
  if (status === 'under_construction') {
    return 'build';
  }

  return isSelected ? 'selected' : 'default';
}

export function getAssetIconSrc(
  itemType: ItemType,
  status: AssetStatus = 'active',
  isSelected = false
): string {
  return assetIconConfig[itemType].src[getAssetIconVariant(status, isSelected)];
}

export function getAssetIconAlt(
  itemType: ItemType,
  status: AssetStatus = 'active',
  isSelected = false
): string {
  return assetIconConfig[itemType].alt[getAssetIconVariant(status, isSelected)];
}

export function getAssetIconLabel(itemType: ItemType): string {
  return assetIconConfig[itemType].label;
}

export interface AssetIconImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'src'> {
  itemType: ItemType;
  status?: AssetStatus;
  isSelected?: boolean;
  size?: number;
}

export const AssetIconImage: React.FC<AssetIconImageProps> = ({
  itemType,
  status = 'active',
  isSelected = false,
  size = 56,
  style,
  ...imageProps
}) => (
  <img
    src={getAssetIconSrc(itemType, status, isSelected)}
    alt={getAssetIconAlt(itemType, status, isSelected)}
    draggable={false}
    style={{
      display: 'block',
      width: `${size}px`,
      height: `${size}px`,
      objectFit: 'contain',
      ...style
    }}
    {...imageProps}
  />
);
