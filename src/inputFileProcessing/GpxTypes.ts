// eslint-disable-next-line @typescript-eslint/no-var-requires
const Result = require('gpx-parse/gpxResult'),
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Track = require('gpx-parse/gpxTrack');

export type GpxResult = typeof Result;
export type GpxTrack = typeof Track;

export interface GpxTrackpoint {
  lat: string;
  lon: string;
  elevation: string;
}
