// your code goes here ...
//Setup
var ageField = document.querySelector("input[name=age]");
var relField = document.querySelector("select[name=rel]");
var smokerField = document.querySelector("input[name=smoker]");
var addButton = document.querySelector('button.add');
var submitButton = document.querySelector('button[type=submit]');
var form = document.querySelector('form');
var submitValueField = document.querySelector('pre.debug');
var householdList = document.querySelector('ol.household');
var resAge = document.createElement('span')
var resRelationship = document.createElement('span')
var resSmoker = document.createElement('span')
var resSmokerYes = document.createElement('span');
var resSmokerNo = document.createElement('span');
var errorField = document.createElement('div');
var dataField = document.createElement('input');

if (!ageField) {
    handleError('Could not identify age field', false);
}
if (!relField) {
    handleError('Could not identify relationship field', false);
}
if (!addButton) {
    handleError('Could not identify add button', false);
}
if (!submitButton) {
    handleError('Could not identify submit button', false);
}
if (!form) {
    handleError('Could not identify form', false);
}
if (!householdList) {
    handleError('Could not identify household list', false);
}
if (!submitValueField) {
    handleError('Could not identify submit value field', false);
}

addButton.addEventListener('click', addHH);
submitButton.addEventListener('click', submitHHList);
form.addEventListener('submit', function(e) {
    e.preventDefault();
    handleError('Form submission not cancelled.', false);
});
resAge.appendChild(document.createTextNode(' ' + getLabelText(ageField) + ': '));
resAge.style.fontWeight = 'bold';
resRelationship.appendChild(document.createTextNode(', ' + getLabelText(relField) + ': '));
resRelationship.style.fontWeight = 'bold';
resSmoker.appendChild(document.createTextNode(', ' + getLabelText(smokerField) + ': '));
resSmoker.style.fontWeight = 'bold';
resSmokerYes.innerHTML = '&#10004;';
resSmokerYes.style.color = 'green';
resSmokerNo.innerHTML = '&#10007;';
resSmokerNo.style.color = 'red';
errorField.style.color = 'red';
errorField.style.fontWeight = 'bold';
dataField.type = 'hidden';
dataField.value = JSON.stringify({hhRows:[]});
document.body.insertBefore(errorField, submitValueField);
document.body.appendChild(dataField);

// Button handlers
function addHH(e) {
    // prevent the default behavior of the button (not really needed, but just
    // in case)
    e.preventDefault();

    var hhRow = {
        age : ageField.value,
        relationship : relField.options[relField.selectedIndex].value,
        smoker : smokerField.checked
    };

    if (isInputValid(hhRow)) {
        addHHRow(hhRow);
        updateDisplay();
    }
}

function removeHH(index) {
    removeHHRow(index);

    updateDisplay();
}

function submitHHList(e) {
    // prevent the default behavior of the button (needed to prevent submission
    // of the form)
    e.preventDefault();

    var hhData = getHHData();
    
    errorField.innerHTML = '';
    submitValueField.innerHTML = '';
    submitValueField.appendChild(document.createTextNode(JSON.stringify(hhData,
            null, 2)));
    submitValueField.style.display = 'block';
}

function clearSubmitField() {
    submitValueField.innerHTML = '';
    submitValueField.style.display = 'none';
}

// Support functions
function getHHData() {
    return JSON.parse(dataField.value);
}

function setHHData(hhData) {
    dataField.value = JSON.stringify(hhData);
}

function updateDisplay() {
    var hhData = getHHData();

    // clear display
    householdList.innerHTML = '';

    if (hhData.hhRows != null && hhData.hhRows.length > 0) {
        for (var i = 0; i < hhData.hhRows.length; i++) {
            householdList.appendChild(createHHListItem(hhData.hhRows[i], i));
        }
    }

    ageField.value = '';
    relField.selectedIndex = 0;
    smokerField.checked = false;

    clearSubmitField();
    errorField.innerHTML = '';
}

function createHHListItem(hhRow, index) {
    // Normally, I would want this to be better organized into divs or a table,
    // etc. and look better!
    var listItem = document.createElement('li');
    var delButton = document.createElement('button');
    var delButtonText = document.createTextNode("Remove");

    delButton.appendChild(delButtonText);
    delButton.addEventListener('click', function(e) {
        removeHH(index);
    });
    listItem.appendChild(delButton);
    listItem.appendChild(document.createTextNode(' '));
    listItem.appendChild(resAge.cloneNode(true));
    listItem.appendChild(document.createTextNode(hhRow.age));
    listItem.appendChild(resRelationship.cloneNode(true));
    listItem.appendChild(document.createTextNode(hhRow.relationship));
    listItem.appendChild(resSmoker.cloneNode(true));
    listItem.appendChild(hhRow.smoker ? resSmokerYes.cloneNode(true) : resSmokerNo.cloneNode(true));

    return listItem;
}

function isInputValid(hhRow) {
    var valErrors = [];

    if (hhRow == null) {
        handleError('Invalid household row', false);
        return false;
    }

    if (hhRow.age == null || !isInt(hhRow.age) || hhRow.age <= 0) {
        valErrors.push(prepareValError(ageField,
                'is required and must be a positive integer'));
    }
    if (hhRow.relationship == null || hhRow.relationship == '') {
        valErrors.push(prepareValError(relField, 'is required'));
    }

    if (valErrors != '') {
        handleError('Unable to add household information: '
                + valErrors.join(', '), true);
        return false;
    }

    return true;
}

function addHHRow(hhRow) {
    if (hhRow == null) {
        handleError('Invalid household row', false);
        return false;
    }

    var hhData = getHHData();
    
    hhData.hhRows.push(hhRow);
    
    setHHData(hhData);
}

function removeHHRow(index) {
    var hhData = getHHData();

    if (index < 0 || index > (hhData.hhRows.length - 1)) {
        handleError('Invalid index: ' + index, false);
        return false;
    }

    hhData.hhRows.splice(index, 1);
    
    setHHData(hhData);
}

// Common routines (should be in a library somewhere)
function prepareValError(field, message) {
    return getLabelText(field) + ' ' + message;
}

function getLabelText(field) {
    return field == null ? 'UNKNOWN' : field.labels[0].textContent.split('\n')[0];
}

function handleError(message, showUser) {
    errorField.appendChild(document.createTextNode(message));
}

function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}
