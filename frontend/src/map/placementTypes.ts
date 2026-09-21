import type { ZoneId } from '../types/zones';

export type ZoneFeedback = {
  zoneId: ZoneId;
  status: 'allowed' | 'blocked';
  message: string;
};

export type PlacementFeedback = {
  status: 'allowed' | 'blocked';
  message: string;
};
