import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';
import os from 'os';
import { Trail } from './model/Trail';

const placemarkTmpl = fs.readFileSync(path.join(__dirname, 'tmpl/placemark.tmpl'), 'utf8');
const folderTmpl = fs.readFileSync(path.join(__dirname, 'tmpl/folder.tmpl'), 'utf8');
const mapTmpl = fs.readFileSync(path.join(__dirname, 'tmpl/map.tmpl'), 'utf8');

export const createKMLMap = (trailsWithContent: Trail[], mapName: string): string => {
  trailsWithContent.forEach((trailWithContent) => {
    const placemarks: string[] = [];
    trailWithContent.coordinates.forEach((coordinates) => {
      placemarks.push(createPlacemark(trailWithContent.meta.path, trailWithContent.meta.color, coordinates));
    });
    trailWithContent.placemarks = placemarks;
  });

  const placemarksMap = getPlacemarksMapByLayer(trailsWithContent);

  const folders = [];
  for (const layer in placemarksMap) {
    const placemarks = placemarksMap[layer];
    folders.push(createFolder(layer, placemarks.join(os.EOL)));
  }
  return createMap(mapName, folders.join(os.EOL));
};

const getPlacemarksMapByLayer = (trailsInfoWithPlacemarks: Trail[]): Record<string, string[]> => {
  const placemarksMap: Record<string, string[]> = {};
  for (let i = 0; i < trailsInfoWithPlacemarks.length; i++) {
    const layer = trailsInfoWithPlacemarks[i].meta.layer;
    if (!(layer in placemarksMap)) {
      placemarksMap[layer] = [];
    }
    placemarksMap[layer] = placemarksMap[layer].concat(trailsInfoWithPlacemarks[i].placemarks);
  }

  return placemarksMap;
};

const createPlacemark = (filePath: string, color: string, coordinates: string): string => {
  const placemarkTemplate = handlebars.compile(placemarkTmpl);
  const result = placemarkTemplate({
    line_name: path.basename(filePath, path.extname(filePath)),
    line_color: color,
    coordinates: coordinates,
  });
  return result;
};

const createFolder = (layerName: string, placemarks: string) => {
  const folderTemplate = handlebars.compile(folderTmpl);
  const result = folderTemplate({
    layer_name: layerName,
    placemarks: placemarks,
  });

  return result;
};

const createMap = (mapName: string, folders: string): string => {
  const mapTemplate = handlebars.compile(mapTmpl);
  const result = mapTemplate({
    map_name: mapName,
    folders: folders,
  });
  return result;
};
