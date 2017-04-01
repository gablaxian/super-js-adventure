
'use strict';

// use this as a global repo for UI values.
let UI = {

    init(config) {
        config          = config            || {};
        config.maps     = config.maps       || [];
        config.layers   = config.layers     || [];
        config.tilesets = config.tilesets   || [];

        // states
        this.exploded   = false;
        this.deleteMode = false;
        this.fillMode   = false;

        // init
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
            }
        });

        _('.fill').addEventListener('click', e => {
            if( this.fillMode ) {
                _('.fill').classList.remove('isActive');
                this.fillMode = false;
                Eventer.dispatch('fillMode', false);
            }
            else {
                _('.fill').classList.add('isActive');
                this.fillMode = true;
                Eventer.dispatch('fillMode', true);
            }
        });

        _('.delete').addEventListener('click', e => {
            if( this.deleteMode ) {
                _('.delete').classList.remove('isActive');
                this.deleteMode = false;
                Eventer.dispatch('deleteMode', false);
            }
            else {
                _('.delete').classList.add('isActive');
                this.deleteMode = true;
                Viewport.ghostTile.style.display = 'none';
                Eventer.dispatch('deleteMode', true);

                // hide all the markers
                UI.deselectAll();
            }
        } );

        _('.export-world').addEventListener('click', e => Eventer.dispatch('export') );

        Eventer.on('patternSelected', () => {
            this.deleteMode = false;
            _('.delete').classList.remove('isActive');
        });

        // _('.explode-button').addEventListener('click', () => {
        //     if( !this.exploded ) {
        //         let zIndex = 0;
        //
        //         for(var layer of __('.Viewport canvas')) {
        //             layer.style.transform = `translateZ(${zIndex += 40}px)`;
        //         }
        //
        //         _('.Screen').style.overflow = 'visible';
        //         _('main').classList.add('explode');
        //
        //         this.exploded = true;
        //     }
        //     else {
        //         for(var layer of __('.Viewport canvas')) {
        //             layer.style.transform = 'translateZ(0px)';
        //         }
        //
        //         _('main').classList.remove('explode');
        //
        //         setTimeout( () => {_('.Screen').style.overflow = 'scroll'}, 1000);
        //
        //         this.exploded = false;
        //     }
        // } );

        _('.ZoomPanel-slider').addEventListener('change', e => {
            let val = _('.ZoomPanel-slider').value;
            _('.ZoomPanel-factor').innerHTML = (25 * Math.pow(2, (val - 1))) + '%';

            Global.scale = _('.ZoomPanel-slider').value;
            Viewport.scale( _('.ZoomPanel-slider').value );
        });

        return Promise.resolve();
    },

    // Helper function
    getIndex(list, item) {
        let count = 0;
        for(var l of list) {
            if( l == item ) {
                break;
            }
            count++;
        }
        return count == list.length ? -1 : count; // if the count is the same as the length of the list, no item was found. Return -1.
    },

    deselectAll() {
        UI.CollisionsPanel.deselect();
        UI.PatternsPanel.deselect();
        UI.TilesetsPanel.deselect();
        UI.EntitiesPanel.deselect();
    }
};
