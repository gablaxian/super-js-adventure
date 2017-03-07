
'use strict';

UI.LayersPanel = {
    
    init(layers) {
        this._panel     = _('.LayersPanel');
        this._container = this._panel.querySelector('.LayersPanel-layers');
        this._listItems = [];

        for(var layer of layers) {
            let li      = document.createElement('li');
            let label   = document.createElement('label');
            let input   = document.createElement('input');
            let text    = document.createTextNode(layer.name);

            input.setAttribute('type', 'checkbox');

            if( layer.name != 'collision' ) {
                input.setAttribute('checked', 'checked');
            }

            label.appendChild(text);
            li.appendChild(input);
            li.appendChild(label);

            this._listItems.push(li);
            this._container.appendChild(li);
        }

        // select the default layer
        UI.selectedLayer = 0;
        this._listItems[0].classList.add('isSelected');
        this._container.addEventListener('click', e => { this.selectLayer(e) });
    },

    selectLayer(e) {
        // There is some REALLY damned ugly stuff going on here. We really didn't event delegation. Maybe revisit.
        let clicked         = e.target;
        let inputClicked    = false;
        let inputChecked    = false;
        let idx             = 0;

        if( clicked.nodeName == 'INPUT' ) {
            inputClicked = true;
            inputChecked = clicked.checked;
        }

        while( clicked.nodeName != 'LI' && clicked != e.currentTarget ) {
            clicked = e.target.parentNode;
        }

        if( clicked.nodeName != 'LI' ) {
            return;
        }

        // reset the selected layers visual indicator and find the index of the selected layer
        for (let i = 0; i < this._listItems.length; i++) {
            if( !inputClicked ) {
                this._listItems[i].classList.remove('isSelected');
            }

            if( clicked == this._listItems[i] ) {
                idx = i;
            }
        }

        if( inputClicked ) {
            Eventer.dispatch('toggleLayer', idx, inputChecked);
            return;
        }

        UI.selectedLayer = idx;
        clicked.classList.add('isSelected');

        Eventer.dispatch('selectLayer');
    }
}
