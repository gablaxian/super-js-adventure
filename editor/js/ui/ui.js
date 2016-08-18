
'use strict';

// use this as a global repo for UI values.
let UI = {
    init(config) {
        config          = config            || {};
        config.maps     = config.maps       || [];
        config.layers   = config.layers     || [];
        config.tilesets = config.tilesets   || [];

        UI.MapsPanel.init(config.maps);
        UI.LayersPanel.init(config.layers);
        UI.TilesetsPanel.init(config.tilesets);
        UI.PatternsPanel.init(config.patterns);
        UI.CollisionsPanel.init();
        UI.EntitiesPanel.init(config.entities);

        // not sure where to put this yet
        _('.tabs').addEventListener('click', function(e) {
            let target  = e.target;
            let _tabs   = __('.tabs [data-tab]');

            for (var tab of _tabs) {
                tab.classList.remove('active');
            };

            target.classList.add('active');

            if( target.getAttribute('data-tab') != null ) {
                let tab = target.getAttribute('data-tab');

                // hide all tab content
                for (var tabContainer of __('.tab-container [data-tab]')) {
                    tabContainer.style['display'] = 'none';
                }

                // show desired content
                _('.tab-container [data-tab="'+tab+'"]').style['display'] = 'block';
            }
        });

        _('.export-world').addEventListener('click', () => Eventer.dispatch('export') );

        return Promise.resolve();
    },

    // Helper function
    getIndex(list, item) {
        let count = 0;
        for (var l of list) {
            if( l == item ) {
                break;
            }
            count++;
        }
        return count;
    }
};

UI.Modal = {
    _overlay       : _('.Overlay'),
    _modal         : _('.Modal'),
    _modalContent  : _('.Modal-content'),
    _close         : _('.Modal-close'),

    show(content) {
        this._overlay.style.display     = 'block';
        this._modal.style.display       = 'block';
        this._modalContent.innerHTML    = '<pre><code>' + content + '</code></pre>';

        this._close.addEventListener('click', () => this.hide());
    },

    hide() {
        this._overlay.style.display     = 'none';
        this._modal.style.display       = 'none';
    }
}
