var gpxParse = require("gpx-parse");
const os = require('os');

module.exports.getCoordinates = (fileContent) => {
    var coordinatesList = [];
    var error;
    try {

        gpxParse.parseGpx(fileContent, function (error, data) {

            data.tracks.forEach(track => {
                coordinatesList.push(getTrackCoordinates(track));
            });
        });
    } catch (err) {
        error = '[gpx-processor] ' + err;
    }
    return {
        coordinatesList: coordinatesList,
        error: error
    };
}

var mergeTrackCoordinates = (trackCoordinates) => {
    return trackCoordinates.join(os.EOL);
}

var getTrackCoordinates = (track) => {
    var trackCoordinates = [];
    track.segments.forEach(segment => {
        trackCoordinates = trackCoordinates.concat(getSegmentCoordinates(segment));
    });
    return mergeTrackCoordinates(trackCoordinates);
}

var getSegmentCoordinates = (segment) => {
    var segmentCoordinates = [];
    segment.forEach(trackpoint => {
        segmentCoordinates.push(`${trackpoint.lon},${trackpoint.lat},${trackpoint.elevation}`);
    });
    return segmentCoordinates;
}