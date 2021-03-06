window.$ = window.jQuery = require('jquery');
window.Bootstrap = require('bootstrap');

var layers = [];

/**
 *  COMMUNICATION FROM BACKEND TO FRONTEND 
 */
const {
    ipcRenderer
} = require('electron');

// after save is successful, clear form
ipcRenderer.on('saveSuccessful', (event, response) => {
    clearUI();
})

/**
 * FRONTEND COMMUNICATION
 */

/* ACTIONS (buttons) */
document
    .querySelector('#layerCreateForm')
    .addEventListener('submit', (event) => {
        event.preventDefault();
        var layerInput = document.getElementById('layerName');
        var layerListElement = document.getElementById('layersList');
        var layerName = layerInput.value;
        if (layerName != '' && !layers.includes(layerName)) {
            layers.push(layerName);
            layerInput.value = "";
            layerListElement.innerHTML += layerName + ', ';

            enableFilePicker();
            refreshAllLayersSelects();
        }
    });

document
    .querySelector('#filePickerButton')
    .addEventListener('change', (event) => {
        var filePickerInput = document.getElementById('filePicker');
        const selectedFiles = [...filePickerInput.files]
        if (selectedFiles.length > 0) {
            enableKmlCreate();
        }
        filePickerInput.value = null;
        const filesFormatted = selectedFiles.map(file => file.path);

        var filesTableBodyElement = document.getElementById('filesTable').tBodies[0];
        filesFormatted.forEach(file => {
            var row = filesTableBodyElement.insertRow(-1);
            row.insertCell(0).innerHTML = file;
            row.insertCell(1).appendChild(createColorSelect(file));
            row.insertCell(2).appendChild(createLayersSelect(null, file));
        });
    });

document
    .querySelector('#kmlCreatorForm')
    .addEventListener('submit', (event) => {
        event.preventDefault();
        var trailsInfo = [];
        var table = document.getElementById('filesTable');
        for (var i = 1, row; row = table.rows[i]; i++) {
            var pickerWrapper = row.cells[1].childNodes[0];
            var colorPickerButton = pickerWrapper.childNodes[0];
            var layerSelect = row.cells[2].childNodes[0];

            var buttonBackgroundColorClass = colorPickerButton.classList.item(colorPickerButton.classList.length - 1);
            var color = buttonBackgroundColorClass.replace('bg-', '');

            var trailInfo = {};
            trailInfo.path = decodeHTMLEntities(row.cells[0].innerHTML);
            trailInfo.color = color;
            trailInfo.layer = layerSelect.options[layerSelect.selectedIndex].value;

            trailsInfo.push(trailInfo);
        }

        ipcRenderer.send('createMap', trailsInfo);
    });

document
    .querySelector('#kmlClearForm')
    .addEventListener('submit', (event) => {
        event.preventDefault();
        clearUI();
    });

/* HELPER FUNCTIONS */

function createColorSelect(fileName) {
    var pickerWrapper = document.createElement('div');
    pickerWrapper.classList.add('picker-wrapper');

    var colorPickerButton = document.createElement('button');
    let defaultColor = getDefaultColorForFileName(fileName);
    colorPickerButton.classList.add('btn', 'bg-' + defaultColor);
    colorPickerButton.innerHTML = 'Vyber farbu';
    var colorPicker = document.createElement('div');
    colorPicker.classList.add('color-picker');
    var pk = new Piklor(colorPicker, [
        "#ff0000", "#ff6666", "#0000ff", "#0099ff", "#00ff00", "#00cc00", "#ffff00", "#ff9900"
    ], {
        open: colorPickerButton,
        openEvent: 'click'
    });

    // update button color when color selected
    pk.colorChosen(color => {
        // remove last class
        var classCount = colorPickerButton.classList.length;
        colorPickerButton.classList.remove(colorPickerButton.classList.item(classCount - 1));
        var newClass;
        switch (color) {
            case '#ff0000':
                newClass = 'bg-red';
                break;
            case '#ff6666':
                newClass = 'bg-lightred';
                break;
            case '#0000ff':
                newClass = 'bg-blue';
                break;
            case '#0099ff':
                newClass = 'bg-lightblue';
                break;
            case '#00ff00':
                newClass = 'bg-green';
                break;
            case '#00cc00':
                newClass = 'bg-darkgreen';
                break;
            case '#ffff00':
                newClass = 'bg-yellow';
                break;
            case '#ff9900':
                newClass = 'bg-orange';
                break;
            default:
                newClass = 'btn-secondary';
        }
        colorPickerButton.classList.add(newClass);
    });

    pickerWrapper.appendChild(colorPickerButton);
    pickerWrapper.appendChild(colorPicker);
    return pickerWrapper;
};

function createLayersSelect(selectedLayer, fileName) {
    var layerSelect = document.createElement('select');
    layerSelect.classList.add('layerSelect');
    layerSelect.classList.add('form-control');
    layerSelect.classList.add('text-dark');
    let defaultLayer = getDefaultLayerForFileName(fileName);

    layers.forEach((layer) => {
        let layerOption = document.createElement('option');
        layerOption.innerHTML = layer;
        if (selectedLayer != null && selectedLayer != undefined) {
            if (layer == selectedLayer) {
                layerOption.selected = true;
            }
        } else if (layer == defaultLayer) {
            // if no layer is selected and given layer is identified as default one
            layerOption.selected = true;
        }
        layerSelect.appendChild(layerOption);
    });

    return layerSelect;
}

function enableFilePicker() {
    document.getElementById('filePicker').disabled = false;
    document.getElementById('filePickerButton').classList.remove('disabled');
}

function enableKmlCreate() {
    document.getElementById('kmlCreateButton').disabled = false;
}

function clearUI() {
    document.getElementById('filePicker').disabled = true;
    document.getElementById('filePickerButton').classList.add('disabled');
    document.getElementById('kmlCreateButton').disabled = true;

    clearLayers();
    clearTable();
}

function refreshAllLayersSelects() {
    var layerSelects = document.getElementsByClassName("layerSelect");
    for (var i = 0; i < layerSelects.length; i++) {
        var select = layerSelects[i];
        var selectedLayer = select.options[select.selectedIndex].value;

        var newSelect = createLayersSelect(selectedLayer, null);

        select.parentNode.replaceChild(newSelect, select);
    }
}

function clearLayers() {
    layers = [];
    document.getElementById('layersList').innerHTML = '';
}

function clearTable() {
    var table = document.getElementById('filesTable');
    var rowCount = table.rows.length;
    for (var i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
    }
}

function decodeHTMLEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp": " ",
        "amp": "&",
        "quot": "\"",
        "lt": "<",
        "gt": ">"
    };
    return encodedString.replace(translate_re, function (match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function (match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}

/**
 * @param fileName
 * @returns {*} layer based on file name. If file name contains any layer name in itself, given layer is returned. Otherwise first layer is returned
 */
function getDefaultLayerForFileName(fileName) {
    if (fileName == null || fileName == undefined) {
        return layers[0];
    }

    for (let layer of layers) {
        if (fileName.toLowerCase().includes(layer.toLowerCase())) {
            return layer;
        }
    }

    return layers[0];
}

/**
 *
 * @param fileName
 * @returns {string|string} Returns default color. If fileName contains 'tl' string,
 */
function getDefaultColorForFileName(fileName) {
    let trailLayerShortcuts = [' tl', '-tl', '_tl'];

    if (fileName == null || fileName == undefined) {
        return 'blue';
    }

    for (let shortcut of trailLayerShortcuts) {
        if (fileName.toLowerCase().includes(shortcut)) {
            return 'blue';
        }
    }

    return 'red';
}