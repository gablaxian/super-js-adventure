
'use strict';

UI.CollisionsPanel = {
    init() {
        this._collisions    = _('.Collisions');
        this._tiles         = this._collisions.querySelectorAll('div');

        for (var tile of this._tiles) {
            tile.addEventListener('click', e => this.selectTile(e));
        }
    },

    selectTile(e) {
        let clicked = e.target;
        let idx     = UI.getIndex(this._tiles, clicked);

        for (var tile of this._tiles) {
            tile.classList.remove('isActive');
        }

        clicked.classList.add('isActive');

        UI.toPlace              = 'collision';
        UI.selectedCollision    = idx;
    }
}
