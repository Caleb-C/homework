class UIManager {
    constructor(doc) {
        this.common = new CommonUI(doc);
        this.ageField = this.common.findElement("input[name=age]");
        this.relField = this.common.findElement("select[name=rel]");
        this.smokerField = this.common.findElement("input[name=smoker]");
        this.addButton = this.common.findElement("button.add");
        this.submitButton = this.common.findElement('button[type=submit]');
        this.form = this.common.findElement('form');
        this.submitValueField = this.common.findElement('pre.debug');
        this.householdList = this.common.findElement('ol.household');
        this.resAge = this.common.newElement('span', ' ' + this.common.getLabelText(this.ageField) + ': ')
        this.resRelationship = this.common.newElement('span', ', ' + this.common.getLabelText(this.relField) + ': ')
        this.resSmoker = this.common.newElement('span', ', ' + this.common.getLabelText(this.smokerField) + ': ')
        this.resSmokerYes = this.common.newElement('span');
        this.resSmokerNo = this.common.newElement('span');
        this.errorField = this.common.newElement('div');
        this.hhData = new HHData(this);
        
        if (!this.ageField) {
            this.handleError('Could not identify age field', false);
        }
        if (!this.relField) {
            this.handleError('Could not identify relationship field', false);
        }
        if (!this.addButton) {
            this.handleError('Could not identify add button', false);
        }
        if (!this.submitButton) {
            this.handleError('Could not identify submit button', false);
        }
        if (!this.form) {
            this.handleError('Could not identify form', false);
        }
        if (!this.householdList) {
            this.handleError('Could not identify household list', false);
        }
        if (!this.submitValueField) {
            this.handleError('Could not identify submit value field', false);
        }
        
        this.resAge.style.fontWeight = 'bold';
        this.resRelationship.style.fontWeight = 'bold';
        this.resSmoker.style.fontWeight = 'bold';
        this.resSmokerYes.innerHTML = '&#10004;';
        this.resSmokerYes.style.color = 'green';
        this.resSmokerNo.innerHTML = '&#10007;';
        this.resSmokerNo.style.color = 'red';
        this.errorField.style.color = 'red';
        this.errorField.style.fontWeight = 'bold';
        this.common.doc.body.insertBefore(this.errorField, this.submitValueField);
    }
    
    initFields() {
        let that = this;
        
        this.addButton.addEventListener('click', function(e) { that.addHH(e); });
        this.submitButton.addEventListener('click', function(e) { that.submitHHList(e); });
        this.form.addEventListener('submit', function(e) {
            e.preventDefault();
            that.handleError('Form submission not cancelled.', false);
        });
    }
    
    handleError(message, showUser) {
        if(showUser) {
            this.errorField.innerHTML = '';
            this.errorField.appendChild(document.createTextNode(message));
        } else {
            console.log(message);
        }
    }
    
    clearErrors() {
        this.errorField.innerHTML = '';
    }
    
 // Button handlers
    addHH(e) {
        // prevent the default behavior of the button (not really needed, but just in case)
        e.preventDefault();

        let hhRow = HHData.createRow(this.common.getFieldValue(this.ageField),
            this.common.getFieldValue(this.relField), this.common.getFieldValue(this.smokerField));

        if (this.hhData.addRow(hhRow)) {
            this.updateDisplay();
        }
    }

    removeHH(index) {
        if(this.hhData.removeRow(index)) {
            this.updateDisplay();
        }
    }

    submitHHList(e) {
        // prevent the default behavior of the button (needed to prevent submission
        // of the form)
        e.preventDefault();

        this.clearErrors();
        this.submitValueField.innerHTML = '';
        this.submitValueField.appendChild(this.common.newElement('text', JSON.stringify(this.hhData.data,
                null, 2)));
        this.submitValueField.style.display = 'block';
    }
    
    clearSubmitField() {
        this.submitValueField.style.display = 'none';
        this.submitValueField.innerHTML = '';
    }

    //Support methods
    updateDisplay() {
        let hhData = this.hhData.data;

        // clear display
        this.householdList.innerHTML = '';

        if (hhData.hhRows !== null && hhData.hhRows.length > 0) {
            for (var i = 0; i < hhData.hhRows.length; i++) {
                this.householdList.appendChild(this.createHHListItem(hhData.hhRows[i], i));
            }
        }

        this.ageField.value = '';
        this.relField.selectedIndex = 0;
        this.smokerField.checked = false;

        this.clearSubmitField();
        this.clearErrors();
    }

    createHHListItem(hhRow, index) {
        // Normally, I would want this to be better organized into divs or a table, etc. and look better!
        let listItem = this.common.newElement('li');
        let delButton = this.common.newElement('button', 'Remove');
        let that = this;
        
        delButton.addEventListener('click', function(e) { that.removeHH(index); return false; });
        
        listItem.appendChild(delButton);
        listItem.appendChild(this.resAge.cloneNode(true));
        listItem.appendChild(this.common.newElement('text', hhRow.age));
        listItem.appendChild(this.resRelationship.cloneNode(true));
        listItem.appendChild(this.common.newElement('text', hhRow.relationship));
        listItem.appendChild(this.resSmoker.cloneNode(true));
        listItem.appendChild(hhRow.smoker ? this.resSmokerYes.cloneNode(true) : this.resSmokerNo.cloneNode(true));

        return listItem;
    }
}

