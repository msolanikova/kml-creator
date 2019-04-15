var layers = [];

const {
    ipcRenderer
} = require('electron');

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
    .querySelector('#filePickerForm')
    .addEventListener('submit', (event) => {
        event.preventDefault();
        var filePickerInput = document.getElementById('filePicker');
        const selectedFiles = [...filePickerInput.files]
        if (selectedFiles.length > 0) {
            enableKmlCreate();
        }
        filePickerInput.value = null;
        const filesFormatted = selectedFiles.map(file => file.path);

        var filesTableElement = document.getElementById('filesTable');
        filesFormatted.forEach(file => {
            var row = filesTableElement.insertRow(-1);
            row.insertCell(0).innerHTML = file;
            row.insertCell(1).appendChild(createColorSelect());
            row.insertCell(2).appendChild(createLayersSelect());
        });
    });

document
    .querySelector('#kmlCreatorForm')
    .addEventListener('submit', (event) => {
        event.preventDefault();
        var trailsInfo = [];
        var table = document.getElementById('filesTable');
        for (var i = 1, row; row = table.rows[i]; i++) {
            var colorSelect = row.cells[1].childNodes[0];
            var layerSelect = row.cells[2].childNodes[0];

            var trailInfo = {};
            trailInfo.path = row.cells[0].innerHTML;
            trailInfo.color = colorSelect.options[colorSelect.selectedIndex].value;
            trailInfo.layer = layerSelect.options[layerSelect.selectedIndex].value;

            trailsInfo.push(trailInfo);
        }

        ipcRenderer.send('trailsInfo', trailsInfo);
    });

document
    .querySelector('#kmlClearForm')
    .addEventListener('submit', (event) => {
        event.preventDefault();
        clearUI();
    });

ipcRenderer.on('saveSuccess', (event, response) => {
    clearUI();
})

function createColorSelect() {
    var colorSelect = document.createElement('select');
    var redOption = document.createElement('option');
    redOption.style = "background-color: #ff0000;";
    redOption.innerHTML = "Červená";
    redOption.value = 'red';
    colorSelect.appendChild(redOption);

    var lightRedOption = document.createElement('option');
    lightRedOption.style = "background-color: #ff6666;"
    lightRedOption.innerHTML = "Svetlo-červená";
    lightRedOption.value = 'lightred'
    colorSelect.appendChild(lightRedOption);

    var blueOption = document.createElement('option');
    blueOption.style = "background-color: #0000ff;"
    blueOption.innerHTML = "Modrá";
    blueOption.value = 'blue';
    colorSelect.appendChild(blueOption);

    var lightBlueOption = document.createElement('option');
    lightBlueOption.style = "background-color: #0099ff;"
    lightBlueOption.innerHTML = "Svetlo-modrá";
    lightBlueOption.value = 'lightblue';
    colorSelect.appendChild(lightBlueOption);

    var greenOption = document.createElement('option');
    greenOption.style = "background-color: #00ff00;"
    greenOption.innerHTML = "Zelená";
    greenOption.value = 'green';
    colorSelect.appendChild(greenOption);

    var darkGreenOption = document.createElement('option');
    darkGreenOption.style = "background-color: #00cc00;"
    darkGreenOption.innerHTML = "Tmavo-zelená";
    darkGreenOption.value = 'darkgreen';
    colorSelect.appendChild(darkGreenOption);

    var yellowOption = document.createElement('option');
    yellowOption.style = "background-color: #ffff00;"
    yellowOption.innerHTML = "Žltá";
    yellowOption.value = 'yellow';
    colorSelect.appendChild(yellowOption);

    var orangeOption = document.createElement('option');
    orangeOption.style = "background-color: #ff9900;"
    orangeOption.innerHTML = "Oranžová";
    orangeOption.value = 'orange';
    colorSelect.appendChild(orangeOption);

    return colorSelect;
};

function createLayersSelect() {
    var layerSelect = document.createElement('select');
    layerSelect.className = 'layerSelect';
    layers.forEach(layer => {
        var layerOption = document.createElement('option');
        layerOption.innerHTML = layer;
        layerSelect.appendChild(layerOption);
    });

    return layerSelect;
}

function enableFilePicker() {
    document.getElementById('filePicker').disabled = false;
    document.getElementById('filePickerSubmit').disabled = false;
}

function enableKmlCreate() {
    document.getElementById('kmlCreateButton').disabled = false;
}

function clearUI() {
    document.getElementById('filePicker').disabled = true;
    document.getElementById('filePickerSubmit').disabled = true;
    document.getElementById('kmlCreateButton').disabled = true;

    clearLayers();
    clearTable();
}

function refreshAllLayersSelects() {
    var layerSelects = document.getElementsByClassName("layerSelect");
    for (var i = 0; i < layerSelects.length; i++) {
        var select = layerSelects[i];
        var selectedLayer = select.options[select.selectedIndex].value;

        var newSelect = document.createElement('select');
        newSelect.className = 'layerSelect';
        layers.forEach(layer => {
            var layerOption = document.createElement('option');
            layerOption.innerHTML = layer;
            if (layer == selectedLayer) {
                layerOption.selected = true;
            }
            newSelect.appendChild(layerOption);
        });
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