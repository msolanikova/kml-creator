import path from 'path';
import fs from 'fs';
import { getCoordinates as getKmlCoordinates } from './inputFileProcessing/KmlProcessor';
import { getCoordinates as getGpxCoordinates } from './inputFileProcessing/GpxProcessor';
import { TrailFileMeta } from './model/TrailFileMeta';
import { Trail } from './model/Trail';

export const processFiles = (trailsInfo: TrailFileMeta[]) => {
  // filesInfo is array of objects with properties path, color, layer that user set up
  const promises: Promise<Trail>[] = [];

  trailsInfo.forEach((trailInfo) => {
    promises.push(
      new Promise<Trail>((resolve, reject) => {
        fs.readFile(trailInfo.path, (err, fileContent) => {
          if (err) {
            resolve(new Trail(trailInfo, '', err.message));
          } else {
            resolve(new Trail(trailInfo, fileContent.toString()));
          }
        });
      }).then((trailWithContent) => {
        return processFile(trailWithContent);
      })
    );
  });

  return Promise.all(promises);
};

const processFile = (trailWithContent: Trail): Promise<Trail> => {
  if (trailWithContent.error) {
    return Promise.resolve(trailWithContent);
  }

  const fileExtension = path.extname(trailWithContent.meta.path);
  let resultPromise: Promise<string[]>;
  switch (fileExtension) {
    case '.gpx':
      resultPromise = getGpxCoordinates(trailWithContent.content);
      break;
    case '.kml':
      resultPromise = getKmlCoordinates(trailWithContent.content);
      break;
    default:
      trailWithContent.error = '[trail-files-processor] Unsupported file extension';
      return Promise.resolve(trailWithContent);
  }

  return resultPromise
    .then((coordinatesList) => {
      trailWithContent.coordinates = coordinatesList;
      return trailWithContent;
    })
    .catch((err) => {
      trailWithContent.error = err.message;
      return trailWithContent;
    });
};
