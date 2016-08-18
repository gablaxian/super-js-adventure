
'use strict';

UI.TilesetsPanel = {
    init(tilesets) {
        this._tiles     = _('.Tiles');
        this._tilesets  = null;
        this._marker    = _('.Tiles .marker');

        this.loadTilesets();

        this._tilesets  = this._tiles.querySelectorAll('img');

        for (var tileset of this._tilesets) {
            tileset.addEventListener('mousedown', e => this.selectTile(e));
        }
    },

    loadTilesets() {
        const _ul = document.createElement('ul');

        // when each image load promise is fulfilled, as it to the tilesets panel.
        for(var sprite of Global.tilesetsArray) {
            let _li = document.createElement('li');

            sprite.scale(3);

            _li.appendChild(sprite.img);
            _ul.appendChild(_li);
        }
        this._tiles.appendChild(_ul);
    },

    selectTile(e) {
        // console.log(e);
        let idx = UI.getIndex(this._tiles.querySelectorAll('img'), e.target);

        const sprite    = Global.tilesetsArray[idx];

        UI.toPlace      = 'tile';
        UI.selectedTile = sprite.pxToCell(e.offsetX, e.offsetY);

        // console.log('selecting tile...', UI.selectedTile, sprite.GID);

        // takes the new selected tile cell number and gets its rounded x and y values.
        const coords    = sprite.cellToPx(UI.selectedTile);

        this._marker.style.display   = 'block';
        this._marker.style.top       = coords.y  * sprite._scale + 'px';
        this._marker.style.left      = coords.x  * sprite._scale + 'px';
        this._marker.style.width     = 8 * sprite._scale + 'px';
        this._marker.style.height    = 8 * sprite._scale + 'px';
    }
}
