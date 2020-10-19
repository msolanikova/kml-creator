const coordinatesRegex = new RegExp('<LineStrings*>.*?<coordinatess*>(.+?)</s*coordinates>.*?</s*LineString>', 'gis');

export const getCoordinates = (fileContent: string): Promise<string[]> => {
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
    return Promise.reject(new Error('[kml-processor] No coordinates were found'));
  }

  return Promise.resolve(coordinatesList);
};
