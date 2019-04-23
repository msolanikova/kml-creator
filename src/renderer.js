var layers = [];

/**
 *  COMMUNICATION FROM BACKEND TO FRONTEND 
 */
const {
    ipcRenderer
} = require('electron');

// after save is successful, clear form
ipcRenderer.on('saveSuccess', (event, response) => {
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


/* HELPER FUNCTIONS */

function createColorSelect() {
    var colorSelect = document.createElement('select');
    colorSelect.classList.add('colorSelect', 'form-control', 'text-dark', 'bg-red');
    colorSelect.addEventListener("change", () => changeSelectBgColor(colorSelect));

    var redOption = document.createElement('option');
    redOption.classList.add("bg-red", "form-control");
    redOption.innerHTML = "Červená";
    redOption.value = 'red';
    colorSelect.appendChild(redOption);

    var lightRedOption = document.createElement('option');
    lightRedOption.classList.add("bg-lightred", "form-control");
    lightRedOption.innerHTML = "Svetlo-červená";
    lightRedOption.value = 'lightred'
    colorSelect.appendChild(lightRedOption);

    var blueOption = document.createElement('option');
    blueOption.classList.add("bg-blue", "form-control");
    blueOption.innerHTML = "Modrá";
    blueOption.value = 'blue';
    colorSelect.appendChild(blueOption);

    var lightBlueOption = document.createElement('option');
    lightBlueOption.classList.add("bg-lightblue", "form-control");
    lightBlueOption.innerHTML = "Svetlo-modrá";
    lightBlueOption.value = 'lightblue';
    colorSelect.appendChild(lightBlueOption);

    var greenOption = document.createElement('option');
    greenOption.classList.add("bg-green", "form-control");
    greenOption.innerHTML = "Zelená";
    greenOption.value = 'green';
    colorSelect.appendChild(greenOption);

    var darkGreenOption = document.createElement('option');
    darkGreenOption.classList.add("bg-darkgreen", "form-control");
    darkGreenOption.innerHTML = "Tmavo-zelená";
    darkGreenOption.value = 'darkgreen';
    colorSelect.appendChild(darkGreenOption);

    var yellowOption = document.createElement('option');
    yellowOption.classList.add("bg-yellow", "form-control");
    yellowOption.innerHTML = "Žltá";
    yellowOption.value = 'yellow';
    colorSelect.appendChild(yellowOption);

    var orangeOption = document.createElement('option');
    orangeOption.classList.add("bg-orange", "form-control");
    orangeOption.innerHTML = "Oranžová";
    orangeOption.value = 'orange';
    colorSelect.appendChild(orangeOption);

    return colorSelect;
};

function changeSelectBgColor(select) {
    var selectedOption = select.options[select.selectedIndex];
    var classesCount = select.classList.length;
    // remove last class
    select.classList.remove(select.classList.item(classesCount - 1));
    // add based on selected value
    select.classList.add(selectedOption.classList.item(0));
}

function createLayersSelect(selectedLayer) {
    var layerSelect = document.createElement('select');
    layerSelect.classList.add('layerSelect');
    layerSelect.classList.add('form-control');
    layerSelect.classList.add('text-dark');

    layers.forEach(layer => {
        var layerOption = document.createElement('option');
        layerOption.innerHTML = layer;
        if (layer == selectedLayer) {
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

        var newSelect = createLayersSelect(selectedLayer);

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