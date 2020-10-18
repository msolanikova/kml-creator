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
  var resultPromise;
  switch (fileExtension) {
    case '.gpx':
      resultPromise = gpxProcessor.getCoordinates(trailWithContent.fileContent);
      break;
    case '.kml':
      resultPromise = kmlProcessor.getCoordinates(trailWithContent.fileContent);
      break;
    default:
      error = '[trail-files-processor] Unsupported file extension';
  }
  if (error != null && error != undefined) {
    trailWithContent.error = error;
    return trailWithContent;
  }

  return resultPromise
    .then((coordinatesList) => {
      trailWithContent.coordinatesList = coordinatesList;
      return trailWithContent;
    })
    .catch((err) => {
      trailWithContent.error = err.message;
      return trailWithContent;
    });
};
