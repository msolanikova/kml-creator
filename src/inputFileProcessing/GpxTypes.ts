export interface GpxResult {
  tracks: GpxTrack[];
}

export interface GpxTrack {
  segments: GpxTrackpoint[][];
}

export interface GpxTrackpoint {
  lat: string;
  lon: string;
  elevation: string;
}
