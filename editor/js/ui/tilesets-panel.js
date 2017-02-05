
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
        // when each image load promise is fulfilled, as it to the tilesets panel.
        for(var sprite of Global.tilesetsArray) {
            let _div    = document.createElement('div');
            let _span   = document.createElement('span');
            let _text   = document.createTextNode(sprite.name);

            sprite.scale(3);

            _div.appendChild(sprite.img);
            _span.appendChild(_text);

            this._tiles.appendChild(_span);
            this._tiles.appendChild(_div);
        }
    },

    selectTile(e) {
        // find the number of the image tag which was clicked.
        let idx         = UI.getIndex(this._tiles.querySelectorAll('img'), e.target);

        // calculate its offset relative to the tiles bounding box.
        let parentTop   = _('.Tiles').getBoundingClientRect().top;
        let imgTop      = this._tilesets[idx].getBoundingClientRect().top;
        let offSet      = (imgTop - parentTop);

        const sprite    = Global.tilesetsArray[idx];

        UI.toPlace      = 'tile';
        UI.selectedTile = sprite.pxToCell(e.offsetX, e.offsetY);

        // takes the new selected tile cell number and gets its rounded x and y values.
        let relativeTileID = UI.selectedTile - sprite.GID;
        const coords    = sprite.cellToPx(relativeTileID);

        // set the ghost tile
        Viewport.updateGhostTile((idx+1), [[relativeTileID]]);

        // move the marker to the correct position and add the index number of the selected tile.
        this._marker.style.display   = 'block';
        this._marker.style.top       = offSet + coords.y  * sprite._scale + 'px';
        this._marker.style.left      = coords.x  * sprite._scale + 'px';
        this._marker.style.width     = 8 * sprite._scale + 'px';
        this._marker.style.height    = 8 * sprite._scale + 'px';

        this._marker.innerHTML = relativeTileID;
    }
}