//Persist the data in a field to keep the data with the DOM (alternatives include JavaScript or cookie)
class HHData {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.dataField = this.uiManager.common.newElement('input');
        this.dataField.type = 'hidden';
        this.dataField.value = JSON.stringify({hhRows:[]});
        this.uiManager.common.doc.body.appendChild(this.dataField);
    }
    
    get data() {
        return JSON.parse(this.dataField.value);
    }
    
    set data(value) {
        if(typeof value === 'string' || value instanceof String) {
            this.dataField.value = value;
        } else {
            this.dataField.value = JSON.stringify(value);
        }
    }
    
    addRow(hhRow) {
        if (hhRow === null) {
            this.uiManager.handleError('Invalid household row', false);
            return false;
        }
        
        if(this.isValid(hhRow)) {
            let hhData = this.data;
            
            hhData.hhRows.push(hhRow);
            this.data = hhData;
            
            return true;
        }
        
        return false;
    }
    
    removeRow(index) {
        let hhData = this.data;

        if (index < 0 || index > (hhData.hhRows.length - 1)) {
            this.uiManager.handleError('Invalid index: ' + index, false);
            return false;
        }

        hhData.hhRows.splice(index, 1);
        
        this.data = hhData;
        
        return true;
    }
    
    static createRow(ageValue, relationshipValue, smokerValue) {
        return {
                age : ageValue,
                relationship : relationshipValue,
                smoker : smokerValue
            };
    }
    
    isValid(hhRow) {
        let valErrors = [];

        if (hhRow === null) {
            this.uiManager.handleError('Invalid household row', false);
            return false;
        }

        if (hhRow.age === null || !CommonUI.isInt(hhRow.age) || hhRow.age <= 0) {
            valErrors.push(this.prepareValError(this.uiManager.ageField,
                    'is required and must be a positive integer'));
        }
        if (hhRow.relationship === null || hhRow.relationship === '') {
            valErrors.push(this.prepareValError(this.uiManager.relField, 'is required'));
        }

        if (valErrors.length > 0) {
            this.uiManager.handleError('Unable to add household information: '
                    + valErrors.join(', '), true);
            return false;
        }

        return true;
    }
    
    prepareValError(field, message) {
        return this.uiManager.common.getLabelText(field) + ' ' + message;
    }
}

// Common routines (should be in a library somewhere)
class CommonUI {
    constructor(doc) {
        this.doc = doc;
    }
    
    findElement(query) {
        return this.doc.querySelector(query);
    }
    
    newElement(tag, text) {
        if(tag === 'text') {
            return this.doc.createTextNode(text)
        } else {
            let field = this.doc.createElement(tag);
            
            if(text && text !== '') {
                field.appendChild(this.doc.createTextNode(text));
            }
            
            return field;
        }
    }
    
    getFieldValue(field) {
        switch(field.tagName.toLowerCase()) {
        case 'input':
            if(field.type === 'checkbox') {
                return field.checked;
            } else {
                return field.value;
            }
        case 'select':
            return field.options[field.selectedIndex].value;
        }
    }

    getLabelText(field) {
        return field === null ? 'UNKNOWN' : field.labels[0].textContent.split('\n')[0];
    }
    
    static isInt(value) {
        return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
    }
}

window.addEventListener('DOMContentLoaded', function(e) {
    let uiManager = new UIManager(window.document);
    
    uiManager.initFields();
}, false);