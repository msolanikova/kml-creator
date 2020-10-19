import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';

import { createKMLMap } from './MapCreator';
import { processFiles } from './TrailFilesProcessor';
import { TrailFileMeta } from './model/TrailFileMeta';
import { Trail } from './model/Trail';
import { ResultMap } from './model/ResultMap';

let mainWindow: BrowserWindow;

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
  mainWindow.setMenu(null);
  mainWindow.maximize();
  mainWindow.loadFile(htmlPath);
  mainWindow.show();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('createMap', (event, trailsInfo: TrailFileMeta[]) => {
  let errorTrails: Trail[] = [];

  processFiles(trailsInfo)
    .then((trailsWithContent: Trail[]) => {
      return new Promise<string>((resolve, reject) => {
        errorTrails = getErrorTrails(trailsWithContent);
        const correctTrails = trailsWithContent.filter((trail) => !errorTrails.includes(trail));

        if (correctTrails.length == 0) {
          return reject(new Error(getErrorMessageForWrongTrails(errorTrails)));
        } else {
          return resolve(createKMLMap(correctTrails, 'Mapa'));
        }
      });
    })

    // then show save dialog
    .then((content) => {
      const filters = [
        {
          name: 'KML',
          extensions: ['kml'],
        },
      ];
      return new Promise<ResultMap>((resolve, reject) => {
        const filePath = dialog.showSaveDialogSync(mainWindow, {
          filters: filters,
        });
        if (filePath) {
          resolve(new ResultMap(filePath, content));
        }
      });
    })

    // then save new map
    .then((kmlMap) => {
      return new Promise<ResultMap>((resolve, reject) => {
        fs.writeFile(kmlMap.path, kmlMap.content, 'utf-8', (err) => {
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
      let message: string;
      if (errorTrails.length == 0) {
        message = `Uloženie do${os.EOL}${kmlMap.path}${os.EOL}prebehlo úspešne`;
      } else {
        message = `Uloženie do${os.EOL}${kmlMap.path}${os.EOL}prebehlo úspešne${os.EOL}${os.EOL}Žiaľ, nasledujúce súbory sa nepodarilo spracovať:${os.EOL}`;
        errorTrails.forEach((error) => {
          message += `-> ${error.meta.path} - ${error.error}${os.EOL}`;
        });
      }

      return dialog.showMessageBox(mainWindow, {
        type: errorTrails.length == 0 ? 'info' : 'warning',
        title: 'KML Mapa',
        message: message,
      });
    })
    .then((messageBoxReturnValue) => {
      return mainWindow.webContents.send('saveSuccessful', messageBoxReturnValue.response);
    })
    .catch((error: Error) => {
      console.log(error);
      dialog.showErrorBox('Chyba', error.message);
    });
});

const getErrorTrails = (trailsWithContent: Trail[]): Trail[] => {
  const wrongTrails: Trail[] = [];
  trailsWithContent.forEach((trailWithContent) => {
    if (trailWithContent.error) {
      wrongTrails.push(trailWithContent);
    }
  });

  return wrongTrails;
};

const getErrorMessageForWrongTrails = (errorTrails: Trail[]): string => {
  let message = `Nie je možné spracovať žiadny z vybraných súborov${os.EOL}${os.EOL}`;
  errorTrails.forEach((trail) => {
    message += `-> ${trail.meta.path} - ${trail.error}${os.EOL}`;
  });
  return message;
};
