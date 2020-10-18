import util from 'util';
import os from 'os';
import { GpxResult, GpxTrack, GpxTrackpoint } from './GpxTypes';
// @ts-ignore
import gpxParse from 'gpx-parse';

export const getCoordinates = (fileContent: string): Promise<string[]> => {
  const parseGpx = util.promisify(gpxParse.parseGpx);

  return parseGpx(fileContent)
    .then((gpxResult: GpxResult) => {
      return processGpxResult(gpxResult);
    })
    .catch((err: Error) => {
      throw new Error('[gpx-processor] ' + err.message);
    });
};

/**
 * Goes through given GPX structures to get actual coordinates
 *
 * @param error
 * @param gpxResult
 */
const processGpxResult = (gpxResult: GpxResult): string[] => {
  const coordinatesList: string[] = [];
  gpxResult.tracks.forEach((track: GpxTrack) => {
    coordinatesList.push(getTrackCoordinates(track));
  });
  return coordinatesList;
};

const getTrackCoordinates = (track: GpxTrack): string => {
  let trackCoordinates: string[] = [];
  track.segments.forEach((segment: GpxTrackpoint[]) => {
    trackCoordinates = trackCoordinates.concat(getSegmentCoordinates(segment));
  });
  return mergeTrackCoordinates(trackCoordinates);
};

const getSegmentCoordinates = (segment: GpxTrackpoint[]): string[] => {
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
const mergeTrackCoordinates = (trackCoordinates: string[]): string => {
  return trackCoordinates.join(os.EOL);
};
