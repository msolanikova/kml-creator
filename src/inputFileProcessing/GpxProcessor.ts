// eslint-disable-next-line @typescript-eslint/no-var-requires
const gpxParse = require('gpx-parse');
import os from 'os';
import { GpxResult, GpxTrack, GpxTrackpoint } from './GpxTypes';
import { Coordinates } from './Coordinates';

export const getCoordinates = (fileContent: string): Coordinates => {
  let coordinatesList: string[] = [];
  let error: string | undefined;
  try {
    coordinatesList = gpxParse.parseGpx(fileContent, processGpxResult);
  } catch (err) {
    error = '[gpx-processor] ' + err.message;
  }
  return { coordinatesList: coordinatesList, error: error };
};

/**
 * Goes through given GPX structures to get actual coordinates
 *
 * @param error
 * @param gpxResult
 */
const processGpxResult = (error: Error, gpxResult: GpxResult): string[] => {
  if (error) {
    throw error;
  }

  // get to actual coordinates in the GPX structure
  const coordinatesList: string[] = [];
  gpxResult.tracks.forEach((track: GpxTrack) => {
    coordinatesList.push(getTrackCoordinates(track));
  });
  return coordinatesList;
};

const getTrackCoordinates = (track: GpxTrack) => {
  let trackCoordinates: string[] = [];
  track.segments.forEach((segment: GpxTrackpoint[]) => {
    trackCoordinates = trackCoordinates.concat(getSegmentCoordinates(segment));
  });
  return mergeTrackCoordinates(trackCoordinates);
};

const getSegmentCoordinates = (segment: GpxTrackpoint[]) => {
  const segmentCoordinates: string[] = [];
  segment.forEach((trackpoint) => {
    segmentCoordinates.push(`${trackpoint.lon},${trackpoint.lat},${trackpoint.elevation}`);
  });
  return segmentCoordinates;
};

/**
 * Merges coordinates together, separates them by new line.
 * In the final KML file, coordinates are in the same XML tag as single string, separated by new line
 *
 * @param trackCoordinates
 */
const mergeTrackCoordinates = (trackCoordinates: string[]) => {
  return trackCoordinates.join(os.EOL);
};
