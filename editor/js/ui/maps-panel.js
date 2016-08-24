
'use strict';

UI.MapsPanel = {
    init(maps) {
        this._panel     = _('.MapsPanel');
        this._container = this._panel.querySelector('.MapsPanel-container');
        this._select    = document.createElement('select');

        // Open any previously opened map
        UI.selectedMap = localStorage.getItem('selectedMap') || 0;

        let count = 0;

        // add all the options
        for(var map of maps) {
            let option  = document.createElement('option');
            let text    = document.createTextNode(map.name);

            option.appendChild(text);
            option.setAttribute('value', map.name);
            if( count == UI.selectedMap ) {
                option.setAttribute('selected', 'selected');
            }

            this._select.appendChild(option);

            count++;
        }

        // add the select to the panel
        this._container.appendChild(this._select);

        // listen to the change event
        this._select.addEventListener('change', e => { this.selectMap(e) });
    },

    /*
        Takes the event object from the change listener, determines which option was selected, finds its index within the select,
        sets the index globally and dispatches an event to say a change occurred for a different part of the app to pick up.
    */
    selectMap(e) {
        let selected    = e.target;
        let options     = this._select.querySelectorAll('option');
        let idx         = 0;

        for (var option of options) {
            if( option.value == e.target.value ) {
                break;
            }
            idx++;
        }

        UI.selectedMap = idx;
        Eventer.dispatch('selectMap', idx);
    }
}
