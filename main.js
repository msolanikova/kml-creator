const {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} = require('electron');
var fs = require('fs');
var os = require('os');
const path = require('path');
const kmlCreator = require('./kml-creator.js')

let mainWindow

app.on('ready', () => {
    const htmlPath = path.join('src', 'index.html')
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        show: false
    });
    mainWindow.setMenu(null);
    mainWindow.maximize();
    mainWindow.loadFile(htmlPath);
    mainWindow.show();
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

ipcMain.on('data', (event, data) => {
    kmlCreator.createKMLMapAsync(data, 'Mapa').then(content => {
            var filters = [{
                name: 'KML',
                extensions: ['kml']
            }];
            return new Promise((resolve, reject) => {
                dialog.showSaveDialog(mainWindow, {
                    filters: filters
                }, (filename) => {
                    if (filename) {
                        resolve({
                            filename: filename,
                            content: content
                        });
                    } else {
                        reject('FILE_NOT_SELECTED');
                    }
                });
            });
        })
        .then(kmlMap => {
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
        .then(kmlMap => {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'KML Mapa',
                message: `Uloženie do${os.EOL}${kmlMap.filename}${os.EOL}prebehlo úspešne`
            }, (response) => {
                console.log(response);
                mainWindow.webContents.send('saveSuccess', response);
            });
        })
        .catch(error => {
            if (error != 'FILE_NOT_SELECTED') {
                dialog.showErrorBox('Chyba', `Nepodarilo sa uložiť mapu${os.EOL}${error}`);
            }
        });
});