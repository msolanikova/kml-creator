var path = require('path');
const fs = require('fs');
const kmlProcessor = require('./inputFileProcessing/KmlProcessor');
const gpxProcessor = require('./inputFileProcessing/GpxProcessor');

module.exports.processFiles = (trailsInfo) => {
  // filesInfo is array of objects with properties path, color, layer that user set up
  var promises = [];

  trailsInfo.forEach((trailInfo) => {
    promises.push(
      new Promise((resolve, reject) => {
        fs.readFile(trailInfo.path, (err, fileContent) => {
          if (err) {
            reject([
              {
                error: err,
                file: trailInfo.path,
              },
            ]);
          } else {
            resolve({
              fileContent: fileContent,
              trailInfo: trailInfo,
            });
          }
        });
      }).then((trailWithContent) => {
        return processFile(trailWithContent);
      })
    );
  });

  return Promise.all(promises);
};

var processFile = (trailWithContent) => {
  var error;
  var fileExtension = path.extname(trailWithContent.trailInfo.path);
  var result;
  switch (fileExtension) {
    case '.gpx':
      result = gpxProcessor.getCoordinates(trailWithContent.fileContent);
      break;
    case '.kml':
      result = kmlProcessor.getCoordinates(trailWithContent.fileContent);
      break;
    default:
      error = '[trail-files-processor] Unsupported file extension';
  }
  trailWithContent.coordinatesList = result === undefined ? undefined : result.coordinatesList;
  trailWithContent.error = result === undefined ? error : result.error;
  return trailWithContent;
};
