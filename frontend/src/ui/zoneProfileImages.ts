import type { ZoneId } from '../types/zones';

export const zoneProfileImages: Record<ZoneId, string | null> = {
  mitte: '/photos/Innenstadt.png',
  wattenscheid: '/photos/Wattenscheid.png',
  nord: '/photos/Gerthe-Harpen.png',
  ost: '/photos/Langendreer.png',
  sued: '/photos/Querenburg.png',
  suedwest: '/photos/Weitmar.png'
};

const zoneProfileImageAltTexts: Record<ZoneId, string> = {
  mitte: 'Profilbild Mitte',
  wattenscheid: 'Profilbild Wattenscheid',
  nord: 'Profilbild Nord',
  ost: 'Profilbild Ost',
  sued: 'Profilbild Süd',
  suedwest: 'Profilbild Südwest'
};

export function getZoneProfileImage(zoneId: ZoneId): string | null {
  return zoneProfileImages[zoneId] ?? null;
}

export function getZoneProfileImageAlt(zoneId: ZoneId): string {
  return zoneProfileImageAltTexts[zoneId];
}
