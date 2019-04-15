const coordinatesRegex = new RegExp('<LineString\s*>.*?<coordinates\s*>(.+?)<\/\s*coordinates>.*?</\s*LineString>', 'gis');

module.exports.getCoordinates = (fileContent) => {
    var coordinatesList = [];
    var error;
    var found = false;

    var match;
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

    return {
        coordinatesList: coordinatesList,
        error: error
    }
}