/**
    Pattern

    Groups of tiles, stored as both the data array and the canvas image.
    Patterns assume that the data will all be related to the same Tileset.

 */

'use strict';

let Pattern = {

    init(tilesetName, data) {
        this.tilesetName    = tilesetName;
        this.data           = data.reduce((a, b) => a.concat(b), []).sort();
        this.scaleValue     = 3;

        this.sprite         = Utils.getTilesetByName(tilesetName);

        this.startTileIdx   = this.data[0];
        this.endTileIdx     = this.data[(this.data.length - 1)];

        //
        this.extrapolateEndPoints();

        this.WIDTH          = this.TILES_WIDE * Global.TILE_SIZE;
        this.HEIGHT         = this.TILES_HIGH * Global.TILE_SIZE;

        this.canvas         = document.createElement('canvas');
        this.context        = this.canvas.getContext('2d');

        this.canvas.width   = this.WIDTH;
        this.canvas.height  = this.HEIGHT;

        this.scale(3);

        return this;
    },

    // We need to take into account that the start and end tiles may be on any given corner of a rectangle. i.e. dragging from bottom-left, bottom-right, etc...
    extrapolateEndPoints() {
        // based on the atlas' dimensions, figure out the rows and columns from the start and end tiles provided.
        let { row: row1, col: col1 } = this.sprite.idxToCell(this.startTileIdx);
        let { row: row2, col: col2 } = this.sprite.idxToCell(this.endTileIdx);

        let topLeftCoords       = { row: Math.min(row1, row2), col: Math.min(col1, col2) };
        let bottomRightCoords   = { row: Math.max(row1, row2), col: Math.max(col1, col2) };

        this.TILES_WIDE     = Math.abs(col2 - col1) + 1;
        this.TILES_HIGH     = Math.abs(row2 - row1) + 1;

        let newData = [];

        for (var i = topLeftCoords.row; i < (topLeftCoords.row + this.TILES_HIGH); i++) {
            for (var j = topLeftCoords.col; j < (topLeftCoords.col + this.TILES_WIDE); j++) {
                newData.push( this.sprite.cellCoordsToIdx(i,j) );
            }
        }

        this.data = newData;
    },

    scale(scale) {
        this.scaleValue    = scale;

        this.SCALED_WIDTH  = this.WIDTH * scale;
        this.SCALED_HEIGHT = this.HEIGHT * scale;

        this.canvas.style['width']  = this.SCALED_WIDTH + 'px';
        this.canvas.style['height'] = this.SCALED_HEIGHT + 'px';
    },

    render() {
        let coords          = {};
        let spriteCoords    = {};

        for (let row = 0; row < this.TILES_HIGH; row++) {
            for (let col = 0; col < this.TILES_WIDE; col++) {

                let cell        = (row * this.TILES_WIDE) + col;
                let tile        = this.data[cell];
                spriteCoords    = this.sprite.cellToPx(tile);

                this.context.drawImage(this.sprite.img, spriteCoords.x, spriteCoords.y, 8, 8, (col * 8), (row * 8), 8, 8);
            }
        }
    }
}
