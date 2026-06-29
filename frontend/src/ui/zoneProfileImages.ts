import type { ZoneId } from '../types/zones';

export const zoneProfileImages: Record<ZoneId, string | null> = {
  innenstadt: '/photos/Innenstadt.png',
  wattenscheid: '/photos/Wattenscheid.png',
  querenburg: '/photos/Querenburg.png',
  langendreer: '/photos/Langendreer.png',
  gerthe_harpen: '/photos/Gerthe-Harpen.png',
  weitmar_linden: '/photos/Weitmar.png',
  stiepel: null
};

const zoneProfileImageAltTexts: Record<ZoneId, string> = {
  innenstadt: 'Profilbild Innenstadt',
  wattenscheid: 'Profilbild Wattenscheid',
  querenburg: 'Profilbild Querenburg',
  langendreer: 'Profilbild Langendreer',
  gerthe_harpen: 'Profilbild Gerthe / Harpen',
  weitmar_linden: 'Profilbild Weitmar',
  stiepel: 'Profilbild Stiepel'
};

export function getZoneProfileImage(zoneId: ZoneId): string | null {
  return zoneProfileImages[zoneId] ?? null;
}

export function getZoneProfileImageAlt(zoneId: ZoneId): string {
  return zoneProfileImageAltTexts[zoneId];
}
