const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const os = require('os');

var placemarkTmpl = fs.readFileSync(path.join(__dirname, 'tmpl/placemark.tmpl'), 'utf8');
var folderTmpl = fs.readFileSync(path.join(__dirname, 'tmpl/folder.tmpl'), 'utf8');
var mapTmpl = fs.readFileSync(path.join(__dirname, 'tmpl/map.tmpl'), 'utf8');

module.exports.createKMLMap = (trailsWithContent, mapName) => {
    trailsWithContent.forEach(trailWithContent => {
        var placemarks = [];
        trailWithContent.coordinatesList.forEach(coordinates => {
            placemarks.push(createPlacemark(trailWithContent.trailInfo.path, trailWithContent.trailInfo.color, coordinates));
        });
        trailWithContent.placemarks = placemarks;
    });

    var placemarksMap = getPlacemarksMapByLayer(trailsWithContent);

    var folders = [];
    for (layer in placemarksMap) {
        var placemarks = placemarksMap[layer];
        folders.push(createFolder(layer, placemarks.join(os.EOL)));
    }
    return createMap(mapName, folders.join(os.EOL));
}

var getPlacemarksMapByLayer = (trailsInfoWithPlacemarks) => {
    var placemarksMap = {};
    for (var i = 0; i < trailsInfoWithPlacemarks.length; i++) {
        var layer = trailsInfoWithPlacemarks[i].trailInfo.layer;
        if (!(layer in placemarksMap)) {
            placemarksMap[layer] = [];
        }
        placemarksMap[layer] = placemarksMap[layer].concat(trailsInfoWithPlacemarks[i].placemarks);
    }

    return placemarksMap;
}

var createPlacemark = (filePath, color, coordinates) => {
    var placemarkTemplate = handlebars.compile(placemarkTmpl);
    var result = placemarkTemplate({
        line_name: path.basename(filePath, path.extname(filePath)),
        line_color: color,
        coordinates: coordinates
    });
    return result;
}

var createFolder = (layerName, placemarks) => {
    var folderTemplate = handlebars.compile(folderTmpl);
    var result = folderTemplate({
        layer_name: layerName,
        placemarks: placemarks
    });

    return result;
}

var createMap = (mapName, folders) => {
    var mapTemplate = handlebars.compile(mapTmpl);
    var result = mapTemplate({
        map_name: mapName,
        folders: folders
    });
    return result;
}