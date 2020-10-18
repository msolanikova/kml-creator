const { app, BrowserWindow, ipcMain, dialog } = require('electron');
var fs = require('fs');
var os = require('os');
const path = require('path');
const kmlCreator = require('./kml-creator.js');
const TrailFilesProcessor = require('./TrailFilesProcessor');

let mainWindow;

app.on('ready', () => {
  const htmlPath = path.join('client', 'index.html');
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  //mainWindow.setMenu(null);
  mainWindow.maximize();
  mainWindow.loadFile(htmlPath);
  mainWindow.show();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('createMap', (event, trailsInfo) => {
  // filesInfo is array of objects with properties path, color, layer that user set up

  var errors = [];
  // process all files
  TrailFilesProcessor.processFiles(trailsInfo)
    // then create new KML map
    .then((trailsWithContent) => {
      return new Promise((resolve, reject) => {
        var filteredTrails = filterTrailsWithContent(trailsWithContent);

        errors = filteredTrails.errors;
        if (filteredTrails.correctTrailsWithContent.length == 0) {
          reject(errors);
        } else {
          resolve(kmlCreator.createKMLMap(filteredTrails.correctTrailsWithContent, 'Mapa'));
        }
      });
    })

    // then show save dialog
    .then((content) => {
      var filters = [
        {
          name: 'KML',
          extensions: ['kml'],
        },
      ];
      return new Promise((resolve, reject) => {
        let filePath = dialog.showSaveDialogSync(mainWindow, {
          filters: filters,
        });
        if (filePath) {
          resolve({
            filename: filePath,
            content: content,
          });
        }
      });
    })

    // then save new map
    .then((kmlMap) => {
      return new Promise((resolve, reject) => {
        fs.writeFile(kmlMap.filename, kmlMap.content, 'utf-8', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(kmlMap);
          }
        });
      });
    })

    // then show message box
    .then((kmlMap) => {
      var message;
      if (errors.length == 0) {
        message = `Uloženie do${os.EOL}${kmlMap.filename}${os.EOL}prebehlo úspešne`;
      } else {
        message = `Uloženie do${os.EOL}${kmlMap.filename}${os.EOL}prebehlo úspešne${os.EOL}${os.EOL}Žiaľ, nasledujúce súbory sa nepodarilo spracovať:${os.EOL}`;
        errors.forEach((error) => {
          message += `-> ${error.file} - ${error.error}${os.EOL}`;
        });
      }

      return dialog.showMessageBox(mainWindow, {
        type: errors.length == 0 ? 'info' : 'warning',
        title: 'KML Mapa',
        message: message,
      });
    })
    .then((messageBoxReturnValue) => {
      mainWindow.webContents.send('saveSuccessful', messageBoxReturnValue.response);
    })
    .catch((errors) => {
      console.log(errors);
      errors = Array.isArray(errors) ? errors : [errors];
      var message = `Nie je možné spracovať žiadny z vybraných súborov${os.EOL}${os.EOL}`;
      errors.forEach((error) => {
        message += `-> ${error.file} - ${error.error}${os.EOL}`;
      });
      dialog.showErrorBox('Chyba', message);
    });
});

var filterTrailsWithContent = (trailsWithContent) => {
  var correctTrailsWithContent = [];
  var errors = [];

  trailsWithContent.forEach((trailWithContent) => {
    if (trailWithContent.error === undefined) {
      correctTrailsWithContent.push(trailWithContent);
    } else {
      errors.push({
        error: trailWithContent.error,
        file: trailWithContent.trailInfo.path,
      });
    }
  });

  return {
    correctTrailsWithContent: correctTrailsWithContent,
    errors: errors,
  };
};
