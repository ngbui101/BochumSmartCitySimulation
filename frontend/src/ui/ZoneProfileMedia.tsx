import React from 'react';
import type { ZoneId } from '../types/zones';
import { getZoneProfileImage, getZoneProfileImageAlt } from './zoneProfileImages';

type ZoneProfileMediaVariant = 'image' | 'thumb';

interface ZoneProfileMediaProps {
  zoneId: ZoneId;
  label: string;
  variant?: ZoneProfileMediaVariant;
  className?: string;
}

export const ZoneProfileMedia: React.FC<ZoneProfileMediaProps> = ({
  zoneId,
  label,
  variant = 'image',
  className
}) => {
  const imageSrc = getZoneProfileImage(zoneId);
  const classes = [
    variant === 'thumb' ? 'zone-profile-thumb' : 'zone-profile-image',
    className
  ]
    .filter(Boolean)
    .join(' ');

  if (imageSrc) {
    return (
      <img
        className={classes}
        src={imageSrc}
        alt={getZoneProfileImageAlt(zoneId)}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`zone-photo-fallback ${classes}`}
      data-testid="zone-photo-fallback"
      aria-label={label}
      role="img"
    >
      <span>{label}</span>
    </div>
  );
};
