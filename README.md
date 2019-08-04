# KML Creator
Desktop application that can merge multiple KML and GPX files into single KML file. Usually used to import such KML file to google maps. 
![Alt text](img/screenshot.png?raw=true "Kml Creator Application")

## User Manual
1. enter at least one layer that will be used in the target KML file
2. choose KML and GPX files to be merged (multiple can be selected at once)
3. choose color and layer for each of the selected files
4. hit 'Vytvor mapu' (create map) button to merge all added files into single KML file
5. Hit 'Zmaž dáta / Začni znovu' button in order to clear the form

Notes:
* file names without extensions will be used for line name in the target KML file
* GPX: track coordinates will be merges into single line in the target KMK file
* GPX: multiple tracks will be added as multiple lines in the target KML file with same name
* map name will always be 'Mapa'

## Build Installer
```
npm run dist
```

Installer will be located in dist directory