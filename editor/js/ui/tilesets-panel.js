
'use strict';

UI.TilesetsPanel = {

    init(tilesets) {
        this.container          = _('.Tiles');
        this.marker             = Object.create(Marker).init();

        this.tilesets           = [];
        this.isDragging         = false;

        this.currentTileset     = '';
        this.startTileIdx       = 0;
        this.endTileIdx         = 0;
        this.selectedIndexes    = [0,0];

        // add marker
        this.container.appendChild(this.marker.elm);

        this.loadTilesets();
        this.setupEvents();
    },

    loadTilesets() {
        this.tilesets = [];

        for(var sprite of Global.tilesetsArray) {
            let _div    = document.createElement('div');
            let _span   = document.createElement('span');
            let _text   = document.createTextNode(sprite.name);

            sprite.scale(3);

            _div.appendChild(sprite.img);
            _span.appendChild(_text);

            this.container.appendChild(_span);
            this.container.appendChild(_div);

            this.tilesets.push(sprite.img);
        }
    },

    setupEvents() {
        for (var tileset of this.tilesets) {
            tileset.addEventListener('mousedown', e => {
                let tIdx = UI.getIndex(this.container.querySelectorAll('img'), e.target);

                this.currentTileset     = Global.tilesetsArray[tIdx];
                this.startTileIdx       = this.getTileIndex(e);
                this.endTileIdx         = this.startTileIdx;
                this.selectedIndexes    = [this.startTileIdx, this.endTileIdx];
                this.isDragging         = true;
                console.log(this.endTileIdx);
                this.selectTiles(e);

            });

            tileset.addEventListener('mouseup', e => {
                this.isDragging     = false;

                let pattern         = Object.create(Pattern).init(this.currentTileset.name, this.selectedIndexes);
                pattern.render();

                UI.toPlace          = 'pattern';
                UI.selectedPattern  = pattern;

                Viewport.updateGhostTile();
                Eventer.dispatch('patternSelected');
            });

            tileset.addEventListener('mousemove', e => {
                if( this.isDragging ) {
                    e.preventDefault(); // prevent dragging of image

                    this.endTileIdx         = this.getTileIndex(e);
                    this.selectedIndexes    = [this.startTileIdx, this.endTileIdx].sort();
                    this.selectTiles(e);
                }
            });
        }
    },

    selectTiles(e) {
        let sprite          = this.currentTileset;

        // takes the new selected tile cell number and gets its rounded x and y values.
        let startCoords     = sprite.cellToPx(this.startTileIdx);
        let endCoords       = sprite.cellToPx(this.endTileIdx);

        let selectedWidth   = (endCoords.x - startCoords.x) + Global.TILE_SIZE;
        let selectedHeight  = (endCoords.y - startCoords.y) + Global.TILE_SIZE;

        // calculate its offset relative to the tiles bounding box.
        let parentTop       = this.container.getBoundingClientRect().top;
        let imgTop          = this.currentTileset.img.getBoundingClientRect().top;
        let offSet          = (imgTop - parentTop);

        UI.deselectAll();

        this.marker.render((offSet + startCoords.y * sprite._scale), (startCoords.x * sprite._scale), selectedWidth, selectedHeight);
        this.marker.show();
    },

    getTileIndex(e) {
        // takes the new selected tile cell number and gets its rounded x and y values.
        return this.currentTileset.pxToCell(e.offsetX, e.offsetY);
    },

    deselect() {
        this.marker.hide();
    }
}
