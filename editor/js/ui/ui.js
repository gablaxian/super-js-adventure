
'use strict';

// use this as a global repo for UI values.
let UI = {
    init(config) {
        config          = config            || {};
        config.maps     = config.maps       || [];
        config.layers   = config.layers     || [];
        config.tilesets = config.tilesets   || [];

        this.exploded   = false;
        this.deleteMode = false;

        UI.MapsPanel.init(config.maps);
        UI.LayersPanel.init(config.layers);
        UI.TilesetsPanel.init(config.tilesets);
        UI.PatternsPanel.init(config.patterns);
        UI.CollisionsPanel.init();
        UI.EntitiesPanel.init(config.entities);

        // not sure where to put this yet
        _('.tabs').addEventListener('click', e => {
            let target  = e.target;
            let _tabs   = __('.tabs [data-tab]');

            for(var tab of _tabs) {
                tab.classList.remove('active');
            }

            target.classList.add('active');

            if( target.getAttribute('data-tab') != null ) {
                let tab = target.getAttribute('data-tab');

                // hide all tab content
                for (var tabContainer of __('.tab-container [data-tab]')) {
                    tabContainer.style['display'] = 'none';
                }

                // show desired content
                _('.tab-container [data-tab="'+tab+'"]').style['display'] = 'block';

                // hide all panel markers
                this.deselect.call(UI.TilesetsPanel);
                this.deselect.call(UI.PatternsPanel);
            }
        });

        _('.delete').addEventListener('click', () => {
            if( this.deleteMode ) {
                _('.delete').classList.remove('isActive');
                this.deleteMode = false;
            }
            else {
                _('.delete').classList.add('isActive');
                this.deleteMode = true;
            }
        } );

        _('.export-world').addEventListener('click', () => Eventer.dispatch('export') );

        _('.explode-button').addEventListener('click', () => {
            if( !this.exploded ) {
                let zIndex = 0;

                for(var layer of __('.Viewport canvas')) {
                    layer.style.transform = `translateZ(${zIndex += 40}px)`;
                }

                _('.Screen').style.overflow = 'visible';
                _('main').classList.add('explode');

                this.exploded = true;
            }
            else {
                for(var layer of __('.Viewport canvas')) {
                    layer.style.transform = 'translateZ(0px)';
                }

                _('main').classList.remove('explode');

                setTimeout( () => {_('.Screen').style.overflow = 'scroll'}, 1000);

                this.exploded = false;
            }
        } );

        _('.ZoomPanel-slider').addEventListener('change', e => {
            _('.ZoomPanel-factor').innerHTML = _('.ZoomPanel-slider').value;
            Viewport.scale( _('.ZoomPanel-slider').value );
        });

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
    },

    deselect() {
        this._marker.style.display  = 'none';
    }
};
