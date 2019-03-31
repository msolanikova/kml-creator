const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const os = require('os');

const coordinatesRegex = new RegExp('<LineString\s*>.*?<coordinates\s*>(.+?)<\/\s*coordinates>.*?</\s*LineString>', 'gis');

var placemarkTmpl = fs.readFileSync(path.join(__dirname, 'tmpl/placemark.tmpl'), 'utf8');
var folderTmpl = fs.readFileSync(path.join(__dirname, 'tmpl/folder.tmpl'), 'utf8');
var mapTmpl = fs.readFileSync(path.join(__dirname, 'tmpl/map.tmpl'), 'utf8');

module.exports.createKMLMap = (trailData, mapName) => {
    var trailsByLayer = getTrailDataMap(trailData);

    var folders = [];
    for (var layer in trailsByLayer) {
        // create all placemarks for layer
        var placemarks = [];
        var layerTrails = trailsByLayer[layer];
        layerTrails.forEach(trail => {
            // load file, get all trails coordinates and create placemark for each
            var fileContent = fs.readFileSync(trail.path);
            var coords = getCoordinates(fileContent);
            coords.forEach(coord => {
                placemarks.push(createPlacemark(trail, coord));
            });
        });

        //create folder for layer
        folders.push(createFolder(layer, placemarks.join(os.EOL)));
    }

    var mapResult = createMap(mapName, folders.join(os.EOL));
    //console.log(mapResult);
    return mapResult;
}

module.exports.createKMLMapAsync = (trailData, mapName) => {
    var promises = [];
    trailData.forEach(trail => {
        promises.push(
            new Promise((resolve, reject) => {
                fs.readFile(trail.path, (err, fileContent) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            fileContent: fileContent,
                            trail: trail
                        });
                    }
                });
            }).then(trailWithContent => {
                var placemarks = [];
                var coords = getCoordinates(trailWithContent.fileContent);
                coords.forEach(coord => {
                    placemarks.push(createPlacemark(trailWithContent.trail, coord));
                });
                return {
                    placemarks: placemarks,
                    layer: trailWithContent.trail.layer
                };
            }));
    });

    return Promise.all(promises).then(trailPlacemarksWithLayer => {
        var placemarksMap = getPlacemarksMapByLayer(trailPlacemarksWithLayer);

        var folders = [];
        for (layer in placemarksMap) {
            var placemarks = placemarksMap[layer];
            folders.push(createFolder(layer, placemarks.join(os.EOL)));
        }
        return createMap(mapName, folders.join(os.EOL));
    });
}

var getTrailDataMap = (trailData) => {
    var trailsByLayer = {}
    for (var i = 0; i < trailData.length; i++) {
        var layer = trailData[i].layer;
        if (!(layer in trailsByLayer)) {
            trailsByLayer[layer] = [];
        }
        trailsByLayer[layer].push(trailData[i]);
    }

    return trailsByLayer;
}

var getPlacemarksMapByLayer = (trailPlacemarksWithLayer) => {
    var placemarksMap = {};
    for (var i = 0; i < trailPlacemarksWithLayer.length; i++) {
        var layer = trailPlacemarksWithLayer[i].layer;
        if (!(layer in placemarksMap)) {
            placemarksMap[layer] = [];
        }
        placemarksMap[layer] = placemarksMap[layer].concat(trailPlacemarksWithLayer[i].placemarks);
    }

    return placemarksMap;
}

var createPlacemark = (trail, coordinates) => {
    var placemarkTemplate = handlebars.compile(placemarkTmpl);
    var result = placemarkTemplate({
        line_name: path.basename(trail.path, path.extname(trail.path)),
        line_color: trail.color,
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

var getCoordinates = (fileContent) => {
    var coordinates = [];

    var match;
    do {
        match = coordinatesRegex.exec(fileContent);
        if (match) {
            coordinates.push(match[1]);
        }
    } while (match);
    return coordinates;
}