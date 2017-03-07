
'use strict';

UI.CollisionsPanel = {

    init() {
        this._container = _('.Collisions');
        this._scale     = 3;
        this._tiles     = [];

        for (let tile of Global.collisionTiles) {
            let _div = document.createElement('div');
            _div.appendChild(tile);
            this._container.appendChild(_div);
        }

        this._tiles = this._container.querySelectorAll('div');

        for (var tile of this._tiles) {
            tile.addEventListener('click', e => {
                this.selectTile(e)
                Viewport.updateGhostTile();
            });
        }
    },

    selectTile(e) {
        let clicked = e.target;
        let idx     = UI.getIndex(this._tiles, clicked);

        for (var tile of this._tiles) {
            tile.classList.remove('isActive');
        }

        UI.toPlace              = 'collision';
        UI.selectedCollision    = idx;

        UI.deselectAll();

        clicked.classList.add('isActive');
        Eventer.dispatch('patternSelected');
    },

    deselect() {
        for (var tile of this._tiles) {
            tile.classList.remove('isActive');
        }
    }
}
