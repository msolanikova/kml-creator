const coordinatesRegex = new RegExp('<LineStrings*>.*?<coordinatess*>(.+?)</s*coordinates>.*?</s*LineString>', 'gis');
import { Coordinates } from './Coordinates';

export const getCoordinates = (fileContent: string): Coordinates => {
  const coordinatesList = [];
  let error: string | undefined;
  let found = false;

  let match;
  do {
    match = coordinatesRegex.exec(fileContent);
    if (match) {
      found = true;
      coordinatesList.push(match[1]);
    }
  } while (match);

  if (!found) {
    error = '[kml-processor] No coordinates were found';
  }

  return { coordinatesList: coordinatesList, error: error };
};
